/*
 * Detection of personal data in free text. No DOM, no network, no storage:
 * it takes a string and returns spans. Runs under Node (tests, benchmark)
 * and in the browser as a plain script.
 *
 * detect(text, { extraNames: string[], manual: [{ text, type }] })
 *   -> [{ start, end, type, text, key, source }]   sorted, non-overlapping
 *
 * Types: PERSON PHONE EMAIL IBAN DOB ID CASE OTHER
 *
 * CASE numbers use a FICTIONAL format invented for this project:
 *   CS-<year>-<4-6 digits>    social work case file     CS-2026-004817
 *   HL-<year>-<4-6 digits>    hotline complaint         HL-2026-000312
 *   FAM-<year>-<4-6 digits>   family registration       FAM-2026-01234
 * No real organization uses these formats.
 */
(function () {
  'use strict';

  const G = (typeof module !== 'undefined' && module.exports)
    ? require('./gazetteer.js')
    : globalThis.PG.gazetteer;

  const TYPES = ['PERSON', 'PHONE', 'EMAIL', 'IBAN', 'DOB', 'ID', 'CASE', 'OTHER'];
  const PRIORITY = { EMAIL: 1, IBAN: 2, CASE: 3, DOB: 4, ID: 5, PHONE: 6, PERSON: 7, OTHER: 8 };

  // ---------- normalisation ----------

  // Arabic-Indic and Persian digits to ASCII. Same length, so offsets survive.
  function normDigits(s) {
    return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (c) => {
      const code = c.charCodeAt(0);
      return String(code >= 0x06F0 ? code - 0x06F0 : code - 0x0660);
    });
  }
  function latNorm(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['\u2019]/g, '');
  }
  function arNorm(s) {
    return s.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
      .replace(/\u0649/g, '\u064A')
      .replace(/\u0629/g, '\u0647');
  }
  const isArabicTok = (s) => /[\u0600-\u06FF]/.test(s);
  const normTok = (s) => (isArabicTok(s) ? arNorm(s) : latNorm(s));

  // ---------- gazetteer sets (built once) ----------

  const LAT_NAMES = new Set();
  const AR_NAMES = new Set();
  const AMB_AR = new Set(G.ar.ambiguousAr.map(arNorm));
  const AMB_LAT = new Set(G.ar.ambiguousLat);
  const STOP_LAT = new Set(G.stopLat.map(latNorm));
  const STOP_AR = new Set(G.stopAr.map(arNorm));
  for (const lang of ['en', 'fr', 'ar']) {
    for (const w of G[lang].given) if (w) LAT_NAMES.add(latNorm(w));
    for (const w of G[lang].family) if (w) LAT_NAMES.add(latNorm(w));
  }
  for (const w of G.ar.givenAr) if (w) AR_NAMES.add(arNorm(w));
  for (const w of G.ar.familyAr) if (w) AR_NAMES.add(arNorm(w));
  for (const w of G.ar.ambiguousAr) AR_NAMES.add(arNorm(w));

  // Particles that belong to a name: Al-Masri, El Hajj, Abou Elias, Abi Nader, Bou Khalil, Abdel Nasser, ابن, أبو, بو.
  const CONN_PRE = new Set(['al', 'el', 'abu', 'abou', 'bou', 'abi', 'bin', 'ibn', 'ben', 'umm', 'oum', 'om',
    'abd', 'abdel', 'abdul', 'abdal',
    '\u0628\u0646', '\u0627\u0628\u0646', '\u0628\u0646\u062A', '\u0627\u0644', '\u0622\u0644',
    '\u0627\u0628\u0648', '\u0627\u0628\u064A', '\u0628\u0648', '\u0627\u0645']
    .map(normTok));
  const CONN_MID = new Set(['de', 'del', 'la', 'da', 'di']);
  const CONN_ALL = new Set([...CONN_PRE, ...CONN_MID]);

  // ---------- tokens ----------

  function tokenize(text) {
    const re = /[\p{L}\p{M}][\p{L}\p{M}'\u2019]*/gu;
    const out = [];
    let m;
    while ((m = re.exec(text))) {
      let raw = m[0];
      if (/['\u2019]s$/i.test(raw) && raw.length > 3 && !isArabicTok(raw)) raw = raw.slice(0, -2); // Khaled's -> Khaled
      const ar = isArabicTok(raw);
      out.push({
        s: m.index, e: m.index + raw.length, raw, ar,
        cap: !ar && /^\p{Lu}/u.test(raw),
        title: !ar && /^\p{Lu}[\p{Ll}\p{M}'\u2019]*$/u.test(raw),
        norm: ar ? arNorm(raw) : latNorm(raw),
        kind: null, s2: m.index,
      });
    }
    return out;
  }

  function arLookup(t) {
    let w = t.norm;
    if (AR_NAMES.has(w)) return { amb: AMB_AR.has(w), s2: t.s };
    // "the owner" is a noun, not a name
    if (w === 'المالك') return null;
    if (w.startsWith('\u0627\u0644') && AR_NAMES.has(w.slice(2))) return { amb: AMB_AR.has(w.slice(2)), s2: t.s };
    // single-letter prefix: and / with / for / so / like
    if (t.raw[0] === '\u0648' && w.length >= 4) {
      let r = w.slice(1);
      if (r.startsWith('\u0627\u0644') && r.length > 4) r = r.slice(2);
      if (AR_NAMES.has(r)) return { amb: true, s2: t.s + 1, prefixed: true, ambLoose: !AMB_AR.has(r) };
    }
    return null;
  }

  function markTokens(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.ar) {
        const hit = arLookup(t);
        if (hit) {
          // "and Fatima" (one-letter prefix w) is a name; other prefixes need company: لدينا means "we have"
          t.kind = hit.amb && !(hit.ambLoose && t.raw[0] === 'و') ? 'amb' : 'name';
          t.s2 = hit.s2;
        } else if (CONN_PRE.has(t.norm)) t.kind = 'conn';
        // "Imad al-Din", "Salah al-Din": a name ending in الدين behaves as one name
        if (tokens[i + 1] && tokens[i + 1].ar && tokens[i + 1].norm === 'الدين' && !isStopAr(t) && t.norm.length >= 3) {
          t.kind = 'name'; tokens[i + 1].kind = 'name';
        }
        // compound "Abd al-X": the two words behave as one name
        if (t.norm === '\u0639\u0628\u062F' && tokens[i + 1] && tokens[i + 1].ar &&
            tokens[i + 1].norm.startsWith('\u0627\u0644') && tokens[i + 1].norm.length <= 10) {
          t.kind = 'name'; tokens[i + 1].kind = 'name';
        }
      } else {
        if (t.cap && LAT_NAMES.has(t.norm)) t.kind = AMB_LAT.has(t.norm) ? 'amb' : 'name';
        else if (CONN_ALL.has(t.norm)) t.kind = 'conn';
      }
    }
  }

  const isNameish = (t) => t.kind === 'name' || t.kind === 'amb' || t.kind === 'conn';

  function adjacent(text, a, b) {
    return /^[ \u00a0-]$/.test(text.slice(a.e, b.s));
  }
  function sentenceStart(text, pos) {
    let k = pos - 1;
    while (k >= 0 && (text[k] === ' ' || text[k] === '\t' || text[k] === '"' || text[k] === '\u201C' || text[k] === '(' || text[k] === "'")) k--;
    return k < 0 || /[.!?:;\n\r\u061F\u2022*\-]/.test(text[k]);
  }
  const isStopLat = (t) => STOP_LAT.has(t.norm);
  // "علي" (Ali) and "على" (on) normalise to the same letters; only the second is a stop word
  const isStopAr = (t) => STOP_AR.has(t.norm) && t.raw.replace(/[ً-ٟ]/g, '') !== 'علي';

  // ---------- person: gazetteer runs ----------

  function gazetteerRuns(text, tokens, spans) {
    const n = tokens.length;
    let i = 0;
    while (i < n) {
      if (!isNameish(tokens[i])) { i++; continue; }
      let j = i;
      while (j + 1 < n && isNameish(tokens[j + 1]) && adjacent(text, tokens[j], tokens[j + 1])) j++;
      let a = i, b = j;
      while (b >= a && tokens[b].kind === 'conn') b--;
      while (a <= b && tokens[a].kind === 'conn' && CONN_MID.has(tokens[a].norm)) a++;
      i = j + 1;
      if (b < a) continue;
      // connectors in the middle must sit between two names
      const nm = tokens.slice(a, b + 1).filter((t) => t.kind === 'name').length;
      const amb = tokens.slice(a, b + 1).filter((t) => t.kind === 'amb').length;
      if (nm < 1 && amb < 2) continue;
      const latin = !tokens[a].ar;
      if (latin) {
        // grow by one capitalised unknown word each way: "Hanan Zahlawi"
        const nx = tokens[b + 1];
        if (nx && adjacent(text, tokens[b], nx) && nx.title && !isStopLat(nx) && !nx.kind && nx.raw.length > 2) b++;
        const pv = tokens[a - 1];
        if (pv && adjacent(text, pv, tokens[a]) && pv.title && !isStopLat(pv) && !pv.kind && pv.raw.length > 2 &&
            !sentenceStart(text, pv.s)) a--;
      }
      spans.push({ start: tokens[a].s2, end: tokens[b].e, type: 'PERSON', source: 'gazetteer' });
    }
  }

  // ---------- person: cues ----------

  function capCapture(text, tokens, idx) {
    const t0 = tokens[idx];
    if (!t0 || t0.ar || !t0.cap || isStopLat(t0) || t0.raw.length < 2) return null;
    let b = idx, count = 1;
    while (b + 1 < tokens.length && count < 4 && adjacent(text, tokens[b], tokens[b + 1])) {
      const t = tokens[b + 1];
      if (t.cap && !t.ar && !isStopLat(t) && t.raw.length > 1 && (t.title || t.raw === t.raw.toUpperCase())) { b++; count++; continue; }
      if (!t.cap && CONN_ALL.has(t.norm) && tokens[b + 2] && adjacent(text, t, tokens[b + 2]) &&
          tokens[b + 2].cap && !isStopLat(tokens[b + 2])) { b += 2; count += 2; continue; }
      break;
    }
    return { a: idx, b };
  }

  // crude "looks like a verb" test for words that are not in the gazetteer
  function verbLike(t) {
    if (t.kind) return false;
    const w = t.norm;
    return (w.length >= 4 && 'يتن'.includes(w[0])) || (w.length >= 4 && w.endsWith('ت'));
  }

  function arCapture(text, tokens, idx, needHit, extra) {
    const t0 = tokens[idx];
    if (!t0 || !t0.ar || t0.norm.length < 2 || isStopAr(t0)) return null;
    const hit = t0.kind === 'name' || t0.kind === 'amb';
    if (needHit && !hit) return null;
    if (!hit && (t0.norm.startsWith('ال') || verbLike(t0))) return null; // "the director", a verb
    let b = idx, count = 1;
    while (b + 1 < tokens.length && count < 4 && adjacent(text, tokens[b], tokens[b + 1])) {
      const t = tokens[b + 1];
      if (t.kind === 'name' || t.kind === 'amb') { b++; count++; continue; }
      if (t.kind === 'conn' && tokens[b + 2] && adjacent(text, t, tokens[b + 2]) &&
          tokens[b + 2].ar && !isStopAr(tokens[b + 2]) &&
          (tokens[b + 2].kind || !tokens[b + 2].norm.startsWith('ال'))) { b += 2; count += 2; continue; }
      break;
    }
    // formal cues (السيد ...): one more unknown word is usually the family name
    if (extra && b + 1 < tokens.length && adjacent(text, tokens[b], tokens[b + 1])) {
      const t = tokens[b + 1];
      if (t.ar && !t.kind && !isStopAr(t) && !t.norm.startsWith('ال') && !verbLike(t) &&
          t.norm.length >= 3 && t.norm.length <= 9) b++;
    }
    return { a: idx, b };
  }

  const LAT_TITLES = '(?<![\\p{L}])(?:Mr|Mrs|Ms|Mx|Miss|Dr|Prof|Mme|Mlle|Sheikh|Sheikha|Monsieur|Madame|Mademoiselle|Docteur|Docteure|Ma\u00EEtre|Imam|Father|P\u00E8re|Sister|S\u0153ur|Soeur|Abb\u00E9|Abouna|Hajj|Hajje|Hajja|Haj|Sitt|Sayyed|Sayyida|Mouallem|Ustaz|Ostez|Oustez)(?![\\p{L}])\\.?|(?<![\\p{L}])M\\.';
  const LAT_REL = '(?<![\\p{L}])(?:(?:son|daughter|wife|husband|widow|widower|mother|father|brother|sister|cousin|uncle|aunt|nephew|niece|spouse|guardian|partner|child|grandmother|grandfather) of|fils de|fille de|\u00E9pouse de|epouse de|femme de|mari de|veuve de|veuf de|m\u00E8re de|p\u00E8re de|fr\u00E8re de|s\u0153ur de|soeur de|cousin de|cousine de|oncle de|tante de|conjoint de|tuteur de|n\u00E9e|nee|alias|known as|a\\.k\\.a\\.?|called|named|nomm\u00E9e?|appel\u00E9e?|d\u00E9nomm\u00E9e?)(?![\\p{L}])';
  const LAT_KIN = '(?<![\\p{L}])(?:son|daughter|wife|husband|mother|father|brother|sister|cousin|uncle|aunt|nephew|niece|neighbou?r|friend|ward|child|spouse|partner|colleague|patient|beneficiary|client|caller|applicant|complainant|landlord|tenant|owner|driver|doctor|nurse|fils|fille|\u00E9pouse|epouse|femme|mari|m\u00E8re|p\u00E8re|fr\u00E8re|s\u0153ur|soeur|cousine|oncle|tante|voisine?|amie?|enfant|coll\u00E8gue|b\u00E9n\u00E9ficiaire|patiente|plaignante?|demandeur|demandeuse|propri\u00E9taire|locataire|chauffeur|m\u00E9decin|infirmi\u00E8re|infirmier)(?![\\p{L}])\\s*,?\\s*';
  const LAT_KUNYA = '(?<![\\p{L}])(?:Abu|Abou|Umm|Oum|Om|Bou|Abi)(?![\\p{L}])';
  const LAT_LABEL = '(?<![\\p{L}])(?:name|nom|beneficiary|b\u00E9n\u00E9ficiaire|client|patient|head of household|chef de m\u00E9nage|chef de famille|complainant|plaignante?|applicant|demandeur|demandeuse|caller|appelant|appelante|interviewee|informant|contact person|focal point|caseworker|case worker|landlord|tenant|owner|propri\u00E9taire|locataire|officer|supervisor|interpreter|interpr\u00E8te|reporter|guardian|tuteur|mother|father|m\u00E8re|p\u00E8re)\\s*[:\uFF1A]\\s*';

  const AR_P = '[\u0648\u0628\u0644\u0641\u0643]?';
  const AR_TITLES = `(?<![\\p{L}])${AR_P}(?:السيدة|السيد|الآنسة|الانسة|الأستاذة|الأستاذ|الاستاذة|الاستاذ|الدكتورة|الدكتور|الشيخة|الشيخ|الحاجة|الحاج|المدعو|المدعوة|المواطنة|المواطن|عائلة|المعلم|المعلمة|أبونا|الخوري|الأب)(?![\\p{L}])`;
  const AR_REL = `(?<![\\p{L}])${AR_P}(?:ابنته|ابنتها|بنته|بنتها|زوجته|زوجتها|والدته|والدتها|أخته|اخته|أختها|اختها|شقيقته|شقيقتها|جارته|جارتها|ابنه|ابنها|زوجها|والده|والدها|أخوه|اخوه|أخوها|اخوها|أخيه|أخيها|جاره|جارها|ابنة|ابن|بنت|زوجة|زوج|والدة|والد|أخت|اخت|أخ|اخ|شقيقة|شقيق|جارة|جار|الجارة|الجار|الأرملة|الارملة)(?![\\p{L}])`;
  const AR_ROLE = `(?<![\\p{L}])${AR_P}(?:المريضة|المريض|المستفيدة|المستفيد|المتصلة|المتصل|الشاكية|الشاكي|السائق|المالك|المالكة|المستأجر|المستأجرة|الطبيب|الطبيبة|الممرضة|الحارس)(?![\\p{L}])`;
  const AR_KUNYA = '(?<![\\p{L}])(?:\u0623\u0628\u0648|\u0627\u0628\u0648|\u0623\u0645|\u0627\u0645)(?![\\p{L}])';
  const AR_LABEL = '(?<![\\p{L}])(?:\u0627\u0644\u0627\u0633\u0645|\u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F|\u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F\u0629|\u0627\u0644\u0645\u062A\u0635\u0644|\u0627\u0644\u0645\u062A\u0635\u0644\u0629|\u0645\u0642\u062F\u0645 \u0627\u0644\u0637\u0644\u0628|\u0645\u0642\u062F\u0645\u0629 \u0627\u0644\u0637\u0644\u0628|\u0627\u0644\u0634\u0627\u0643\u064A|\u0627\u0644\u0634\u0627\u0643\u064A\u0629|\u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629)\\s*[:\uFF1A]\\s*';

  function tokenAtOrAfter(tokens, pos, from) {
    // first token starting at/after pos, only spaces/tabs between
    let lo = from || 0;
    for (let k = lo; k < tokens.length; k++) if (tokens[k].s >= pos) return k;
    return -1;
  }

  function cuePersons(text, tokens, spans) {
    const run = (src, ar, needHit, minGap, flags, extra, withCue) => {
      const re = new RegExp(src, flags || 'gu');
      let m;
      while ((m = re.exec(text))) {
        const end = m.index + m[0].length;
        const k = tokenAtOrAfter(tokens, end);
        if (k < 0) continue;
        const gap = text.slice(end, tokens[k].s);
        if (!/^[ \t\u00a0]*$/.test(gap) || (minGap && gap.length === 0 && !/\s$/.test(m[0]))) continue;
        const cap = ar ? arCapture(text, tokens, k, needHit, extra) : capCapture(text, tokens, k);
        if (cap) spans.push({ start: withCue ? m.index : tokens[cap.a].s2, end: tokens[cap.b].e, type: 'PERSON', source: 'cue' });
      }
    };
    run(LAT_TITLES, false, false, true);
    run(LAT_REL, false, false, true, 'giu');
    run(LAT_LABEL, false, false, false, 'giu');
    run(LAT_KIN, false, false, false, 'giu');
    run(LAT_KUNYA, false, false, true, 'gu', false, true);
    run(AR_TITLES, true, false, true, 'gu', true);
    run(AR_ROLE, true, false, true, 'gu', true);
    run(AR_REL, true, false, true);
    run(AR_KUNYA, true, true, true, 'gu', false, true);
    run(AR_LABEL, true, false, false);
  }

  // ---------- user-supplied names and manual selections ----------

  function termMatches(text, tokens, term) {
    const out = [];
    const t = term.trim();
    if (!t) return out;
    if (/^[\p{L}\p{M}'\u2019 \-]+$/u.test(t)) {
      const want = tokenize(t).map((x) => x.norm);
      if (!want.length) return out;
      for (let i = 0; i + want.length <= tokens.length; i++) {
        let ok = true;
        for (let k = 0; k < want.length && ok; k++) {
          ok = tokens[i + k].norm === want[k] && (k === 0 || adjacent(text, tokens[i + k - 1], tokens[i + k]));
        }
        if (ok) out.push([tokens[i].s, tokens[i + want.length - 1].e]);
      }
    } else {
      const hay = text.toLowerCase();
      const needle = t.toLowerCase();
      let p = 0;
      while ((p = hay.indexOf(needle, p)) !== -1) { out.push([p, p + needle.length]); p += needle.length; }
    }
    return out;
  }

  // ---------- pattern detectors ----------

  const MONTHS = 'jan(?:uary|\\.)?|feb(?:ruary|\\.)?|mar(?:ch|\\.)?|apr(?:il|\\.)?|may|jun(?:e|\\.)?|jul(?:y|\\.)?|aug(?:ust|\\.)?|sep(?:t(?:ember)?|\\.)?|oct(?:ober|\\.)?|nov(?:ember|\\.)?|dec(?:ember|\\.)?|' +
    'janvier|janv\\.?|f\u00E9vrier|fevrier|f\u00E9vr\\.?|mars|avril|mai|juin|juillet|juil\\.?|ao\u00FBt|aout|septembre|octobre|novembre|d\u00E9cembre|decembre|' +
    '\u064A\u0646\u0627\u064A\u0631|\u0641\u0628\u0631\u0627\u064A\u0631|\u0645\u0627\u0631\u0633|\u0623\u0628\u0631\u064A\u0644|\u0627\u0628\u0631\u064A\u0644|\u0645\u0627\u064A\u0648|\u064A\u0648\u0646\u064A\u0648|\u064A\u0648\u0644\u064A\u0648|\u0623\u063A\u0633\u0637\u0633|\u0627\u063A\u0633\u0637\u0633|\u0633\u0628\u062A\u0645\u0628\u0631|\u0623\u0643\u062A\u0648\u0628\u0631|\u0627\u0643\u062A\u0648\u0628\u0631|\u0646\u0648\u0641\u0645\u0628\u0631|\u062F\u064A\u0633\u0645\u0628\u0631|' +
    '\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A|\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644|\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0627\u0648\u0644|\u0634\u0628\u0627\u0637|\u0622\u0630\u0627\u0631|\u0627\u0630\u0627\u0631|\u0646\u064A\u0633\u0627\u0646|\u0623\u064A\u0627\u0631|\u0627\u064A\u0627\u0631|\u062D\u0632\u064A\u0631\u0627\u0646|\u062A\u0645\u0648\u0632|\u0622\u0628|\u0623\u064A\u0644\u0648\u0644|\u0627\u064A\u0644\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0627\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A';
    'janvier|janv\\.?|f\u00E9vrier|fevrier|f\u00E9vr\\.?|mars|avril|mai|juin|juillet|juil\\.?|ao\u00FBt|aout|septembre|octobre|novembre|d\u00E9cembre|decembre|' +
    'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|' +
    '\u064A\u0646\u0627\u064A\u0631|\u0641\u0628\u0631\u0627\u064A\u0631|\u0645\u0627\u0631\u0633|\u0623\u0628\u0631\u064A\u0644|\u0627\u0628\u0631\u064A\u0644|\u0645\u0627\u064A\u0648|\u064A\u0648\u0646\u064A\u0648|\u064A\u0648\u0644\u064A\u0648|\u0623\u063A\u0633\u0637\u0633|\u0627\u063A\u0633\u0637\u0633|\u0633\u0628\u062A\u0645\u0628\u0631|\u0623\u0643\u062A\u0648\u0628\u0631|\u0627\u0643\u062A\u0648\u0628\u0631|\u0646\u0648\u0641\u0645\u0628\u0631|\u062F\u064A\u0633\u0645\u0628\u0631|' +
    '\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A|\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644|\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0627\u0648\u0644|\u0634\u0628\u0627\u0637|\u0622\u0630\u0627\u0631|\u0627\u0630\u0627\u0631|\u0646\u064A\u0633\u0627\u0646|\u0623\u064A\u0627\u0631|\u0627\u064A\u0627\u0631|\u062D\u0632\u064A\u0631\u0627\u0646|\u062A\u0645\u0648\u0632|\u0622\u0628|\u0623\u064A\u0644\u0648\u0644|\u0627\u064A\u0644\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0627\u0648\u0644|\u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A|' +
    'januari|februari|machi|aprili|mei|juni|julai|agosti|septemba|oktoba|novemba|desemba';
  const DATE = `(?:\\d{1,2}[\\/.\\-]\\d{1,2}[\\/.\\-]\\d{2,4}|\\d{4}[\\/.\\-]\\d{1,2}[\\/.\\-]\\d{1,2}|\\d{1,2}(?:st|nd|rd|th|er)?\\s+(?:of\\s+|de\\s+)?(?:${MONTHS})(?![\\p{L}])\\s*,?\\s+(?:de\\s+)?\\d{4}|(?:${MONTHS})(?![\\p{L}])\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}|(?:19|20)\\d{2})(?![\\d\\/.\\-]\\d)`;
  const DOB_CUE = '(?<![\\p{L}])(?:born|DOB|D\\.O\\.B\\.?|date of birth|birth date|birthdate|n\u00E9e?|nee|date de naissance|naissance|\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F|\u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F|\u0645\u0648\u0644\u0648\u062F\u0629|\u0645\u0648\u0644\u0648\u062F|\u0645\u0648\u0627\u0644\u064A\u062F|\u0648\u0644\u062F\u062A|\u0648\u0644\u062F|\u0627\u0644\u0648\u0644\u0627\u062F\u0629)(?![\\p{L}])';
  const DOB_RE = new RegExp(`${DOB_CUE}[\\s:\\-]*(?:(?:on|in|is|was|est|es|le|el|en|\u00E0|a|\u0641\u064A|\u0628\u062A\u0627\u0631\u064A\u062E|\u0639\u0627\u0645|\u0633\u0646\u0629)\\s+)?(${DATE})`, 'giu');

  const ID_CUE_I = new RegExp('(?<![\\p{L}])(?:passport|passeport|national id|identity card|identity number|id card|id number|id no|carte d[\'\u2019]identit\u00E9|carte nationale d[\'\u2019]identit\u00E9|carte d[\'\u2019]identite|pi\u00E8ce d[\'\u2019]identit\u00E9|civil registry|civil register|registre civil|\u062C\u0648\u0627\u0632 \u0633\u0641\u0631|\u062C\u0648\u0627\u0632 \u0627\u0644\u0633\u0641\u0631|\u0627\u0644\u062C\u0648\u0627\u0632|\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629|\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0632|\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0647\u0648\u064A\u0629|\u0627\u0644\u0647\u0648\u064A\u0629|\u0647\u0648\u064A\u0629|\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u062F|\u0631\u0642\u0645 \u0627\u0644\u0633\u062C\u0644|\u0633\u062C\u0644 \u0645\u062F\u0646\u064A|\u0625\u062E\u0631\u0627\u062C \u0642\u064A\u062F|\u0627\u062E\u0631\u0627\u062C \u0642\u064A\u062F)(?![\\p{L}])', 'giu');
  const ID_CUE_S = /(?<![\p{L}])(?:ID|I\.D\.|NID|CNI)(?![\p{L}])/gu;
  const ID_SEP = /(?:[\s:#.\-\u2013]|n\u00B0|n\u00BA|number|num\u00E9ro|numero|n\u00FAmero|num\.?|no\.?|\u0631\u0642\u0645|was|as|is|est|es|de|del)*/iuy;
  const ID_TOKEN = /(?:[A-Z]{1,3}[ \-]?)?\d[\dA-Z.\-]{3,15}[\dA-Z]/uy;

  const PHONE_CAND = /(?<![\p{L}\p{N}_\/])\+?\d[\d\s().\-]{4,18}\d(?![\p{L}\p{N}_\/])/gu;
  const PHONE_CUE = /(?:tel|t\u00E9l|phone|mobile|cell|whatsapp|call|contact|reachable|joignable|appeler|\u0647\u0627\u062A\u0641|\u0647\u0627\u062A\u0641\u0647|\u0647\u0627\u062A\u0641\u0647\u0627|\u062C\u0648\u0627\u0644|\u062C\u0648\u0627\u0644\u0647\u0627|\u0645\u0648\u0628\u0627\u064A\u0644|\u062A\u0644\u0641\u0648\u0646|\u0648\u0627\u062A\u0633\u0627\u0628)[^\d\n]{0,18}$/iu;

  const IBAN_LEN = { LB: 28, FR: 27, GB: 22, DE: 22, ES: 24, JO: 30, AE: 23, SA: 24, IQ: 23, EG: 29, IT: 27, NL: 18, BE: 16, CH: 21, TR: 26, PS: 29, KW: 30, QA: 29, BH: 22 };
  function ibanOk(s) {
    if (s.length < 15 || s.length > 34) return false;
    const len = IBAN_LEN[s.slice(0, 2)];
    if (len) return s.length === len;
    const r = s.slice(4) + s.slice(0, 4);
    let rem = 0;
    for (const ch of r) {
      const v = /\d/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
      for (const d of v) rem = (rem * 10 + Number(d)) % 97;
    }
    return rem === 1;
  }

  // Lebanese numbers, local and international. Anything with + or 00 and 8-15 digits is accepted.
  function phoneOk(digits, plus, cued) {
    let d = digits;
    if (plus || d.startsWith('00')) {
      if (d.startsWith('00')) d = d.slice(2);
      return d.length >= 8 && d.length <= 15;
    }
    if (/^0(?:3|70|71|76|78|79|81)\d{6}$/.test(d)) return true;     // mobile, with 0
    if (/^(?:3|70|71|76|78|79|81)\d{6}$/.test(d)) return true;      // mobile, without 0
    if (/^0[1-9]\d{6}$/.test(d)) return true;                       // landline
    return cued && d.length >= 7 && d.length <= 15;
  }

  function patternSpans(text, N, spans) {
    let m;
    // email
    const em = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
    while ((m = em.exec(N))) spans.push({ start: m.index, end: m.index + m[0].length, type: 'EMAIL', source: 'pattern' });

    // iban
    const ib = /(?<![\p{L}\p{N}])[A-Z]{2}\d{2}(?: ?[A-Z0-9]{2,4}){3,8}(?![\p{L}\p{N}])/gu;
    while ((m = ib.exec(N))) {
      let chunks = m[0].split(' ');
      while (chunks.length) {
        const s = chunks.join('');
        if (ibanOk(s)) {
          spans.push({ start: m.index, end: m.index + chunks.join(' ').length, type: 'IBAN', source: 'pattern' });
          break;
        }
        chunks.pop();
      }
    }

    // case / registration numbers (fictional format)
    const cs = /(?<![A-Za-z0-9])(?:CS|HL|FAM)-\d{4}-\d{4,6}(?![A-Za-z0-9])/gi;
    while ((m = cs.exec(N))) spans.push({ start: m.index, end: m.index + m[0].length, type: 'CASE', source: 'pattern' });

    // date of birth, only after a cue
    DOB_RE.lastIndex = 0;
    while ((m = DOB_RE.exec(N))) {
      const s = m.index + m[0].length - m[1].length;
      spans.push({ start: s, end: s + m[1].length, type: 'DOB', source: 'cue' });
    }

    // ID numbers after a cue word
    for (const cueRe of [ID_CUE_I, ID_CUE_S]) {
      cueRe.lastIndex = 0;
      while ((m = cueRe.exec(N))) {
        ID_SEP.lastIndex = m.index + m[0].length;
        ID_SEP.exec(N);
        ID_TOKEN.lastIndex = ID_SEP.lastIndex;
        const t = ID_TOKEN.exec(N);
        if (t) spans.push({ start: t.index, end: t.index + t[0].length, type: 'ID', source: 'cue' });
      }
    }
    // passport-shaped token with no cue: two letters and seven digits
    const pp = /(?<![A-Za-z0-9])[A-Z]{1,2}\d{7}(?![A-Za-z0-9])/g;
    while ((m = pp.exec(N))) spans.push({ start: m.index, end: m.index + m[0].length, type: 'ID', source: 'pattern' });

    // phones
    PHONE_CAND.lastIndex = 0;
    while ((m = PHONE_CAND.exec(N))) {
      const raw = m[0];
      if (/^\d{1,2}[\-.]\d{1,2}[\-.]\d{2,4}$/.test(raw)) continue; // a date
      const digits = raw.replace(/\D/g, '');
      const cued = PHONE_CUE.test(N.slice(Math.max(0, m.index - 30), m.index));
      if (phoneOk(digits, raw.startsWith('+'), cued)) {
        spans.push({ start: m.index, end: m.index + raw.length, type: 'PHONE', source: cued ? 'cue' : 'pattern' });
      }
    }
  }

  // ---------- keys ----------

  function keyFor(type, value) {
    const v = normDigits(value);
    switch (type) {
      case 'PHONE': { const d = v.replace(/\D/g, ''); return d.slice(-8); }
      case 'EMAIL': return v.toLowerCase();
      case 'IBAN': case 'ID': case 'CASE': return v.replace(/[\s.\-]/g, '').toUpperCase();
      case 'DOB': return v.toLowerCase().replace(/\s+/g, ' ');
      default: return tokenize(v).map((t) => t.norm).join(' ') || v.toLowerCase();
    }
  }

  // ---------- resolve overlaps ----------

  function mergePersons(spans, text) {
    const ps = spans.filter((s) => s.type === 'PERSON').sort((a, b) => a.start - b.start || b.end - a.end);
    const rest = spans.filter((s) => s.type !== 'PERSON');
    const merged = [];
    for (const s of ps) {
      const last = merged[merged.length - 1];
      // overlapping, or separated by one space or hyphen: "Jean-Pierre" + "Abou Jaoude" is one name
      if (last && (s.start <= last.end || (s.start === last.end + 1 && /[ -]/.test(text[last.end])))) {
        last.end = Math.max(last.end, s.end);
        if (s.source === 'user') last.source = 'user';
      } else merged.push({ ...s });
    }
    return rest.concat(merged);
  }

  // Strict mode: any Capitalised word that is not the first word of a sentence
  // and not a known place/organisation/day/month word. High recall, many false
  // alarms. Does nothing for Arabic, which has no capital letters.
  function strictSpans(text, tokens, spans) {
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.ar || !t.title || isStopLat(t) || t.raw.length < 3) { i++; continue; }
      let j = i;
      while (j + 1 < tokens.length && adjacent(text, tokens[j], tokens[j + 1]) && tokens[j + 1].title &&
             !isStopLat(tokens[j + 1]) && tokens[j + 1].raw.length > 2) j++;
      const atStart = sentenceStart(text, t.s);
      if (!(atStart && i === j)) spans.push({ start: tokens[i].s, end: tokens[j].e, type: 'PERSON', source: 'strict' });
      i = j + 1;
    }
  }

  // Once a name has been found, find its other mentions in the same text,
  // including a first name or surname on its own.
  function repeatedNames(text, tokens, spans) {
    const comps = new Set();
    const persons = spans.filter((s) => s.type === 'PERSON' && s.source !== 'strict');
    for (const sp of persons) {
      for (const t of tokens) {
        if (t.s < sp.start || t.e > sp.end || t.kind === 'conn' || t.kind === 'amb') continue;
        if (t.norm.length < 3 || (t.ar ? isStopAr(t) : isStopLat(t))) continue;
        comps.add(t.norm);
      }
    }
    const inside = (t) => spans.some((s) => s.type === 'PERSON' && t.s >= s.start && t.e <= s.end);
    const out = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      const ok = (x) => comps.has(x.norm) && (x.ar || x.cap) && !inside(x);
      if (!ok(t)) { i++; continue; }
      let j = i;
      while (j + 1 < tokens.length && ok(tokens[j + 1]) && adjacent(text, tokens[j], tokens[j + 1])) j++;
      out.push({ start: tokens[i].s, end: tokens[j].e, type: 'PERSON', source: 'repeat' });
      i = j + 1;
    }
    return out;
  }

  function detect(text, opts) {
    opts = opts || {};
    const N = normDigits(text);
    const tokens = tokenize(text);
    markTokens(tokens);
    let spans = [];

    patternSpans(text, N, spans);
    cuePersons(text, tokens, spans);
    if (!opts.noGazetteer) gazetteerRuns(text, tokens, spans);

    if (opts.strict) strictSpans(text, tokens, spans);

    for (const name of opts.extraNames || []) {
      for (const [s, e] of termMatches(text, tokens, name)) spans.push({ start: s, end: e, type: 'PERSON', source: 'user' });
    }
    spans = mergePersons(spans, text);
    spans = spans.concat(repeatedNames(text, tokens, spans));
    spans = mergePersons(spans, text);

    const manual = [];
    for (const mm of opts.manual || []) {
      const type = TYPES.includes(mm.type) ? mm.type : 'OTHER';
      for (const [s, e] of termMatches(text, tokens, mm.text)) manual.push({ start: s, end: e, type, source: 'manual', prio: 0 });
    }

    const all = manual.concat(spans.map((s) => ({ ...s, prio: PRIORITY[s.type] })));
    all.sort((a, b) => a.prio - b.prio || (b.end - b.start) - (a.end - a.start) || a.start - b.start);
    const taken = [];
    for (const s of all) {
      if (s.end <= s.start) continue;
      if (taken.some((t) => s.start < t.end && s.end > t.start)) continue;
      taken.push(s);
    }
    taken.sort((a, b) => a.start - b.start);
    return taken.map((s) => {
      const value = text.slice(s.start, s.end);
      return { start: s.start, end: s.end, type: s.type, text: value, key: keyFor(s.type, value), source: s.source };
    });
  }

  const api = { detect, TYPES, normDigits, keyFor, tokenize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { globalThis.PG = globalThis.PG || {}; globalThis.PG.detect = api; }
})();
