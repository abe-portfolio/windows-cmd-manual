import { getLanguage } from './core/language.js';
import { localizeStatic } from './i18n/translations.js';

export const CONTACT_ADDRESS = 'f45728609@gmail.com';
export const CATEGORIES = Object.freeze(['feature', 'fix', 'translation', 'other']);

export const CONTACT_TEXT = Object.freeze({
  ja: {
    page: 'お問い合わせ | Windows CMD', side: 'お問い合わせ', sideDesc: '開発者へのご意見・ご要望',
    title: '開発者へのお問い合わせ', description: '機能追加や修正のご要望、翻訳ミスのご指摘などをお寄せください。',
    translationNote: '日本語以外でのお問い合わせは、翻訳ツールを使用して内容を把握し、必要な修正などに対応します。お手数ですが、機械翻訳しやすい簡潔で分かりやすい文章でご記入ください。',
    category: 'お問い合わせの種類', subject: '件名', subjectPlaceholder: 'お問い合わせ内容の概要',
    message: 'お問い合わせ内容', messagePlaceholder: '内容を具体的にご記入ください',
    privacy: '個人情報・パスワード・APIキーなどは入力しないでください。このページは内容をサイトに保存・送信せず、ご利用のメールアプリに引き渡します。',
    sendNote: '「メールアプリを開く」を押すとメール作成画面が開きます。メールは自動送信されません。内容を確認して、ご自身で送信してください。',
    submit: 'メールアプリを開く', fallback: 'メールアプリが起動しない場合は、メールアプリの設定を確認するか、宛先に直接メールを作成してください。宛先：',
    categories: {feature:'機能追加要望', fix:'機能修正要望', translation:'翻訳ミス指摘', other:'その他'}
  },
  en: {
    page: 'Contact | Windows CMD', side: 'Contact', sideDesc: 'Feedback and requests for the developer',
    title: 'Contact the developer', description: 'Send requests for new features, bug fixes, translation corrections, or other feedback.',
    translationNote: 'For messages in languages other than Japanese, the developer will use translation tools to understand your request and address any necessary changes. Please use clear, simple wording that is easy to translate. Thank you for your understanding.',
    category: 'Request type', subject: 'Subject', subjectPlaceholder: 'A short summary of your request',
    message: 'Message', messagePlaceholder: 'Please describe your request in detail',
    privacy: 'Do not include personal information, passwords, or API keys. This website does not store or send your message; it passes the draft to your email application.',
    sendNote: 'Select “Open email app” to compose an email. The email is not sent automatically. Review it and select Send in your email application.',
    submit: 'Open email app', fallback: 'If no email application opens, configure your email app or compose a message manually to: ',
    categories: {feature:'Feature request', fix:'Bug fix / change request', translation:'Translation correction', other:'Other'}
  }
});

// Only fixed category IDs accepted; all user text is URI-encoded, never used as HTML.
export function buildContactMailto(category, subject, message, lang='ja') {
  if (!CATEGORIES.includes(category)) throw new TypeError('Invalid category');
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 100) throw new TypeError('Invalid subject');
  if (typeof message !== 'string' || !message.trim() || message.length > 1500) throw new TypeError('Invalid message');
  const language = lang === 'en' ? 'en' : 'ja';
  const categoryLabel = CONTACT_TEXT[language].categories[category];
  const mailSubject = `[CMD Playground] [${categoryLabel}] ${subject.trim().replace(/[\r\n]+/g, ' ')}`;
  const mailBody = `Category / 種類: ${categoryLabel}\r\nLanguage: ${language}\r\n\r\n${message.trim()}`;
  return `mailto:${CONTACT_ADDRESS}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
}

export function initContact(doc=document, win=window) {
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
  const subject = doc.getElementById('contactSubject');
  const message = doc.getElementById('contactMessage');
  if (subject) subject.placeholder = tr.subjectPlaceholder;
  if (message) message.placeholder = tr.messagePlaceholder;
  const form = doc.getElementById('contactForm');
  form?.addEventListener('submit', (event)=>{
    event.preventDefault();
    if (!form.reportValidity()) return;
    const category=doc.getElementById('contactCategory')?.value;
    try {
      const url=buildContactMailto(category,subject.value,message.value,lang);
      // Triggered only by the user's submit action, not automatically on load.
      win.location.href=url;
      const status=doc.getElementById('contactStatus');
      if (status) status.textContent=tr.fallback+CONTACT_ADDRESS;
    } catch {
      const status=doc.getElementById('contactStatus');
      if (status) status.textContent=tr.fallback+CONTACT_ADDRESS;
    }
  });
}
if (typeof document !== 'undefined') initContact();
