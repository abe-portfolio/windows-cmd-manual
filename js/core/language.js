// A small allowlisted preference. Never store arbitrary strings in cookies.
export const LANGUAGE_COOKIE = 'cmdpg_language';
export const SUPPORTED_LANGUAGES = Object.freeze({ ja: '日本語', en: 'English' });
export const DEFAULT_LANGUAGE = 'ja';
export function languageCookiePath() {
  const path = new URL('../../', import.meta.url).pathname;
  return path.endsWith('/') ? path : `${path}/`;
}
export function parseLanguage(cookie = '') {
  if (typeof cookie !== 'string') return DEFAULT_LANGUAGE;
  for (const segment of cookie.split(';')) {
    const separator = segment.indexOf('=');
    if (separator < 0 || segment.slice(0, separator).trim() !== LANGUAGE_COOKIE) continue;
    const value = segment.slice(separator + 1).trim();
    return Object.hasOwn(SUPPORTED_LANGUAGES, value) ? value : DEFAULT_LANGUAGE;
  }
  return DEFAULT_LANGUAGE;
}
export function getLanguage(doc = typeof document !== 'undefined' ? document : {cookie:''}) { return parseLanguage(doc?.cookie); }
export function saveLanguage(code, doc = document, protocol = location.protocol) {
  if (!Object.hasOwn(SUPPORTED_LANGUAGES, code)) throw new TypeError('Unsupported language');
  const attrs = [
    `${LANGUAGE_COOKIE}=${code}`,
    `Path=${languageCookiePath()}`,
    'SameSite=Strict'
  ];
  if (protocol === 'https:') attrs.push('Secure');
  doc.cookie = attrs.join('; '); // Session cookie, no Max-Age or Expires
  return getLanguage(doc) === code;
}
