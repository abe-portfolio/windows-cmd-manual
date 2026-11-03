import { getLanguage, saveLanguage, SUPPORTED_LANGUAGES } from './core/language.js';
import { t, localizeStatic } from './i18n/translations.js';
import { shouldConfirmReset, setResetConfirmation } from './core/preferences.js';

export function initSettings(doc = document, protocol = location.protocol) {
  const toggle = doc.getElementById('confirmResetToggle');
  const status = doc.getElementById('settingsSaveStatus');
  if (!toggle || !status) return;
  toggle.checked = shouldConfirmReset(doc);
  status.textContent = t(toggle.checked ? 'resetOn' : 'resetOff');
  toggle.addEventListener('change', () => {
    setResetConfirmation(toggle.checked, doc, protocol);
    // Confirm that the browser accepted the cookie (may be blocked by policy).
    const persisted = shouldConfirmReset(doc) === toggle.checked;
    if (!persisted) toggle.checked = shouldConfirmReset(doc);
    status.textContent = persisted
      ? t(toggle.checked ? 'savedOn' : 'savedOff')
      : t('saveFailed');
  });
  const select = doc.getElementById('languageSelect');
  const apply = doc.getElementById('applyLanguageButton');
  const languageStatus = doc.getElementById('languageSaveStatus');
  if (!select || !apply || !languageStatus) return;
  let current = getLanguage(doc);
  select.value = current;
  localizeStatic(doc, current);
  const sync = () => { apply.disabled = select.value === current; };
  sync();
  select.addEventListener('change', () => { sync(); languageStatus.textContent = ''; });
  apply.addEventListener('click', () => {
    if (!Object.hasOwn(SUPPORTED_LANGUAGES, select.value)) { select.value = current; sync(); return; }
    if (select.value === current) return;
    if (!saveLanguage(select.value, doc, protocol)) {
      languageStatus.textContent = t('saveFailed', current);
      select.value = current; sync(); return;
    }
    current = select.value;
    localizeStatic(doc, current);
    status.textContent = t(toggle.checked ? 'resetOn' : 'resetOff', current);
    languageStatus.textContent = t('applied', current);
    sync();
  });
}

if (typeof document !== 'undefined') initSettings();
