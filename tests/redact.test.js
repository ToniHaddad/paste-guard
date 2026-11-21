'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { detect } = require('../src/detect.js');
const { Session, redact, restore } = require('../src/redact.js');
const { build } = require('../bench/notes-src.js');

function run(text, session, opts) {
  return redact(text, detect(text, opts), session, opts);
}

test('same value gets the same placeholder, different values get different ones', () => {
  const s = new Session();
  const r = run('Mrs Hanan Saab called. Later Hanan Saab wrote. Mr Joseph Karam waited. Call +961 71 123 456 or 71 123 456.', s);
  assert.match(r.output, /^Mrs \[PERSON_1\] called\. Later \[PERSON_1\] wrote\. Mr \[PERSON_2\] waited\. Call \[PHONE_1\] or \[PHONE_1\]\.$/);
  assert.deepEqual(r.counts, { PERSON: 3, PHONE: 2 });
});

test('placeholders stay stable across edits within a session', () => {
  const s = new Session();
  run('Mrs Hanan Saab called.', s);
  const r = run('Mr Joseph Karam called. Then Mrs Hanan Saab.', s);
  assert.equal(r.output, 'Mr [PERSON_2] called. Then Mrs [PERSON_1].');
});

test('a new session starts again from 1', () => {
  const s = new Session();
  run('Mrs Hanan Saab', s);
  s.reset();
  assert.equal(run('Mr Joseph Karam', s).output, 'Mr [PERSON_1]');
});

test('the redacted text contains none of the detected values', () => {
  for (const n of build()) {
    const spans = detect(n.text);
    const r = redact(n.text, spans, new Session());
    for (const sp of spans) assert.ok(!r.output.includes(sp.text), `${n.id} still contains "${sp.text}"`);
  }
});

test('restore puts the original values back', () => {
  const s = new Session();
  const text = 'Mrs Hanan Saab (CS-2026-004817) can be reached on +961 71 123 456.';
  const r = run(text, s);
  assert.equal(restore(r.output, s).output, text);
});

test('restore round trip over every benchmark note (re-redacting gives the same text)', () => {
  for (const n of build()) {
    const s = new Session();
    const red = run(n.text, s);
    const back = restore(red.output, s).output;
    const again = run(back, s);
    assert.equal(again.output, red.output, n.id);
  }
});

test('restore copes with what assistants do to placeholders', () => {
  const s = new Session();
  run('Mrs Hanan Saab on +961 71 123 456', s);
  const r = restore('Dear [PERSON_1]’s team, call PHONE_1 or [phone_1]. [PERSON_9] is unknown. Case 1 is open.', s);
  assert.equal(r.restored, 3);
  assert.deepEqual(r.unknown, ['[PERSON_9]']);
  assert.match(r.output, /^Dear Hanan Saab’s team, call \+961 71 123 456 or \+961 71 123 456\. \[PERSON_9\] is unknown\. Case 1 is open/);
});

test('un-redacting a value keeps the original text and drops it from the counts', () => {
  const s = new Session();
  const text = 'Mrs Hanan Saab called Mrs Hanan Saab.';
  const first = run(text, s);
  const id = 'PERSON|' + detect(text)[0].key;
  const r = run(text, s, { ignore: new Set([id]) });
  assert.equal(r.output, text);
  assert.equal(r.counts.PERSON, undefined);
  assert.ok(r.segments.some((x) => x.kept));
  assert.ok(first.output.includes('[PERSON_1]'));
});

test('Arabic text with Arabic-Indic digits redacts and restores', () => {
  const s = new Session();
  const text = 'اتصلت السيدة حنان صعب على الرقم ٠٣ ١٢٣ ٤٥٦ بخصوص الملف.';
  const r = run(text, s);
  assert.match(r.output, /\[PERSON_1\]/);
  assert.match(r.output, /\[PHONE_1\]/);
  assert.ok(!r.output.includes('حنان') && !r.output.includes('٠٣'));
  assert.equal(restore(r.output, s).output, text);
});

test('the Session holds only plain in-memory maps', () => {
  const s = new Session();
  run('Mrs Hanan Saab', s);
  assert.ok(s.byKey instanceof Map && s.byPlaceholder instanceof Map);
  assert.equal(typeof s.toJSON, 'undefined');
});
