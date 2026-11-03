import test from 'node:test';
import assert from 'node:assert/strict';
import { commandCatalog } from '../js/data/commands.js';
import { initialState, commandAliases } from '../js/core/state.js';
import { createParser } from '../js/core/parser.js';
import { createFilesystem } from '../js/core/filesystem.js';
import { createExecutor } from '../js/core/executor.js';
import { escapeHtml } from '../js/core/html.js';

function sandbox() {
  const output = [];
  const ctx = {
    state: initialState(), commandAliases, commandCatalog,
    renderExplorer() {}, clearTerminal() { output.length = 0; },
    writeTerminalLine(v='') { output.push(String(v)); },
    terminalOutputEl: { replaceChildren() { output.length = 0; } }
  };
  Object.assign(ctx, createParser(ctx));
  Object.assign(ctx, createFilesystem(ctx));
  Object.assign(ctx, createExecutor(ctx));
  // The original simulator has output capturing; this test uses the same protocol.
  ctx.captureOutput = fn => {
    const before=output.length;
    fn();
    return output.splice(before).join('\n');
  };
  return {ctx, output, run: line => ctx.executeShellLine(line)};
}

test('command parsing and aliases', () => {
  const {ctx} = sandbox();
  assert.deepEqual(ctx.normalizeCommand('mkdir "new folder"'), {command:'mkdir',args:['new folder']});
  assert.equal(ctx.commandExists('dir'),true);
  assert.equal(commandAliases.md,'mkdir');
});

test('create, navigate, list and remove virtual files', () => {
  const s=sandbox();
  s.run('mkdir demo');
  assert.ok(s.ctx.state.fs['C:\\WORK\\demo']);
  s.run('cd demo');
  assert.equal(s.ctx.state.currentPath, 'C:\\WORK\\demo');
  s.run('cd ..');
  s.run('rmdir demo');
  assert.equal(s.ctx.state.fs['C:\\WORK\\demo'],undefined);
});

test('redirection and piping remain in-memory', () => {
  const s=sandbox();
  s.run('echo Hello > fresh.txt');
  s.run('echo Again >> fresh.txt');
  assert.match(s.ctx.state.contents['c:\\work\\fresh.txt'],/Hello[\s\S]*Again/);
  s.run('type fresh.txt | find "Hello"');
  assert.match(s.output.join('\n'),/Hello/);
  assert.equal(s.ctx.state.fs['C:\\WORK'].filter(n=>n.startsWith('__cmd_pipe_')).length,0);
});

test('all demo files are virtual; shell output is plain text', () => {
  const s=sandbox();
  s.run('echo "<img src=x onerror=alert(1)>"');
  assert.match(s.output.join('\n'),/<img/);
  assert.equal(escapeHtml('<img src=x onerror="oops">'), '&lt;img src=x onerror=&quot;oops&quot;&gt;');
});

test('unknown commands do not execute arbitrary JS', () => {
  const s=sandbox();
  s.run('javascript:alert(1)');
  assert.match(s.output.join('\n'),/存在しません/);
});
