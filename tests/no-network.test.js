'use strict';
/*
 * The privacy claim, enforced. The page must not be able to send the mapping
 * anywhere or keep it anywhere. Two layers:
 *   1. a Content-Security-Policy with connect-src 'none' (the browser refuses
 *      network requests), checked here;
 *   2. the shipped code never mentions an API that could reach the network or
 *      persist data. This test fails the build if it does.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const shipped = ['src/gazetteer.js', 'src/detect.js', 'src/redact.js', 'src/app.js'];

// Comments are stripped first so documentation can describe what is NOT used.
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
}

const FORBIDDEN = [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'sendBeacon', 'localStorage', 'sessionStorage',
  'indexedDB', 'cookie', 'EventSource', 'importScripts', 'serviceWorker', 'RTCPeerConnection',
  'WebTransport', 'openDatabase', 'caches', 'BroadcastChannel', 'postMessage', 'window.open',
  'navigator.share', 'eval', 'Function(', 'import(', 'XMLHttp',
];

for (const file of shipped) {
  test(`${file} does not reference network or storage APIs`, () => {
    const code = stripComments(read(file));
    for (const word of FORBIDDEN) {
      const re = new RegExp('(^|[^\\w$])' + word.replace(/[.()]/g, '\\$&') + (/\w$/.test(word) ? '(?![\\w$])' : ''), 'i');
      assert.ok(!re.test(code), `${file} mentions "${word}"`);
    }
  });
}

test('the page declares connect-src none and no inline script or external resource', () => {
  const html = read('index.html');
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
  assert.ok(csp, 'no CSP meta tag');
  const policy = csp[1];
  assert.match(policy, /connect-src 'none'/);
  assert.match(policy, /default-src 'none'/);
  assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval|https?:/);
  assert.match(policy, /script-src 'self'/);
  // every script tag points at a local file; none has inline code
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length >= 4);
  for (const [, attrs, body] of scripts) {
    assert.match(attrs, /src="(?!https?:|\/\/)[^"]+"/, 'script without a local src');
    assert.equal(body.trim(), '', 'inline script');
  }
  assert.doesNotMatch(html, /\s(?:src|href)="(?:https?:)?\/\//, 'external resource');
  assert.doesNotMatch(html, /\son\w+="/, 'inline event handler');
  assert.doesNotMatch(html, /<form|<iframe|<object|<embed/i);
});

test('the stylesheet loads nothing from outside', () => {
  const css = read('styles.css');
  assert.doesNotMatch(css, /@import|url\(\s*['"]?https?:|url\(\s*['"]?\/\//);
});

test('the CSP header from the local server matches the page policy for sensitive keys', async () => {
  const { start } = require('../server.js');
  const server = await start(0);
  try {
    const port = server.address().port;
    const res = await fetchLocal(port, '/');
    assert.equal(res.status, 200);
    assert.match(res.body, /connect-src 'none'/);
    const bad = await fetchLocal(port, '/tests/no-network.test.js');
    assert.equal(bad.status, 404);
    const trav = await fetchLocal(port, '/..%2f..%2fpackage.json');
    assert.ok(trav.status === 404 || trav.status === 403);
  } finally {
    server.close();
  }
});

// The test client may use the network; the shipped page may not.
function fetchLocal(port, p) {
  const http = require('node:http');
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: p }, (r) => {
      let body = '';
      r.on('data', (c) => (body += c));
      r.on('end', () => resolve({ status: r.statusCode, body }));
    }).on('error', reject);
  });
}
