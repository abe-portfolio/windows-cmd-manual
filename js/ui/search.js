import { getCommandTags, TAGS } from '../data/tags.js';

export function createSearch(ctx) {
  const {
    commandCatalog, commandListEl, commandSearchFormEl, commandSearchInputEl, searchNoticeDialogEl,
    searchNoticeTextEl, searchNoticeCloseEl, searchNoticeDoneEl, commandDetailPanelEl, state, displayCommandName
  } = ctx;
  const renderCommandDetail = (...args) => ctx.renderCommandDetail(...args);
  const resetInputNavigation = (...args) => ctx.resetInputNavigation(...args);
  const setMobileMenuOpen = (...args) => ctx.setMobileMenuOpen(...args);
  const showIntroPage = (...args) => ctx.showIntroPage(...args);

  const normalize = (value) => String(value ?? '').trim().toLowerCase();

  function buildSearchTarget(name) {
    if (name === 'intro') {
      return 'そもそもコマンドプロンプトとは？ 初めての方向け 基本解説 windows cmd';
    }
    const command = commandCatalog[name];
    if (!command) return name;
    const tags = getCommandTags(name).map((id) => TAGS[id]?.label ?? '').join(' ');
    return [
      name,
      displayCommandName(command.name),
      command.summary,
      command.description,
      tags
    ].join(' ').toLowerCase();
  }

  function openNotice(message) {
    if (!searchNoticeDialogEl || !searchNoticeTextEl) {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') window.alert(message);
      return;
    }
    searchNoticeTextEl.textContent = message;
    if (!searchNoticeDialogEl.open) searchNoticeDialogEl.showModal();
  }

  function closeNotice() {
    if (searchNoticeDialogEl?.open) searchNoticeDialogEl.close();
    commandSearchInputEl?.focus();
  }

  function getVisibleLinks() {
    return [...(commandListEl?.querySelectorAll?.('.command-link') ?? [])].filter((link) => !link.hidden);
  }

  function openCommand(name) {
    state.history = [];
    resetInputNavigation(true);
    if (name === 'intro') {
      showIntroPage();
    } else {
      renderCommandDetail(name);
      commandDetailPanelEl.classList.add('mobile-detail-visible');
      setMobileMenuOpen(false);
    }
  }

  function handleSearch(event) {
    event?.preventDefault?.();
    const query = normalize(commandSearchInputEl?.value);
    if (!query) {
      commandSearchInputEl?.focus();
      return;
    }
    const links = getVisibleLinks();
    const match = links.find((link) => buildSearchTarget(link.dataset.commandName).includes(query));
    if (!match) {
      const suffix = links.length === 0 ? ' 現在の絞り込み条件では表示対象がありません。' : '';
      openNotice(`「${commandSearchInputEl.value}」に一致する候補が見つかりませんでした。${suffix}`);
      return;
    }
    openCommand(match.dataset.commandName);
    match.scrollIntoView?.({ block: 'nearest' });
  }

  function initCommandSearch() {
    commandSearchFormEl?.addEventListener('submit', handleSearch);
    searchNoticeCloseEl?.addEventListener('click', closeNotice);
    searchNoticeDoneEl?.addEventListener('click', closeNotice);
  }

  return { initCommandSearch };
}
