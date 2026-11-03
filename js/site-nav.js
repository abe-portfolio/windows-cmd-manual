import { TAGS, getCommandTags, filterCommandNames } from './data/tags.js';
// Independent menu for switching pages. No dynamic HTML injection is used.
export function initSiteNav(doc = document) {
  const toggle = doc.getElementById('siteNavToggle');
  const menu = doc.getElementById('siteNavMenu');
  const nav = doc.getElementById('siteNav');
  if (!toggle || !menu || !nav) return;
  const filterButton = doc.getElementById('filterMenuButton');
  const filterDialog = doc.getElementById('filterDialog');
  const closeButton = doc.getElementById('filterDialogClose');
  const doneButton = doc.getElementById('filterDialogDone');
  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'ページメニューを閉じる' : 'ページメニューを開く');
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  // チップの選択状態はメモリ内だけで管理し、Cookie等に保存しない。
  const selectedTags = new Set();
  let mode = 'include';
  const choices = doc.getElementById('filterTagChoices');
  const modeRadios = doc.querySelectorAll?.('input[name="filterMode"]') ?? [];
  const clearButton = doc.getElementById('filterClearButton');
  const applyButton = doc.getElementById('filterApplyButton');
  const countEl = doc.getElementById('filterResultCount');
  const activeEl = doc.getElementById('activeFilterIndicator');
  const updatePreview = () => {
    if (countEl) {
      const all = ['intro', ...Object.keys(getAvailableCommands())];
      countEl.textContent = `対象: ${filterCommandNames(all, selectedTags, mode).length} / ${all.length} 項目`;
    }
  };
  // ランタイムから利用可能なコマンド名のみ受け取り、画面へ任意HTMLを流し込まない。
  let commandNames = [];
  const getAvailableCommands = () => Object.fromEntries(commandNames.map(name => [name, true]));
  doc.addEventListener('cmdpg:commands-ready', event => {
    commandNames = Array.isArray(event.detail?.commandNames) ? event.detail.commandNames : [];
    updatePreview();
  });
  const notify = () => {
    const detail = { tags: [...selectedTags], mode };
    doc.dispatchEvent(new CustomEvent('cmdpg:filter-change', { detail }));
    if (activeEl) {
      activeEl.hidden = selectedTags.size === 0;
      activeEl.textContent = selectedTags.size ? `絞り込み中（${mode === 'exclude' ? '除外' : '表示'}：${selectedTags.size}タグ）` : '';
    }
    updatePreview();
  };
  if (choices) {
    Object.entries(TAGS).forEach(([id, def]) => {
      const chip = doc.createElement('button');
      chip.type = 'button';
      chip.className = `filter-chip ${def.className}`;
      chip.textContent = def.label;
      chip.setAttribute('aria-pressed', 'false');
      chip.dataset.tagId = id;
      chip.addEventListener('click', () => {
        if (selectedTags.has(id)) selectedTags.delete(id); else selectedTags.add(id);
        chip.setAttribute('aria-pressed', String(selectedTags.has(id)));
        updatePreview();
      });
      choices.appendChild(chip);
    });
  }
  modeRadios.forEach(radio => radio.addEventListener('change', () => {
    if (radio.checked && (radio.value === 'include' || radio.value === 'exclude')) {
      mode = radio.value;
      updatePreview();
    }
  }));
  clearButton?.addEventListener('click', () => {
    selectedTags.clear();
    mode = 'include';
    modeRadios.forEach(radio => { radio.checked = radio.value === 'include'; });
    choices?.querySelectorAll('button[aria-pressed="true"]').forEach(chip => chip.setAttribute('aria-pressed', 'false'));
    notify();
  });
  applyButton?.addEventListener('click', () => {
    notify();
    if (filterDialog?.open) filterDialog.close();
    toggle.focus();
  });
  if (filterButton && filterDialog) {
    filterButton.addEventListener('click', () => {
      setOpen(false);
      updatePreview();
      if (!filterDialog.open) filterDialog.showModal();
    });
    const closeDialog = () => {
      if (filterDialog.open) filterDialog.close();
      toggle.focus();
    };
    closeButton?.addEventListener('click', closeDialog);
    doneButton?.addEventListener('click', closeDialog);
  }
  doc.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  setOpen(false);
}
if (typeof document !== 'undefined') initSiteNav();
