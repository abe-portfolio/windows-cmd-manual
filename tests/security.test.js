import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const read = rel => readFileSync(new URL(rel,root),'utf8');
function jsFiles(dir='js') {
  const rootPath = new URL(dir+'/',root);
  return readdirSync(rootPath,{withFileTypes:true}).flatMap(e=>e.isDirectory()?jsFiles(dir+'/'+e.name):[dir+'/'+e.name]);
}

test('strict CSP and no inline executable script',()=>{
 const html=read('index.html');
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/script-src 'self'/);
 assert.match(html,/connect-src 'none'/);
 assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)/i);
});

test('no dynamic JS evaluation, shell invocation or external fetching',()=>{
 const js=jsFiles().map(read).join('\n');
 assert.doesNotMatch(js,/\beval\s*\(|\bnew\s+Function\s*\(|\bdocument\.write\s*\(/);
 assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\s*\(|\bWebSocket\s*\(/);
 assert.doesNotMatch(js,/\bchild_process\b|\bspawn\s*\(|\bexecSync\s*\(/);
});

test('user-controlled terminal output and explorer names use safe rendering',()=>{
 const terminal=read('js/ui/terminal.js');
 const explorer=read('js/ui/explorer.js');
 assert.match(terminal,/p\.textContent = line/);
 assert.match(explorer,/escapeHtml\(name\)/);
 assert.match(explorer,/escapeHtml\(pathName\)/);
});
