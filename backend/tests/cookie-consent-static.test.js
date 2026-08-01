import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const app = await read('../app.js');
const styles = await read('../styles.css');
const cookiesPage = await read('../legal/cookies/index.html');
const allHtml = await collectHtml();

const checks = [
  ['consent key is v1', app.includes("const cookieConsentKey = 'w1zzydev-cookie-consent-v1'")],
  ['stored structure uses updatedAt', app.includes('updatedAt: new Date().toISOString()')],
  ['safe JSON parser exists', app.includes('function safeParseJson') && app.includes('try {') && app.includes('catch')],
  ['first visit opens settings', app.includes('if (!readCookieConsent()) window.W1ZZYDEV_OPEN_COOKIE_SETTINGS()')],
  ['necessary always enabled', app.includes("createCookieOption('necessary'") && app.includes('true, true')],
  ['save selected button', app.includes("Сохранить выбранное") && app.includes('Save selected')],
  ['cookie modal exact english title', app.includes('Data Storage Settings')],
  ['cookie modal exact english description', app.includes('We use essential storage technologies for security, active forms, chat sessions, authentication, and saving your consent choice. Functional storage saves language and theme between visits. Analytics and marketing are not currently used on the site.')],
  ['cookie modal exact english categories', ['Essential', 'Functional', 'Analytics', 'Marketing'].every(text => app.includes(text))],
  ['cookie modal exact english buttons', ['Save selected', 'Reject optional', 'Accept all available', 'Cookie Policy'].every(text => app.includes(text))],
  ['cookie modal saved message english', app.includes('Your storage preferences have been saved.')],
  ['cookie modal uses existing i18n refresh', app.includes('refreshCookieConsentTexts();') && app.includes('data-cookie-i18n')],
  ['reject optional button', app.includes("Отклонить необязательные") && app.includes('Reject optional')],
  ['accept all button', app.includes("Принять все доступные") && app.includes('Accept all available')],
  ['footer cookie settings button', app.includes('footer-cookie-settings') && app.includes('Настройки cookie')],
  ['functional storage gated', app.includes('function setFunctionalStorageValue') && app.includes("hasCookieConsent('functional')")],
  ['language direct localStorage removed', !app.includes("localStorage.setItem('w1zzy-lang'") && !app.includes("localStorage.getItem('w1zzy-lang'")],
  ['theme direct localStorage removed', !app.includes("localStorage.setItem('w1zzydev-theme-v2'") && !app.includes("localStorage.getItem('w1zzydev-theme-v2'")],
  ['optional storage cleanup', app.includes('function clearOptionalStorage') && app.includes('functionalStorageKeys.forEach')],
  ['no cookie dialog innerHTML', !app.match(/cookie-consent-panel[\\s\\S]{0,500}innerHTML/)],
  ['dialog aria modal', app.includes("role', 'dialog'") && app.includes("aria-modal', 'true'")],
  ['escape closes dialog', app.includes("event.key === 'Escape'")],
  ['focus trap implemented', app.includes("event.key !== 'Tab'") && app.includes('last.focus()')],
  ['cookie modal z-index above chat', styles.includes('--z-overlay:140') && styles.includes('z-index:var(--z-overlay)')],
  ['analytics marketing disabled', app.includes("createCookieOption('analytics', cookieConsentCopy.analytics, false, true") && app.includes("createCookieOption('marketing', cookieConsentCopy.marketing, false, true")],
  ['cookie modal hides chat while open', styles.includes('body.cookie-consent-open .float-cta') && app.includes("document.body.classList.add('cookie-consent-open')") && app.includes("document.body.classList.remove('cookie-consent-open')")],
  ['cookie modal isolated light theme colors', styles.includes('--cookie-text:#f2fbf7') && styles.includes('--cookie-muted:#b7c8c1') && styles.includes('--cookie-button-text:#eefbf7')],
  ['cookie secondary buttons visible', styles.includes('.cookie-actions .button{') && styles.includes('color:var(--cookie-button-text)')],
  ['cookie primary button keeps contrast', styles.includes('.cookie-actions .button.primary{color:#06100d!important')],
  ['cookie category copy separated', app.includes('cookie-option-copy') && styles.includes('.cookie-option-copy{display:grid;gap:4px')],
  ['mobile cookie layout', styles.includes('@media(max-width:620px)') && styles.includes('.cookie-consent-backdrop')],
  ['cookies page no draft marker', !/draft/i.test(cookiesPage)],
  ['cookies page has official ru effective date', cookiesPage.includes('действует с 31 июля 2026')],
  ['cookies page has technology table', cookiesPage.includes('Технология') && cookiesPage.includes('localStorage:w1zzydev-cookie-consent-v1')],
  ['cookies page mentions no analytics pixels', cookiesPage.includes('Google Analytics') && cookiesPage.includes('Яндекс Метрика') && cookiesPage.includes('Meta Pixel') && cookiesPage.includes('TikTok Pixel')],
  ['no analytics scripts in html', !/<script[^>]+src=["'][^"']*(googletagmanager|google-analytics|mc\.yandex|metrika|facebook\.net|connect\.facebook|tiktok)[^"']*["']/i.test(allHtml)],
  ['no marketing script APIs in html', !/(doubleclick|adsbygoogle|gtag\(|fbq\(|ttq\()/i.test(allHtml)]
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(JSON.stringify({ test: name, ok }));
if (failed.length) throw new Error(`cookie-consent-static failed: ${failed.map(([name]) => name).join(', ')}`);
console.log('cookie-consent-static.test: ok');

async function read(path) {
  return readFile(resolve(path), 'utf8');
}

async function collectHtml() {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);
  const { stdout } = await execFileAsync('find', ['..', '-maxdepth', '3', '-name', '*.html'], { maxBuffer: 1024 * 1024 * 8 });
  const files = stdout.trim().split('\n').filter(Boolean);
  const chunks = await Promise.all(files.map(file => readFile(resolve(file), 'utf8')));
  return chunks.join('\n');
}
