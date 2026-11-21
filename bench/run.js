'use strict';
/*
 * Benchmark: runs detect() over the labelled synthetic notes and prints
 * recall and precision per entity type, per language and per split.
 *
 *   Recall    = share of labelled entities that are FULLY covered by detected
 *               spans (any type). A partly covered name (surname leaked) is a
 *               miss. This is the leak measure.
 *   Precision = share of detected spans that overlap a labelled entity of the
 *               same type.
 *
 * Usage: node bench/run.js [--misses]
 */
const { detect } = require('../src/detect.js');
const { build } = require('./notes-src.js');

function covered(gold, preds, text) {
  for (let i = gold.start; i < gold.end; i++) {
    if (/\s/.test(text[i])) continue;
    if (!preds.some((p) => i >= p.start && i < p.end)) return false;
  }
  return true;
}

function score(notes, opts) {
  const rows = [];
  for (const n of notes) {
    const preds = detect(n.text, opts);
    for (const g of n.entities) {
      rows.push({ kind: 'gold', note: n, e: g, hit: covered(g, preds, n.text) });
    }
    for (const p of preds) {
      const ok = n.entities.some((g) => g.type === p.type && p.start < g.end && p.end > g.start);
      rows.push({ kind: 'pred', note: n, e: p, ok });
    }
  }
  return rows;
}

function summarise(rows, keyFn) {
  const groups = {};
  for (const r of rows) {
    const k = keyFn(r);
    const g = (groups[k] = groups[k] || { gold: 0, hit: 0, pred: 0, ok: 0 });
    if (r.kind === 'gold') { g.gold++; if (r.hit) g.hit++; } else { g.pred++; if (r.ok) g.ok++; }
  }
  return groups;
}

const pct = (a, b) => (b ? (100 * a / b).toFixed(1).padStart(5) + '%' : '    - ');
function table(title, groups, order) {
  const lines = [title, 'group'.padEnd(14) + 'gold'.padStart(6) + 'found'.padStart(7) + '  recall' + 'preds'.padStart(7) + ' correct' + ' precision'];
  for (const k of order || Object.keys(groups)) {
    const g = groups[k];
    if (!g) continue;
    lines.push(k.padEnd(14) + String(g.gold).padStart(6) + String(g.hit).padStart(7) + '  ' + pct(g.hit, g.gold) +
      String(g.pred).padStart(7) + String(g.ok).padStart(8) + '  ' + pct(g.ok, g.pred));
  }
  return lines.join('\n');
}

function report(showMisses) {
  const notes = build();
  const rows = score(notes);
  const strictRows = score(notes, { strict: true });
  const cueRows = score(notes, { noGazetteer: true });
  const out = [];
  const total = (f) => summarise(rows.filter(f), () => 'ALL').ALL;
  out.push(`notes: ${notes.length} (${['en', 'fr', 'ar'].map((l) => l + ' ' + notes.filter((n) => n.lang === l).length).join(', ')}), labelled entities: ${rows.filter((r) => r.kind === 'gold').length}`);
  out.push('');
  out.push(table('RECALL AND PRECISION, ALL NOTES, BY ENTITY TYPE', { ...summarise(rows, (r) => r.e.type), ALL: total(() => true) },
    ['PERSON', 'PHONE', 'EMAIL', 'IBAN', 'DOB', 'ID', 'CASE', 'ALL']));
  out.push('');
  out.push(table('BY LANGUAGE', summarise(rows, (r) => r.note.lang), ['en', 'fr', 'ar']));
  out.push('');
  out.push(table('BY SPLIT (dev = tuned on; heldout = scored before tuning, a few generic fixes after; stress = written after tuning, never tuned on)', summarise(rows, (r) => r.note.split), ['dev', 'heldout', 'stress']));
  out.push('');
  const byLangType = summarise(rows, (r) => r.note.lang + ' ' + r.e.type);
  out.push(table('BY LANGUAGE AND TYPE', byLangType,
    ['en', 'fr', 'ar'].flatMap((l) => ['PERSON', 'PHONE', 'EMAIL', 'IBAN', 'DOB', 'ID', 'CASE'].map((t) => l + ' ' + t).filter((k) => byLangType[k]))));
  out.push('');
  out.push(table('PERSON ONLY, BY LANGUAGE AND SPLIT', summarise(rows.filter((r) => r.e.type === 'PERSON'), (r) => r.note.lang + ' ' + r.note.split),
    ['en dev', 'en heldout', 'en stress', 'fr dev', 'fr heldout', 'fr stress', 'ar dev', 'ar heldout', 'ar stress']));
  out.push('');
  const strictAll = summarise(strictRows, (r) => r.note.lang);
  const strictPerson = summarise(strictRows.filter((r) => r.e.type === 'PERSON'), (r) => r.note.lang + ' ' + r.note.split);
  out.push(table('STRICT MODE (also redact every capitalised word that does not start a sentence), ALL TYPES, BY LANGUAGE', strictAll, ['en', 'fr', 'ar']));
  out.push('');
  out.push(table('STRICT MODE, PERSON ONLY, STRESS SPLIT', strictPerson, ['en stress', 'fr stress', 'ar stress']));
  out.push('');
  const cueOnly = summarise(cueRows.filter((r) => r.e.type === 'PERSON'), (r) => r.note.split);
  out.push(table('NAME LIST SWITCHED OFF (cues, repeat finding and patterns only), PERSON ONLY, BY SPLIT', cueOnly, ['dev', 'heldout', 'stress']));
  if (showMisses) {
    out.push('');
    out.push('MISSED (leaks):');
    for (const r of rows.filter((x) => x.kind === 'gold' && !x.hit)) out.push(`  ${r.note.id} [${r.note.split}] ${r.e.type}: ${r.e.text}`);
    out.push('');
    out.push('FALSE POSITIVES (wrong span or type):');
    for (const r of rows.filter((x) => x.kind === 'pred' && !x.ok)) out.push(`  ${r.note.id} [${r.note.split}] ${r.e.type}: ${r.e.text}  (${r.e.source})`);
  }
  return out.join('\n');
}

if (require.main === module) console.log(report(process.argv.includes('--misses')));
module.exports = { score, summarise, report };
