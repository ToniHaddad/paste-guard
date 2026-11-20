'use strict';
/* Regression floors for the benchmark. Not claims of real-world accuracy:
 * the notes are small, synthetic and written by the same author as the detector. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { build } = require('../bench/notes-src.js');
const { score, summarise } = require('../bench/run.js');

const notes = build();
const rows = score(notes);
const recall = (f) => { const g = summarise(rows.filter(f), () => 'x').x; return g.hit / g.gold; };
const precision = (f) => { const g = summarise(rows.filter(f), () => 'x').x; return g.ok / g.pred; };

test('benchmark has at least 45 notes, 15 or more per language, with labelled entities', () => {
  assert.ok(notes.length >= 45);
  for (const l of ['en', 'fr', 'ar']) assert.ok(notes.filter((n) => n.lang === l).length >= 15, l);
  for (const n of notes) {
    assert.ok(n.entities.length >= 2, n.id);
    for (const e of n.entities) assert.equal(n.text.slice(e.start, e.end), e.text);
  }
});

test('labelled spans never overlap', () => {
  for (const n of notes) {
    const e = [...n.entities].sort((a, b) => a.start - b.start);
    for (let i = 1; i < e.length; i++) assert.ok(e[i].start >= e[i - 1].end, n.id);
  }
});

test('structured identifiers: every phone, email, IBAN, date of birth, ID and case number is found', () => {
  for (const t of ['PHONE', 'EMAIL', 'IBAN', 'DOB', 'ID', 'CASE']) {
    assert.equal(recall((r) => r.kind === 'gold' && r.e.type === t), 1, t);
  }
});

test('person recall floors (dev+heldout, and the harder stress notes)', () => {
  const person = (r) => r.e.type === 'PERSON';
  assert.ok(recall((r) => r.kind === 'gold' && person(r) && r.note.split !== 'stress') >= 0.93);
  assert.ok(recall((r) => r.kind === 'gold' && person(r) && r.note.split === 'stress') >= 0.55);
});

test('precision stays high in default mode', () => {
  assert.ok(precision((r) => r.kind === 'pred') >= 0.97);
});

test('strict mode finds more Latin-script names than default mode', () => {
  const strictRows = score(notes, { strict: true });
  const rec = (rs, lang) => { const g = summarise(rs.filter((r) => r.kind === 'gold' && r.e.type === 'PERSON' && r.note.lang === lang), () => 'x').x; return g.hit / g.gold; };
  for (const lang of ['en', 'fr']) assert.ok(rec(strictRows, lang) > rec(rows, lang), lang);
});
