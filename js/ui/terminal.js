// Extracted from the original single-file CMD playground.
export function createTerminal(ctx) {
  const { commandAliases, commandCatalog, initialState, state, terminalFormEl, terminalInputEl, terminalOutputEl } = ctx;
  const executeShellLine = (...args) => ctx.executeShellLine(...args);
  const existingDir = (...args) => ctx.existingDir(...args);
  const joinPath = (...args) => ctx.joinPath(...args);
  const normalizeSlashes = (...args) => ctx.normalizeSlashes(...args);
  const parsePathInput = (...args) => ctx.parsePathInput(...args);
  const renderExplorer = (...args) => ctx.renderExplorer(...args);
      let stdoutCapture = null;
      function writeTerminalLine(line = '') {
        if (stdoutCapture) { stdoutCapture.push(String(line)); return; }
        const p = document.createElement('div');
        p.textContent = line;
        terminalOutputEl.appendChild(p);
        terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
      }


      function captureOutput(task) {
        const previous = stdoutCapture;
        const lines = [];
        stdoutCapture = lines;
        try { task(); } finally { stdoutCapture = previous; }
        return lines.join("\n");
      }
      function clearTerminal() { terminalOutputEl.replaceChildren(); }
      // 入力履歴はページ内のみで保持。詳細ページの切り替え・リセット時に破棄する。
      const inputHistory = [];
      let historyCursor = 0;
      let historyDraft = '';
      let completion = null;

      function resetInputNavigation(clearHistory = false) {
        completion = null;
        historyCursor = inputHistory.length;
        historyDraft = '';
        if (clearHistory) {
          inputHistory.length = 0;
          historyCursor = 0;
        }
      }

      // 引用符を含む最後の引数を対象とし、途中のディレクトリ名も補完する。
      function getCompletionContext(input) {
        const leading = input.match(/^\s*/)[0];
        const body = input.slice(leading.length);
        if (!body) return {prefix: leading, token: '', kind: 'command', command: ''};
        const commandMatch = body.match(/^([^\s]+)(\s+)?/);
        const cmd = commandMatch[1].toLowerCase();
        if (!commandMatch[2]) return {prefix: leading, token: commandMatch[1], kind: 'command', command: ''};
        // 正規表現で末尾の非引用トークン／引用トークンを取り出す。
        const tail = body.slice(commandMatch[0].length);
        let quoted = false, start = 0;
        for (let i = 0; i < tail.length; i++) {
          if (tail[i] === '"') quoted = !quoted;
          else if (/\s/.test(tail[i]) && !quoted) start = i + 1;
        }
        const rawToken = tail.slice(start);
        const prefix = leading + commandMatch[0] + tail.slice(0, start);
        return {prefix, token: rawToken, kind: 'path', command: commandAliases[cmd] || cmd};
      }

      function completionCandidates(input) {
        const ctx = getCompletionContext(input);
        if (ctx.kind === 'command') {
          const names = [...Object.keys(commandCatalog).filter(k => !['redirect','pipe'].includes(k)),
            ...Object.keys(commandAliases), 'C:', 'D:'];
          return [...new Set(names)].filter(x => x.toLowerCase().startsWith(ctx.token.toLowerCase()))
            .sort((a,b)=>a.localeCompare(b, 'en')).map(x => ctx.prefix + x);
        }
        const commandsWithPaths = new Set(['cd','mkdir','dir','type','copy','xcopy','robocopy',
          'move','ren','del','rmdir','find','findstr','where','tree']);
        if (!commandsWithPaths.has(ctx.command)) return [];
        const token = ctx.token.replace(/^"/, '');
        if (token.startsWith('/') || token.startsWith('-') || token.includes('*') || token.includes('?')) return [];
        const normalized = normalizeSlashes(token);
        const lastSep = normalized.lastIndexOf('\\');
        const folderPrefix = lastSep >= 0 ? normalized.slice(0,lastSep+1) : '';
        const part = lastSep >= 0 ? normalized.slice(lastSep+1) : normalized;
        // "D:" / "C:" は各ドライブの最後のカレントディレクトリを参照。
        const pathFolder = parsePathInput(folderPrefix || '.');
        const folder = pathFolder ? existingDir(pathFolder) : null;
        if (!folder) return [];
        const folderOnly = ['cd','rmdir','tree'].includes(ctx.command);
        const items = (state.fs[folder] || []).filter(name => {
          const path = joinPath(folder,name);
          return name.toLowerCase().startsWith(part.toLowerCase()) && (!folderOnly || !!existingDir(path));
        }).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}));
        return items.map(name => {
          const pathToken = folderPrefix + name;
          const needsQuotes = /\s/.test(pathToken) || ctx.token.startsWith('"');
          return ctx.prefix + (needsQuotes ? '"' + pathToken + '"' : pathToken);
        });
      }

      terminalInputEl.addEventListener('keydown', event => {
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          if (!inputHistory.length) return;
          event.preventDefault();
          completion = null;
          if (event.key === 'ArrowUp') {
            if (historyCursor === inputHistory.length) historyDraft = terminalInputEl.value;
            historyCursor = Math.max(0, historyCursor - 1);
          } else {
            historyCursor = Math.min(inputHistory.length, historyCursor + 1);
          }
          terminalInputEl.value = historyCursor === inputHistory.length ? historyDraft : inputHistory[historyCursor];
          terminalInputEl.setSelectionRange(terminalInputEl.value.length,terminalInputEl.value.length);
          return;
        }
        if (event.key === 'Tab') {
          event.preventDefault();
          if (!completion || !completion.variants.includes(terminalInputEl.value)) {
            const variants = completionCandidates(terminalInputEl.value);
            if (!variants.length) return;
            completion = {variants, index: event.shiftKey ? variants.length - 1 : 0};
          } else {
            completion.index = (completion.index + (event.shiftKey ? -1 : 1) + completion.variants.length) % completion.variants.length;
          }
          terminalInputEl.value = completion.variants[completion.index];
          terminalInputEl.setSelectionRange(terminalInputEl.value.length,terminalInputEl.value.length);
        }
      });
      terminalInputEl.addEventListener('input', () => { completion = null; });

      document.getElementById('resetButton').addEventListener('click', () => {
        Object.assign(state, initialState());
        resetInputNavigation(true);
        clearTerminal();
        terminalInputEl.value = '';
        renderExplorer();
        writeTerminalLine('Windows CMD シミュレータをリセットしました。');
        writeTerminalLine(`${state.currentPath}>`);
      });

      terminalFormEl.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = terminalInputEl.value.trim();
        if (!input) return;

        inputHistory.push(input);
        resetInputNavigation();
        writeTerminalLine(`${state.currentPath}> ${input}`);
        executeShellLine(input);
        writeTerminalLine(`${state.currentPath}>`);
        terminalInputEl.value = '';
      });
  return { writeTerminalLine, captureOutput, clearTerminal, resetInputNavigation, getCompletionContext, completionCandidates };
}
