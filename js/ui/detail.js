// Extracted from the original single-file CMD playground.
export function createDetail(ctx) {
  const { commandCatalog, commandDetailEl, commandNameOrigins, displayCommandName, escapeHtml, mainContentEl } = ctx;
      function renderCommandDetail(commandName) {
        const command = commandCatalog[commandName];
        if (!command) return;
        mainContentEl.classList.remove('intro-mode');

        document.querySelectorAll('.command-link').forEach((button) => {
          button.classList.toggle('active', button.dataset.commandName === commandName);
        });

        commandDetailEl.dataset.commandName = commandName;
        commandDetailEl.innerHTML = `
          <span class="badge">Windows CMD</span>
          <h2>${displayCommandName(command.name)}</h2>
          <div class="syntax">${command.syntax}</div>
          <p>${command.description}</p>
          ${commandNameOrigins[commandName] ? `<p class="command-origin"><strong>名前の由来：</strong>${escapeHtml(commandNameOrigins[commandName])}</p>` : ''}
          ${command.scenarios ? `<h3>学習用シナリオ</h3><ul class="option-list">${command.scenarios.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          <h3>オプション</h3>
          <ul class="option-list">
            ${command.options.length ? command.options.map((option) => `<li>${option}</li>`).join('') : '<li>オプションなし</li>'}
          </ul>
          ${command.examples ? `<h3>実行例</h3>${command.examples.map((example, index) => `<div class="command-example"><div class="example-copy-row"><div class="syntax">${escapeHtml(example.code)}</div><button type="button" class="copy-command-button" data-example-index="${index}" aria-label="コマンドをコピー: ${escapeHtml(example.code)}">コピー</button></div><p>${escapeHtml(example.note)}</p></div>`).join('')}` : ''}
        `;
      }

      // 実行例をワンクリックでコピー。HTMLにコードを属性として埋め込まず、元データから取得する。
      commandDetailEl.addEventListener('click', async (event) => {
        const button = event.target.closest('.copy-command-button');
        if (!button || !commandDetailEl.contains(button)) return;

        const command = commandCatalog[commandDetailEl.dataset.commandName];
        const index = Number(button.dataset.exampleIndex);
        const example = command?.examples?.[index];
        if (!example || button.disabled) return;

        button.disabled = true;
        try {
          // file://で開いた環境など Clipboard API が利用できない場合も考慮。
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(example.code);
          } else {
            const input = document.createElement('textarea');
            input.value = example.code;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            try {
              if (!document.execCommand('copy')) throw new Error('コピーに失敗しました');
            } finally {
              input.remove();
            }
          }
          button.textContent = 'コピー済み';
        } catch (error) {
          button.textContent = 'コピー失敗';
          console.warn('コマンドのコピーに失敗しました:', error);
        }
        setTimeout(() => {
          if (button.isConnected) {
            button.textContent = 'コピー';
            button.disabled = false;
          }
        }, 1400);
      });
  return { renderCommandDetail };
}
