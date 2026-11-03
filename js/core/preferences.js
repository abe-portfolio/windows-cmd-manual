// Shared preference for both the CMD page and settings page.
// Stores only a fixed boolean flag, never a user-controlled string or credentials.
export const RESET_CONFIRM_COOKIE = 'cmdpg_reset_confirm';
const FLAG_ON = '1';
const FLAG_OFF = '0';

// import.meta.url makes the cookie path stable under GitHub Pages project subpaths.
// e.g. /windows-cmd-manual/ rather than the whole github.io hostname.
export function applicationCookiePath() {
  const path = new URL('../../', import.meta.url).pathname;
  return path.endsWith('/') ? path : `${path}/`;
}

export function readResetConfirmation(cookieString) {
  if (typeof cookieString !== 'string') return true;
  const tokens = cookieString.split(';');
  for (const token of tokens) {
    const eq = token.indexOf('=');
    if (eq < 0) continue;
    if (token.slice(0, eq).trim() !== RESET_CONFIRM_COOKIE) continue;
    const value = token.slice(eq + 1).trim();
    // Invalid / tampered values fail closed to confirmation ON.
    return value === FLAG_OFF ? false : true;
  }
  return true; // missing cookie: default ON
}

export function shouldConfirmReset(doc = document) {
  return readResetConfirmation(doc.cookie);
}

export function setResetConfirmation(enabled, doc = document, protocol = location.protocol) {
  if (typeof enabled !== 'boolean') throw new TypeError('enabled must be a boolean');
  // Session cookie: no Expires or Max-Age. Script-written cookies cannot be HttpOnly.
  // SameSite=Strict limits cross-site inclusion; Secure used over HTTPS.
  const attributes = [
    `${RESET_CONFIRM_COOKIE}=${enabled ? FLAG_ON : FLAG_OFF}`,
    `Path=${applicationCookiePath()}`,
    'SameSite=Strict',
  ];
  if (protocol === 'https:') attributes.push('Secure');
  doc.cookie = attributes.join('; ');
}
