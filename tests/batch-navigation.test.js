import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('CMD introduction links to the batch directory before the heading', () => {
  const source = read('../js/ui/sidebar.js');
  const link = source.indexOf('href="./batch/"');
  const heading = source.indexOf('<h2>そもそもコマンドプロンプトとは？</h2>');
  assert.ok(link >= 0 && heading > link);
});

test('batch page links back and shares CSS without executable code', () => {
  const html = read('../batch/index.html');
  assert.match(html, /href="\.\.\/css\/style\.css"/);
  assert.match(html, /href="\.\.\/"/);
  assert.match(html, /コンテンツを準備中/);
  assert.doesNotMatch(html, /<script\b|\bonclick\s*=|\bonerror\s*=/i);
});
