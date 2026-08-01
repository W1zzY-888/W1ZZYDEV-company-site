import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('..');
const app = await read('app.js');
const styles = await read('styles.css');
const legalConfig = await read('assets/js/legal-config.js');
const htmlFiles = [
  'legal/index.html',
  'legal/privacy/index.html',
  'legal/personal-data-consent/index.html',
  'legal/cookies/index.html',
  'legal/terms/index.html',
  'legal/data-request/index.html',
  'legal/security/index.html'
];
const legalHtml = (await Promise.all(htmlFiles.map(file => read(file)))).join('\n');
const allFrontend = legalHtml + '\n' + app + '\n' + legalConfig;

const checks = [
  ['all legal pages generated', htmlFiles.every(file => legalHtml.includes(`https://w1zzydev.com/${file.replace('index.html', '')}`) || file === 'legal/index.html')],
  ['legal center uses document cards', legalHtml.includes('legal-doc-card') && legalHtml.includes('Контакты оператора') && legalHtml.includes('Operator Contacts')],
  ['security page not indexed', (await read('legal/security/index.html')).includes('noindex,follow')],
  ['no public draft blockers', !/(DRAFT|Draft|draft|BLOCKER|LOCATION NOT VERIFIED|ARCHITECTURE_PREPARED|TODO_REQUIRED|undefined|нельзя считать|не заполнен|реквизиты не|не заполнено)/.test(legalHtml)],
  ['operator config filled with real public data', legalConfig.includes("type: 'individual'") && legalConfig.includes("fullName: 'Починков Максим'") && legalConfig.includes("businessName: 'W1ZZYDEV'") && legalConfig.includes("country: 'Россия'")],
  ['operator public wording ru en', legalHtml.includes('Оператор персональных данных: физическое лицо Починков Максим, осуществляющее деятельность под обозначением W1ZZYDEV') && legalHtml.includes('Personal Data Controller: Maxim Pochinkov, an individual operating under the W1ZZYDEV name.')],
  ['privacy contact wording ru en', legalHtml.includes('По вопросам обработки персональных данных, отзыва согласия, уточнения или удаления данных можно обратиться по адресу: w1zzydev.studio@gmail.com') && legalHtml.includes('For questions concerning personal data processing, withdrawal of consent, correction, or deletion, contact: w1zzydev.studio@gmail.com.')],
  ['no legal entity wording for w1zzydev', !/(ООО\s+W1ZZYDEV|W1ZZYDEV\s+ООО|ИП\s+Починков|ИП\s+W1ZZYDEV|W1ZZYDEV\s+ИП|W1ZZYDEV\s+legal entity|limited liability company\s+W1ZZYDEV|company\s+W1ZZYDEV|W1ZZYDEV\s+company)/i.test(legalHtml)],
  ['privacy required sections present', ['Общие положения', 'Сведения об операторе', 'Возможная трансграничная передача', 'Меры защиты', 'Version and effective date'].every(text => legalHtml.includes(text))],
  ['required transfer wording present', legalHtml.includes('При использовании отдельных внешних сервисов обработка или техническая передача данных может осуществляться') && legalHtml.includes('Where external services are used, data processing or technical transmission may involve infrastructure')],
  ['data request fields present', ['subject_name', 'reply_contact', 'request_type', 'description', 'Withdraw consent', 'Other request'].every(text => legalHtml.includes(text))],
  ['data request does not ask passport', !/<(input|select|textarea)\b[^>]*(name|id)=["'][^"']*(passport|паспорт)/i.test(await read('legal/data-request/index.html'))],
  ['legal consent exact copy', app.includes('Я даю согласие на обработку персональных данных и принимаю Политику обработки персональных данных.') && app.includes('I consent to the processing of my personal data and accept the Privacy Policy.')],
  ['cursor z scale', styles.includes('--z-cursor:220') && styles.includes('z-index:var(--z-cursor)')],
  ['cursor fallback before ready', styles.includes('html:not(.custom-cursor-ready)') && app.includes("document.documentElement.classList.add('custom-cursor-ready')")],
  ['cursor disabled for touch/reduced motion', styles.includes('(pointer:coarse)') && styles.includes('(prefers-reduced-motion:reduce)') && app.includes('prefers-reduced-motion: reduce')],
  ['cookie modal blocks body scroll', app.includes("document.body.style.overflow = 'hidden'") && app.includes("document.body.style.removeProperty('overflow')")],
  ['structured legal config', legalConfig.includes('operator:') && legalConfig.includes('website:') && legalConfig.includes('services:') && legalConfig.includes('missingRequiredForOwnerReview')],
  ['no service role in frontend', !/(service_role|SUPABASE_SERVICE_ROLE_KEY|TELEGRAM_BOT_TOKEN|SMTP_PASSWORD|DATABASE_URL=|JWT_SECRET|BEGIN .*PRIVATE)/i.test(allFrontend)],
  ['external blank links protected in legal', !/<a\b(?=[^>]*target="_blank")(?![^>]*rel="noopener noreferrer")/i.test(legalHtml)],
  ['dangerous protocols absent in legal', !/(href|src)=["']javascript:/i.test(legalHtml)],
  ['data request handled in app', app.includes("const dataRequestForm = $('#data-request-form')") && app.includes('create_data_subject_request')]
];

const failed = [];
for (const [name, ok] of checks) {
  console.log(JSON.stringify({ test: name, ok }));
  if (!ok) failed.push(name);
}
if (failed.length) throw new Error(`legal-security-static failed: ${failed.join(', ')}`);
console.log('legal-security-static.test: ok');

async function read(relative) {
  return readFile(resolve(root, relative), 'utf8');
}
