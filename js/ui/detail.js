import { getLanguage } from '../core/language.js';
import { t, commandDescription, tagText } from '../i18n/translations.js';
import { OPTIONS_EN } from '../i18n/help-en.js';
import { getCommandTags, TAGS } from '../data/tags.js';
// Extracted from the original single-file CMD playground.
export function createDetail(ctx) {
  const { commandCatalog, commandDetailEl, commandNameOrigins, displayCommandName, escapeHtml, mainContentEl } = ctx;
      function renderCommandDetail(commandName) {
        const lang = getLanguage();
        const command = commandCatalog[commandName];
        if (!command) return;
        mainContentEl.classList.remove('intro-mode');

        document.querySelectorAll('.command-link').forEach((button) => {
          button.classList.toggle('active', button.dataset.commandName === commandName);
        });

        commandDetailEl.dataset.commandName = commandName;
        commandDetailEl.innerHTML = `
          <div class="command-tags">${getCommandTags(commandName).map(tag => `<span class="command-tag ${TAGS[tag].className}">${tagText(tag, lang, TAGS[tag].label)}</span>`).join('')}</div>
          <h2>${displayCommandName(command.name)}</h2>
          <div class="syntax">${command.syntax}</div>
          <p>${commandDescription(commandName, command.description, lang)}</p>
          ${lang === 'ja' && commandNameOrigins[commandName] ? `<p class="command-origin"><strong>${t('origin',lang)}</strong>${escapeHtml(commandNameOrigins[commandName])}</p>` : ''}
          ${lang === 'ja' && command.scenarios ? `<h3>${t('scenarios',lang)}</h3><ul class="option-list">${command.scenarios.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          <h3>${t('options',lang)}</h3>
          <ul class="option-list">
            ${(lang === 'en' ? OPTIONS_EN[commandName] ?? [] : command.options).length ? (lang === 'en' ? OPTIONS_EN[commandName] ?? [] : command.options).map((option) => `<li>${option}</li>`).join('') : `<li>${t('noOptions', lang)}</li>`}
          </ul>
          ${command.examples ? `<h3>${t('examples',lang)}</h3>${command.examples.map((example, index) => `<div class="command-example"><div class="example-copy-row"><div class="syntax">${escapeHtml(example.code)}</div><button type="button" class="copy-command-button" data-example-index="${index}" aria-label="コマンドをコピー: ${escapeHtml(example.code)}">${t('copy',lang)}</button></div>${lang === 'ja' ? `<p>${escapeHtml(example.note)}</p>` : ''}</div>`).join('')}` : ''}
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
          button.textContent = t('copied');
        } catch (error) {
          button.textContent = t('copyFailed');
          console.warn('コマンドのコピーに失敗しました:', error);
        }
        setTimeout(() => {
          if (button.isConnected) {
            button.textContent = t('copy');
            button.disabled = false;
          }
        }, 1400);
      });
  return { renderCommandDetail };
}
