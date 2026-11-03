import { t } from '../i18n/translations.js';
export function createSearch(ctx) {
  const {
    commandListEl, commandSearchFormEl, commandSearchInputEl, commandSearchClearEl,
    searchNoticeDialogEl, searchNoticeTextEl, searchNoticeCloseEl, searchNoticeDoneEl
  } = ctx;
  let appliedQuery = '';

  function openNotice(message) {
    if (!searchNoticeDialogEl || !searchNoticeTextEl) return;
    searchNoticeTextEl.textContent = message;
    if (!searchNoticeDialogEl.open) searchNoticeDialogEl.showModal();
  }

  function closeNotice() {
    if (searchNoticeDialogEl?.open) searchNoticeDialogEl.close();
    commandSearchInputEl?.focus();
  }

  function applyQuery(query, notifyOnEmpty = true) {
    appliedQuery = String(query ?? '').trim();
    document.dispatchEvent(new CustomEvent('cmdpg:search-change', {
      detail: { query: appliedQuery }
    }));
    const visible = [...(commandListEl?.querySelectorAll?.('.command-link') ?? [])]
      .filter(link => !link.hidden);
    if (appliedQuery && notifyOnEmpty && visible.length === 0) {
      openNotice(t('searchNoMatch')(appliedQuery));
    }
  }

  function handleSubmit(event) {
    event?.preventDefault?.();
    applyQuery(commandSearchInputEl?.value);
  }

  // For <input type="search">, Chrome/Edge/Safari emit input/search
  // when the native clear (×) is pressed. Only clearing affects the list
  // immediately; nonempty values are applied with the Search button/Enter.
  function syncClearButton() {
    if (commandSearchClearEl) commandSearchClearEl.hidden = !commandSearchInputEl?.value;
  }

  function handleClearing() {
    syncClearButton();
    if (commandSearchInputEl?.value === '' && appliedQuery) {
      applyQuery('', false);
    }
  }

  function clearSearch() {
    if (!commandSearchInputEl) return;
    commandSearchInputEl.value = '';
    syncClearButton();
    applyQuery('', false);
    commandSearchInputEl.focus();
  }

  function initCommandSearch() {
    commandSearchFormEl?.addEventListener('submit', handleSubmit);
    commandSearchInputEl?.addEventListener('input', handleClearing);
    commandSearchInputEl?.addEventListener('search', handleClearing);
    commandSearchClearEl?.addEventListener('click', clearSearch);
    syncClearButton();
    searchNoticeCloseEl?.addEventListener('click', closeNotice);
    searchNoticeDoneEl?.addEventListener('click', closeNotice);
  }

  return { initCommandSearch };
}
