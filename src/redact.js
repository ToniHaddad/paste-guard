/*
 * Placeholders and restoring. The Session holds the mapping between real
 * values and placeholders. It lives in memory only: it is a plain object
 * inside the page, and nothing in this project writes it anywhere.
 */
(function () {
  'use strict';

  const LABELS = {
    PERSON: 'PERSON', PHONE: 'PHONE', EMAIL: 'EMAIL', IBAN: 'IBAN',
    DOB: 'DOB', ID: 'ID', CASE: 'CASE', OTHER: 'REDACTED',
  };

  class Session {
    constructor() { this.reset(); }

    reset() {
      this.counters = {};
      this.byKey = new Map();          // "TYPE|key" -> placeholder
      this.byPlaceholder = new Map();  // placeholder -> first value seen
    }

    placeholderFor(type, key, value) {
      const id = type + '|' + key;
      let ph = this.byKey.get(id);
      if (!ph) {
        const n = (this.counters[type] = (this.counters[type] || 0) + 1);
        ph = '[' + LABELS[type] + '_' + n + ']';
        this.byKey.set(id, ph);
        this.byPlaceholder.set(ph, value);
      }
      return ph;
    }

    get size() { return this.byPlaceholder.size; }
  }

  /*
   * redact(text, spans, session, { ignore: Set of "TYPE|key" })
   * Returns the redacted string, display segments, and counts per type.
   * A span whose "TYPE|key" is in `ignore` is left as the original text.
   */
  function redact(text, spans, session, opts) {
    const ignore = (opts && opts.ignore) || new Set();
    const segments = [];
    const counts = {};
    let out = '';
    let pos = 0;
    for (const sp of spans) {
      if (sp.start > pos) {
        const plain = text.slice(pos, sp.start);
        segments.push({ text: plain });
        out += plain;
      }
      const id = sp.type + '|' + sp.key;
      if (ignore.has(id)) {
        segments.push({ text: sp.text, kept: true, type: sp.type, id, source: sp.source });
        out += sp.text;
      } else {
        const ph = session.placeholderFor(sp.type, sp.key, sp.text);
        segments.push({ text: ph, redacted: true, type: sp.type, id, original: sp.text, source: sp.source });
        out += ph;
        counts[sp.type] = (counts[sp.type] || 0) + 1;
      }
      pos = sp.end;
    }
    if (pos < text.length) {
      const tail = text.slice(pos);
      segments.push({ text: tail });
      out += tail;
    }
    return { output: out, segments, counts };
  }

  /*
   * restore(answer, session): swap placeholders back to the real values.
   * Tolerates what assistants do to them: lost brackets, case changes,
   * spaces in place of underscores ("Person 1", "[PERSON_1]'s").
   */
  function restore(answer, session) {
    const labels = Object.values(LABELS).join('|');
    // [PERSON_1] or [person 1] with brackets, or PERSON_1 with the brackets lost.
    // Plain prose such as "case 2" is not a placeholder.
    const re = new RegExp('\\[\\s*(' + labels + ')[_\\s-]?(\\d+)\\s*\\]|(?<![\\w])(' + labels + ')_(\\d+)(?!\\w)', 'gi');
    const segments = [];
    const unknown = new Set();
    let restored = 0;
    let out = '';
    let pos = 0;
    let m;
    while ((m = re.exec(answer))) {
      const ph = '[' + (m[1] || m[3]).toUpperCase() + '_' + (m[2] || m[4]) + ']';
      const value = session.byPlaceholder.get(ph);
      if (value === undefined) { unknown.add(ph); continue; }
      if (m.index > pos) {
        const plain = answer.slice(pos, m.index);
        segments.push({ text: plain });
        out += plain;
      }
      segments.push({ text: value, restored: true, placeholder: ph });
      out += value;
      restored++;
      pos = m.index + m[0].length;
    }
    if (pos < answer.length) {
      const tail = answer.slice(pos);
      segments.push({ text: tail });
      out += tail;
    }
    return { output: out, segments, restored, unknown: [...unknown] };
  }

  const api = { Session, redact, restore, LABELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { globalThis.PG = globalThis.PG || {}; globalThis.PG.redact = api; }
})();
