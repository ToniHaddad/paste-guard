'use strict';
// Arabic-Indic digit groups ("٠٣ ١٢٣ ٤٥٦") display backwards inside a left-to-right line unless the
// restored span is forced to left-to-right. The page needs both halves of that fix; a screenshot
// check confirmed the rendering. This guards against losing either half.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('restored Arabic-Indic numbers are forced left to right', () => {
  const css = read('styles.css');
  assert.match(css, /\.tok\.restored\.digits\s*\{[^}]*direction:\s*ltr[^}]*unicode-bidi:\s*bidi-override/);
  const app = read('src/app.js');
  assert.match(app, /classList\.add\('digits'\)/);
  // the class applies to digit-only values, never to a value that has Arabic letters (a name)
  const m = app.match(/if \((\/\[[^\]]+\]\/)\.test\(text\) && !(\/\[[^\]]+\]\/)\.test\(text\)\)/);
  assert.ok(m);
  assert.ok(new RegExp(m[1].slice(1, -1)).test('٠٣ ١٢٣ ٤٥٦'));
  assert.ok(new RegExp(m[2].slice(1, -1)).test('حنان'));
  assert.ok(!new RegExp(m[2].slice(1, -1)).test('٠٣ ١٢٣ ٤٥٦'));
});
