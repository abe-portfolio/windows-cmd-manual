import { getLanguage } from './core/language.js';
import { localizeStatic } from './i18n/translations.js';

export const FORM_ENDPOINT = 'https://formspree.io/f/mljjoydy';
export const CATEGORIES = Object.freeze(['feature', 'fix', 'translation', 'other']);
export const SUBJECT_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 1500;

export const CONTACT_TEXT = Object.freeze({
  ja: {
    page: 'お問い合わせ | Windows CMD', side: 'お問い合わせ', sideDesc: '開発者へのご意見・ご要望',
    title: '開発者へのお問い合わせ', description: '機能追加や修正のご要望、翻訳ミスのご指摘などをお寄せください。',
    translationNote: '日本語以外でのお問い合わせは、翻訳ツールを使用して内容を把握し、必要な修正などに対応します。お手数ですが、機械翻訳しやすい簡潔で分かりやすい文章でご記入ください。',
    category: 'お問い合わせの種類', subject: '件名', subjectPlaceholder: 'お問い合わせ内容の概要',
    message: 'お問い合わせ内容', messagePlaceholder: '内容を具体的にご記入ください',
    privacy: 'パスワード、APIキー、機密情報などは入力しないでください。送信した内容は問い合わせ受付サービスFormspreeを通じて開発者へ届きます。',
    sendNote: '「送信する」を押すと内容が送信されます。メールアプリの起動は不要です。',
    submit: '送信する', sending: '送信中…',
    success: 'お問い合わせを受け付けました。ありがとうございます。',
    error: '送信できませんでした。通信状況を確認し、時間をおいて再度お試しください。',
    invalid: '入力内容を確認してください。',
    categories: {feature:'機能追加要望', fix:'機能修正要望', translation:'翻訳ミス指摘', other:'その他'}
  },
  en: {
    page: 'Contact | Windows CMD', side: 'Contact', sideDesc: 'Feedback and requests for the developer',
    title: 'Contact the developer', description: 'Send requests for new features, bug fixes, translation corrections, or other feedback.',
    translationNote: 'For messages in languages other than Japanese, the developer will use translation tools to understand your request and address any necessary changes. Please use clear, simple wording that is easy to translate. Thank you for your understanding.',
    category: 'Request type', subject: 'Subject', subjectPlaceholder: 'A short summary of your request',
    message: 'Message', messagePlaceholder: 'Please describe your request in detail',
    privacy: 'Do not include passwords, API keys, or confidential information. Your message is delivered to the developer through the third-party form service Formspree.',
    sendNote: 'Select “Send message” to submit directly from this website. No email app is required.',
    submit: 'Send message', sending: 'Sending…',
    success: 'Your message has been received. Thank you!',
    error: 'Your message could not be sent. Please check your connection and try again later.',
    invalid: 'Please check the information you entered.',
    categories: {feature:'Feature request', fix:'Bug fix / change request', translation:'Translation correction', other:'Other'}
  }
});

// Validate locally before requesting Formspree. Raw text is never injected into HTML.
export function buildContactPayload(category, subject, message, lang='ja') {
  if (!CATEGORIES.includes(category)) throw new TypeError('Invalid category');
  if (typeof subject !== 'string' || !subject.trim() || subject.length > SUBJECT_MAX_LENGTH) throw new TypeError('Invalid subject');
  if (typeof message !== 'string' || !message.trim() || message.length > MESSAGE_MAX_LENGTH) throw new TypeError('Invalid message');
  const language = lang === 'en' ? 'en' : 'ja';
  const categoryLabel = CONTACT_TEXT[language].categories[category];
  return new URLSearchParams({
    category: categoryLabel,
    subject: `[CMD Playground] [${categoryLabel}] ${subject.trim().replace(/[\r\n]+/g, ' ')}`,
    message: message.trim(),
    language,
    source: 'CMD Playground'
  });
}

// A single endpoint is fixed in source; do not construct a URL from user input.
export async function submitContact(payload, fetcher=fetch) {
  const response = await fetcher(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: payload.toString(),
    mode: 'cors',
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'no-referrer'
  });
  return response.ok;
}

export function initContact(doc=document, fetcher=fetch) {
  const lang = getLanguage(doc);
  const tr = CONTACT_TEXT[lang] ?? CONTACT_TEXT.ja;
  localizeStatic(doc, lang);
  doc.title = tr.page;
  const mapping = {
    contactSideTitle: tr.side, contactSideDescription: tr.sideDesc, contactTitle: tr.title,
    contactDescription: tr.description, contactTranslationNote: tr.translationNote,
    contactCategoryLabel: tr.category, contactSubjectLabel: tr.subject, contactMessageLabel: tr.message,
    contactPrivacyNote: tr.privacy, contactSendNote: tr.sendNote, contactSubmit: tr.submit
  };
  for (const [id,value] of Object.entries(mapping)) {
    const element=doc.getElementById(id); if (element) element.textContent=value;
  }
  for (const [id,value] of Object.entries(tr.categories)) {
    const option=doc.querySelector(`#contactCategory option[value="${id}"]`);
    if (option) option.textContent=value;
  }
  const category = doc.getElementById('contactCategory');
  const subject = doc.getElementById('contactSubject');
  const message = doc.getElementById('contactMessage');
  const submit = doc.getElementById('contactSubmit');
  const status = doc.getElementById('contactStatus');
  if (subject) subject.placeholder = tr.subjectPlaceholder;
  if (message) message.placeholder = tr.messagePlaceholder;
  const form = doc.getElementById('contactForm');
  if (!form) return;
  let sending = false;
  const setStatus = (value, state='') => {
    if (status) {status.textContent = value; status.dataset.state=state;}
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    let payload;
    try {
      payload = buildContactPayload(category?.value, subject?.value, message?.value, lang);
    } catch {
      setStatus(tr.invalid, 'error');
      return;
    }
    sending = true;
    if (submit) { submit.disabled = true; submit.textContent = tr.sending; }
    setStatus(tr.sending, 'pending');
    try {
      const ok = await submitContact(payload, fetcher);
      if (ok) {
        setStatus(tr.success, 'success');
        form.reset();
      } else {
        setStatus(tr.error, 'error');
      }
    } catch {
      // Do not expose detailed server errors or potentially sensitive responses.
      setStatus(tr.error, 'error');
    } finally {
      sending = false;
      if (submit) { submit.disabled = false; submit.textContent = tr.submit; }
    }
  });
}
if (typeof document !== 'undefined') initContact();
