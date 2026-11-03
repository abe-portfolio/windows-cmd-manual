import { shouldConfirmReset, setResetConfirmation } from './core/preferences.js';

export function initSettings(doc = document, protocol = location.protocol) {
  const toggle = doc.getElementById('confirmResetToggle');
  const status = doc.getElementById('settingsSaveStatus');
  if (!toggle || !status) return;
  toggle.checked = shouldConfirmReset(doc);
  status.textContent = toggle.checked ? '確認ダイアログ：ON（表示あり）' : '確認ダイアログ：OFF（表示なし）';
  toggle.addEventListener('change', () => {
    setResetConfirmation(toggle.checked, doc, protocol);
    // Confirm that the browser accepted the cookie (may be blocked by policy).
    const persisted = shouldConfirmReset(doc) === toggle.checked;
    if (!persisted) toggle.checked = shouldConfirmReset(doc);
    status.textContent = persisted
      ? (toggle.checked ? '保存しました：ON（表示あり）' : '保存しました：OFF（表示なし）')
      : 'Cookieに保存できませんでした。ブラウザのCookie設定をご確認ください。';
  });
}

if (typeof document !== 'undefined') initSettings();
