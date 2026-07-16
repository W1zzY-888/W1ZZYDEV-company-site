const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const resetHorizontalScroll = () => {
  if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
};
window.addEventListener('scroll', resetHorizontalScroll, { passive: true });
window.addEventListener('resize', resetHorizontalScroll);
window.addEventListener('orientationchange', () => window.setTimeout(resetHorizontalScroll, 120));
const path = location.pathname.replace(/\/index\.html$/, '/');
const navKey = path.includes('/services') ? 'services' : path.includes('/projects') ? 'projects' : path.includes('/pricing') ? 'pricing' : path.includes('/about') ? 'about' : path.includes('/reviews') ? 'reviews' : path.includes('/contact') ? 'contact' : path.includes('/support') ? 'support' : path.includes('/client') ? 'client' : 'home';
$$('.desktop-nav,.mobile-panel').forEach(nav => {
  const contactLink = $('[data-nav="contact"]', nav);
  if (contactLink && !$('[data-nav="reviews"]', nav)) {
    const reviewsLink = document.createElement('a');
    reviewsLink.className = 'nav-link';
    reviewsLink.dataset.nav = 'reviews';
    reviewsLink.href = '/reviews/';
    reviewsLink.dataset.ru = 'Отзывы';
    reviewsLink.dataset.en = 'Reviews';
    contactLink.before(reviewsLink);
  }
});
$$(`[data-nav="${navKey}"]`).forEach(link => link.classList.add('active'));
$$('footer a[href="https://github.com/W1zzY-888"]').forEach(link => {
  link.href = 'https://wa.me/message/ICHYJGLJUYAWI1';
  link.textContent = 'WhatsApp';
});
$$('.footer-grid > div').forEach(column => {
  const heading = $('strong', column);
  const isContactColumn = heading?.dataset.ru === 'Связь' || heading?.dataset.en === 'Contact';
  if (!isContactColumn || $('a[href*="instagram.com/w1zzydev"]', column)) return;
  const instagram = document.createElement('a');
  instagram.href = 'https://www.instagram.com/w1zzydev?igsh=Nnd5ZWNtMmNqeGI1&utm_source=qr';
  instagram.target = '_blank';
  instagram.rel = 'noopener noreferrer';
  instagram.textContent = 'Instagram';
  column.appendChild(instagram);
});
$$('.footer').forEach(footer => {
  if ($('.footer-grid', footer)) return;
  const container = $('.container', footer);
  const bottom = $('.footer-bottom', footer);
  if (!container || !bottom) return;
  const grid = document.createElement('div');
  grid.className = 'footer-grid footer-grid-generated';
  grid.innerHTML = `<div><a class="brand" href="/"><span class="brand-mark">&lt;W1D&gt;</span>W1ZZYDEV</a><p data-ru="Premium digital & software development: сайты, интерфейсы, приложения, автоматизация и развитие проектов." data-en="Premium digital & software development: websites, interfaces, apps, automation and project growth."></p></div>
    <div><strong data-ru="Навигация" data-en="Navigation"></strong><a href="/services/" data-ru="Услуги" data-en="Services"></a><a href="/projects/" data-ru="Проекты" data-en="Projects"></a><a href="/pricing/" data-ru="Цены" data-en="Pricing"></a><a href="/about/" data-ru="О студии" data-en="About"></a><a href="/reviews/" data-ru="Отзывы" data-en="Reviews"></a><a href="/contact/" data-ru="Контакты" data-en="Contact"></a><a href="/support/" data-ru="Техподдержка" data-en="Support"></a></div>
    <div><strong data-ru="Услуги" data-en="Services"></strong><a href="/services/#web-development">Web Development</a><a href="/services/#software-development">Software Development</a><a href="/services/#ui-ux-digital-design">UI/UX Design</a><a href="/services/#technical-support">Technical Support</a></div>
    <div><strong data-ru="Связь" data-en="Contact"></strong><a href="https://t.me/W1zzY228" target="_blank" rel="noopener noreferrer">Telegram</a><a href="mailto:w1zzydev.studio@gmail.com">Email</a><a href="https://www.instagram.com/w1zzydev?igsh=Nnd5ZWNtMmNqeGI1&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://wa.me/message/ICHYJGLJUYAWI1" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>`;
  container.insertBefore(grid, bottom);
});
$$('.brand').forEach(brand => {
  const mark = $('.brand-mark', brand);
  if (mark) {
    const icon = document.createElement('img');
    icon.className = 'brand-icon';
    icon.src = '/assets/favicon.png';
    icon.alt = '';
    mark.replaceWith(icon);
  }
});
if (navKey === 'home') {
  const hero = $('main .hero');
  if (hero && !$('.brand-banner') && document.body.dataset.showBrandBanner === 'true') {
    const banner = document.createElement('section');
    banner.className = 'brand-banner container reveal';
    banner.setAttribute('aria-label', 'W1ZZYDEV banner');
    banner.innerHTML = '<img src="/assets/w1zzydev-banner.png" alt="W1ZZYDEV">';
    hero.before(banner);
  }
}


if (navKey === 'services') {
  const lastSection = $$('main > .section').at(-1);
  if (lastSection) {
    const faqSection = document.createElement('section');
    faqSection.className = 'section dark-band faq-section';
    faqSection.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow">FAQ</p><h2 data-ru="Частые вопросы перед стартом." data-en="Common questions before we start."></h2></div></div><div class="faq-list">
      <details><summary data-ru="Сколько занимает разработка?" data-en="How long does development take?"></summary><p data-ru="Лендинг обычно занимает 7–14 дней, сайт компании — 14–28 дней, сложное веб-приложение — от 30 дней." data-en="A landing page usually takes 7–14 days, a company website 14–28 days, and a complex web app starts from 30 days."></p></details>
      <details><summary data-ru="Можно ли внести изменения?" data-en="Can I request changes?"></summary><p data-ru="Да. Правки проходят на согласованных этапах, чтобы результат точно соответствовал задаче." data-en="Yes. Revisions are made at agreed stages so the result precisely matches the goal."></p></details>
      <details><summary data-ru="Что входит в поддержку?" data-en="What is included in support?"></summary><p data-ru="Технические исправления, обновление контента, новые блоки, контроль стабильности и консультации." data-en="Technical fixes, content updates, new sections, stability checks and consultations."></p></details>
      <details><summary data-ru="Есть ли SEO?" data-en="Is SEO included?"></summary><p data-ru="Да. Базовая SEO-подготовка включает структуру заголовков, метаданные, sitemap, robots.txt и оптимизацию загрузки." data-en="Yes. Basic SEO includes heading structure, metadata, sitemap, robots.txt and loading optimization."></p></details>
    </div></div>`;
    lastSection.before(faqSection);
  }
}

const technologies = [
  ['HTML5','html5/html5-original.svg','https://developer.mozilla.org/docs/Web/HTML'],['CSS3','css3/css3-original.svg','https://developer.mozilla.org/docs/Web/CSS'],['JavaScript','javascript/javascript-original.svg','https://developer.mozilla.org/docs/Web/JavaScript'],['TypeScript','typescript/typescript-original.svg','https://www.typescriptlang.org/'],['React','react/react-original.svg','https://react.dev/'],['Next.js','nextjs/nextjs-original.svg','https://nextjs.org/'],['Node.js','nodejs/nodejs-original.svg','https://nodejs.org/'],['Tailwind','tailwindcss/tailwindcss-original.svg','https://tailwindcss.com/'],['PostgreSQL','postgresql/postgresql-original.svg','https://www.postgresql.org/'],['Figma','figma/figma-original.svg','https://www.figma.com/'],['GitHub','github/github-original.svg','https://github.com/']
];
$$('.tech-cloud').forEach(cloud => {
  cloud.classList.add('tech-logo-grid');
  cloud.innerHTML = technologies.map(([name,file,url]) => `<a class="tech-logo" data-tech="${name}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name}"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${file}" alt=""><b>${name}</b><small>↗</small></a>`).join('');
});

function makeCardInteractive(card, href, label) {
  if (!card || !href || card.dataset.interactive === 'true') return;
  card.dataset.interactive = 'true';
  card.dataset.href = href;
  card.classList.add('clickable-card');
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  if (label) card.setAttribute('aria-label', label);
  const open = event => {
    if (event.target.closest('a,button,input,select,textarea,summary,label')) return;
    location.assign(href);
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      location.assign(href);
    }
  });
}

const serviceSlugs = ['web-development','software-development','mobile-applications','ui-ux-digital-design','ai-integration-automation','technical-support'];
$$('.service-card').forEach((card, index) => {
  card.id = serviceSlugs[index] || `service-${index + 1}`;
  makeCardInteractive(card, `/contact/?service=${serviceSlugs[index] || 'custom'}`, `${$('h3', card)?.textContent || 'Услуга'} — обсудить проект`);
});
if (navKey === 'home') {
  $$('.grid-4 .reason-card').forEach((card, index) => makeCardInteractive(card, `/services/#${['web-development','software-development','mobile-applications','ui-ux-digital-design'][index]}`, `${$('h3', card)?.textContent || 'Услуга'} — открыть услугу`));
  $$('.process-card').forEach((card, index) => makeCardInteractive(card, `/contact/?step=${index + 1}`, `${$('h3', card)?.textContent || 'Этап'} — обсудить проект`));
  $$('.trust-cards .reason-card').forEach(card => makeCardInteractive(card, '/about/', `${$('h3', card)?.textContent || 'Преимущество'} — о студии`));
}
$$('.project-card').forEach(card => {
  const link = $('a[href]', card);
  if (link) makeCardInteractive(card, link.getAttribute('href'), `${$('h3', card)?.textContent || 'Проект'} — открыть`);
});
$$('.pricing-card').forEach((card, index) => makeCardInteractive(card, `/contact/?plan=${['start','business','custom'][index] || 'custom'}`, `${$('h3', card)?.textContent || 'Тариф'} — выбрать`));
$$('.reason-card:not(.clickable-card)').forEach(card => makeCardInteractive(card, '/contact/', `${$('h3', card)?.textContent || 'Подробнее'} — обсудить проект`));

const contactFormForParameters = $('#project-form');
if (contactFormForParameters) {
  const parameters = new URLSearchParams(location.search);
  const typeSelect = contactFormForParameters.elements.type;
  const requested = parameters.get('service') || parameters.get('plan');
  const requestedIndex = { landing:0, start:0, 'web-development':0, corporate:1, business:1, 'software-development':1, commerce:2, 'mobile-applications':2, 'web-app':3, custom:3, 'ui-ux':4, 'ui-ux-digital-design':4, 'ai-integration-automation':4, support:5, 'technical-support':5 }[requested];
  if (typeSelect && !Array.from(typeSelect.options).some(option => option.value === 'support' || option.textContent.includes('Technical Support'))) {
    const supportOption = document.createElement('option');
    supportOption.value = 'support';
    supportOption.textContent = localStorage.getItem('w1zzy-lang') === 'en' ? 'Support & Improvement' : 'Поддержка и доработка';
    typeSelect.appendChild(supportOption);
  }
  if (typeSelect && Number.isInteger(requestedIndex)) typeSelect.selectedIndex = requestedIndex;
}

const canonicalUrl = `https://w1zzydev.com${path === '/' ? '/' : path}`;
let canonical = $('link[rel="canonical"]');
if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
canonical.href = canonicalUrl;
function setMeta(selector, attribute, value, content) {
  let meta = $(selector);
  if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, value); document.head.appendChild(meta); }
  meta.content = content;
}
setMeta('meta[property="og:type"]','property','og:type','website');
setMeta('meta[property="og:title"]','property','og:title',document.title);
setMeta('meta[property="og:description"]','property','og:description',$('meta[name="description"]')?.content || 'W1ZZYDEV digital studio');
setMeta('meta[property="og:url"]','property','og:url',canonicalUrl);
setMeta('meta[property="og:image"]','property','og:image','https://w1zzydev.com/assets/w1zzydev-banner.png');
setMeta('meta[name="twitter:card"]','name','twitter:card','summary_large_image');
setMeta('meta[name="twitter:title"]','name','twitter:title',document.title);
setMeta('meta[name="twitter:description"]','name','twitter:description',$('meta[name="description"]')?.content || 'W1ZZYDEV digital studio');
setMeta('meta[name="twitter:image"]','name','twitter:image','https://w1zzydev.com/assets/w1zzydev-banner.png');

const menu = $('.menu-toggle');
const panel = $('.mobile-panel');
if (menu && panel) {
  const backdrop = document.createElement('button');
  backdrop.className = 'mobile-menu-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Закрыть меню');
  document.body.append(backdrop, panel);

  const closeMenu = () => {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };

  menu.addEventListener('click', event => {
    event.stopPropagation();
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  backdrop.addEventListener('click', closeMenu);
  panel.addEventListener('click', event => {
    if (event.target === panel) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
  $$('a', panel).forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const destination = link.getAttribute('href');
    closeMenu();
    if (destination) location.assign(destination);
  }));
}

const oldLangButton = $('.lang');
const displayActions = document.createElement('div');
displayActions.className = 'actions';
displayActions.setAttribute('aria-label', 'Настройки отображения');
displayActions.innerHTML = '<button class="theme-button" type="button" aria-label="Включить светлую тему" aria-pressed="false"><span aria-hidden="true">◐</span></button><button class="lang-button active" type="button" data-language="ru">RU</button><button class="lang-button" type="button" data-language="en">EN</button>';
oldLangButton?.replaceWith(displayActions);
const langButtons = $$('[data-language]');
const themeButton = $('.theme-button');
let lang = localStorage.getItem('w1zzy-lang') || 'ru';
const pricingValues = [
  { rub: '45 000 ₽', usd: '$600' },
  { rub: '90 000 ₽', usd: '$1,200' },
  { rub: '220 000 ₽', usd: '$3,000' }
];
$$('.pricing-card .price').forEach((price, index) => {
  price.dataset.priceRub = pricingValues[index]?.rub || '';
  price.dataset.priceUsd = pricingValues[index]?.usd || '';
});
const budgetValues = [
  { ru: 'До 50 000 ₽', en: 'Up to $700' },
  { ru: '50 000–100 000 ₽', en: '$700–$1,400' },
  { ru: '100 000–250 000 ₽', en: '$1,400–$3,500' },
  { ru: 'От 250 000 ₽', en: 'From $3,500' }
];
const projectTitleTranslations = {
  DESIGNERPORTFOLIO: { ru: 'ПОРТФОЛИО ДИЗАЙНЕРА', en: 'DESIGNER PORTFOLIO' }
};
$$('.project-card h3, .case-hero h1').forEach(title => {
  const key = title.textContent.replace(/\s+/g, '').toUpperCase();
  const translation = projectTitleTranslations[key];
  if (!translation) return;
  title.dataset.ru = translation.ru;
  title.dataset.en = translation.en;
});
$$('.project-card .button').forEach(button => {
  if (button.textContent.trim().toLowerCase() !== 'view case') return;
  button.dataset.ru = 'Смотреть кейс';
  button.dataset.en = 'View case';
});
function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  const copyOverrides = {
    ru: { 'Маленькая студия с персональной ответственностью.': 'Веб-студия с полной ответственностью за результат.' },
    en: { 'A focused studio with personal responsibility.': 'A web studio fully accountable for the result.' }
  };
  $$('[data-ru][data-en]').forEach(element => {
    const source = element.dataset[lang] || '';
    element.textContent = (copyOverrides[lang]?.[source] || source).replace(/\\n/g, ' ');
  });
  $$('[data-placeholder-ru]').forEach(element => { element.placeholder = element.dataset[`placeholder${lang === 'ru' ? 'Ru' : 'En'}`]; });
  langButtons.forEach(button => button.classList.toggle('active', button.dataset.language === lang));
  $$('[data-price-rub]').forEach(price => {
    const value = lang === 'ru' ? price.dataset.priceRub : price.dataset.priceUsd;
    price.innerHTML = `<small>${lang === 'ru' ? 'от' : 'from'}</small> ${value}`;
  });
  const budgetSelect = $('select[name="budget"]');
  if (budgetSelect) Array.from(budgetSelect.options).forEach((option, index) => { if (budgetValues[index]) option.textContent = budgetValues[index][lang]; });
  const title = document.body.dataset[`title${lang === 'ru' ? 'Ru' : 'En'}`];
  const description = document.body.dataset[`description${lang === 'ru' ? 'Ru' : 'En'}`];
  if (title) document.title = title;
  if (description) $('meta[name="description"]')?.setAttribute('content', description);
  localStorage.setItem('w1zzy-lang', lang);
}
langButtons.forEach(button => button.addEventListener('click', () => setLang(button.dataset.language)));
setLang(lang);

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = nextTheme;
  themeButton?.setAttribute('aria-pressed', String(nextTheme === 'light'));
  themeButton?.setAttribute('aria-label', nextTheme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему');
  localStorage.setItem('w1zzydev-theme-v2', nextTheme);
}
setTheme(localStorage.getItem('w1zzydev-theme-v2') || 'dark');
themeButton?.addEventListener('click', () => setTheme(document.body.dataset.theme === 'light' ? 'dark' : 'light'));

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  $$('.project-item').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
}));

const rateLimitWindow = 30000;
function cleanFormValue(value, maxLength = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
function cleanMultilineValue(value, maxLength = 2000) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, maxLength);
}
function setFormStatus(status, message, type = 'success') {
  if (!status) return;
  status.textContent = message;
  status.classList.remove('success', 'error');
  status.classList.add('visible', type);
}
function hasSpamSignal(formElement) {
  return cleanFormValue(new FormData(formElement).get('website'), 120).length > 0;
}
function isRateLimited(key) {
  const now = Date.now();
  const last = Number(sessionStorage.getItem(key) || 0);
  if (last && now - last < rateLimitWindow) return true;
  sessionStorage.setItem(key, String(now));
  return false;
}
function isSoftSpamLimited(key, limit = 8, windowMs = 10000) {
  const now = Date.now();
  const items = JSON.parse(sessionStorage.getItem(key) || '[]')
    .map(Number)
    .filter(value => Number.isFinite(value) && now - value < windowMs);
  if (items.length >= limit) return true;
  items.push(now);
  sessionStorage.setItem(key, JSON.stringify(items));
  return false;
}
function base64Url(bytes) {
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function createGuestToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}
async function hashGuestToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return base64Url(new Uint8Array(digest));
}
const discussionText = 'Здравствуйте! Я оставил заявку на сайте W1ZZYDEV и хочу продолжить обсуждение проекта.';
const supportText = 'Здравствуйте! Я создал обращение в поддержку W1ZZYDEV и хочу продолжить обсуждение.';
const channelLabels = {
  site_chat: { ru: 'Чат на сайте', en: 'Website chat' },
  telegram: { ru: 'Telegram', en: 'Telegram' },
  whatsapp: { ru: 'WhatsApp', en: 'WhatsApp' },
  instagram: { ru: 'Instagram', en: 'Instagram' },
  email: { ru: 'Email', en: 'Email' },
  undecided: { ru: 'Не определился', en: 'Not sure yet' }
};
function channelLabel(value) {
  return channelLabels[value]?.[lang] || channelLabels[value]?.ru || value || '—';
}
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
function authRedirectUrl(pathname = '/client/') {
  const origin = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? location.origin
    : 'https://w1zzydev.com';
  return `${origin}${pathname}`;
}
function externalChannelUrl(channel, text = discussionText, subject = 'W1ZZYDEV') {
  const encoded = encodeURIComponent(text);
  if (channel === 'telegram') return `https://t.me/W1zzY228?text=${encoded}`;
  if (channel === 'whatsapp') return `https://wa.me/message/ICHYJGLJUYAWI1?text=${encoded}`;
  if (channel === 'instagram') return 'https://www.instagram.com/w1zzydev?igsh=Nnd5ZWNtMmNqeGI1&utm_source=qr';
  if (channel === 'email') return `mailto:w1zzydev.studio@gmail.com?subject=${encodeURIComponent(subject)}&body=${encoded}`;
  return '/client/';
}
function updateChannelActionLinks(container, text = discussionText, subject = 'W1ZZYDEV') {
  if (!container) return;
  $$('[data-lead-action], [data-support-channel]', container).forEach(element => {
    const channel = element.dataset.leadAction || element.dataset.supportChannel;
    if (!channel || channel === 'site_chat') return;
    element.setAttribute('href', externalChannelUrl(channel, text, subject));
  });
}
function updateContactDetailUI(formElement) {
  if (!formElement) return;
  const method = formElement?.elements?.contact_method?.value || 'site_chat';
  const input = $('[data-contact-detail]', formElement);
  const label = $('#contact-detail-label', formElement);
  if (!input || !label) return;
  const config = {
    site_chat: ['Email для защищённого диалога', 'Email for secure dialog', 'name@example.com', 'name@example.com'],
    telegram: ['Telegram username или ссылка', 'Telegram username or link', '@username или https://t.me/username', '@username or https://t.me/username'],
    whatsapp: ['Номер WhatsApp', 'WhatsApp number', '+7...', '+1...'],
    instagram: ['Instagram username', 'Instagram username', '@username', '@username'],
    email: ['Email', 'Email', 'name@example.com', 'name@example.com'],
    undecided: ['Контакт для ответа', 'Contact for reply', 'Email, телефон или username', 'Email, phone or username']
  }[method] || [];
  label.dataset.ru = config[0];
  label.dataset.en = config[1];
  label.textContent = lang === 'en' ? config[1] : config[0];
  input.dataset.placeholderRu = config[2];
  input.dataset.placeholderEn = config[3];
  input.placeholder = lang === 'en' ? config[3] : config[2];
  input.type = method === 'site_chat' || method === 'email' ? 'email' : 'text';
}
async function submitLeadToSupabase(payload) {
  const submissionKey = payload.submissionKey || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await supabaseRequest('/rest/v1/leads', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name: payload.name,
      contact: payload.contact,
      contact_method: payload.contactMethod || payload.preferredChannel || 'undecided',
      preferred_channel: payload.preferredChannel || payload.contactMethod || 'undecided',
      project_type: payload.projectType,
      description: payload.description,
      source: payload.source || 'website',
      submission_key: submissionKey,
      locale: lang
    })
  });
  return { submissionKey };
}

const form = $('#project-form');
let lastLeadSubmissionKey = '';
updateContactDetailUI(form);
form?.elements?.contact_method?.addEventListener('change', () => {
  updateContactDetailUI(form);
  const method = form.elements.contact_method.value;
  const matchingChannel = form.querySelector(`input[name="channel"][value="${method}"]`);
  if (matchingChannel) matchingChannel.checked = true;
});
form?.addEventListener('change', event => {
  const channel = event.target.closest('input[name="channel"]');
  if (!channel || !form.elements.contact_method) return;
  if (['site_chat', 'telegram', 'whatsapp', 'instagram', 'email'].includes(channel.value)) {
    form.elements.contact_method.value = channel.value;
    updateContactDetailUI(form);
  }
});
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const status = $('#form-status');
  const button = $('button[type="submit"]', form);
  const nextActions = $('#lead-next-actions');
  nextActions?.classList.add('hidden');
  if (hasSpamSignal(form)) {
    setFormStatus(status, lang === 'ru' ? 'Заявка принята. Если нужно, отправьте сообщение удобным способом связи.' : 'Request accepted. If needed, send the message via your preferred channel.');
    form.reset();
    updateContactDetailUI(form);
    return;
  }
  if (isRateLimited('w1zzydev-project-form-last')) {
    setFormStatus(status, lang === 'ru' ? 'Заявка уже подготовлена. Подождите немного перед повторной отправкой.' : 'The request is already prepared. Please wait a moment before sending again.', 'error');
    return;
  }
  const name = cleanFormValue(data.get('name'), 80);
  const contact = cleanFormValue(data.get('contact'), 160);
  const contactMethod = cleanFormValue(data.get('contact_method'), 40) || 'undecided';
  const type = cleanFormValue(data.get('type'), 80);
  const budget = cleanFormValue(data.get('budget'), 80);
  const task = cleanMultilineValue(data.get('message'), 2000);
  const message = `${discussionText}\n\nИмя: ${name}\nКонтакт: ${contact}\nСпособ связи: ${channelLabel(contactMethod)}\nТип проекта: ${type}\nБюджет: ${budget}\n\nЗадача:\n${task}`;
  const channel = cleanFormValue(data.get('channel'), 40) || contactMethod;
  if (button) button.disabled = true;
  const submissionKey = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    const createdLead = await submitLeadToSupabase({ name, contact, contactMethod, preferredChannel: contactMethod, projectType: type, description: task, source: `contact:${contactMethod}`, website: cleanFormValue(data.get('website'), 120), submissionKey });
    lastLeadSubmissionKey = createdLead.submissionKey || submissionKey;
    navigator.clipboard?.writeText(discussionText).catch(() => {});
    updateChannelActionLinks(nextActions, discussionText, `W1ZZYDEV — ${type}`);
    form.reset();
    updateContactDetailUI(form);
    nextActions?.classList.remove('hidden');
    setFormStatus(status, lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.');
    await attachLeadToUniversalChat({ submissionKey: lastLeadSubmissionKey, name, contact, type, task, channel });
  } catch (error) {
    setFormStatus(status, (lang === 'ru' ? 'Не удалось сохранить заявку в Supabase: ' : 'Could not save the request in Supabase: ') + String(error.message || error), 'error');
  } finally {
    if (button) button.disabled = false;
  }
});

$('#lead-next-actions')?.addEventListener('click', event => {
  const siteButton = event.target.closest('[data-lead-action="site_chat"]');
  if (!siteButton) return;
  openUniversalChat({ notice: lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.' });
});

const homeProjectForm = $('#home-project-form');
homeProjectForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!homeProjectForm.reportValidity()) return;
  const data = new FormData(homeProjectForm);
  const status = $('#home-form-status');
  const button = $('button[type="submit"]', homeProjectForm);
  if (hasSpamSignal(homeProjectForm)) {
    setFormStatus(status, lang === 'ru' ? 'Спасибо. Заявка принята.' : 'Thank you. The request has been accepted.');
    homeProjectForm.reset();
    return;
  }
  if (isRateLimited('w1zzydev-home-project-form-last')) {
    setFormStatus(status, lang === 'ru' ? 'Заявка уже сформирована. Подождите немного перед повторной отправкой.' : 'The request is already prepared. Please wait a moment before submitting again.', 'error');
    return;
  }
  const name = cleanFormValue(data.get('name'), 80);
  const contact = cleanFormValue(data.get('contact'), 160);
  const type = cleanFormValue(data.get('type'), 80);
  const task = cleanMultilineValue(data.get('message'), 2000);
  const message = `Заявка W1ZZYDEV\n\nИмя: ${name}\nСвязь: ${contact}\nТип проекта: ${type}\n\nЗадача:\n${task}`;
  if (button) button.disabled = true;
  const submissionKey = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    const created = await submitLeadToSupabase({ name, contact, projectType: type, description: task, source: 'homepage', website: cleanFormValue(data.get('website'), 120), submissionKey });
    navigator.clipboard?.writeText(message).catch(() => {});
    setFormStatus(status, lang === 'ru' ? 'Спасибо. Заявка создана, продолжим обсуждение в чате.' : 'Thank you. The request was created; we can continue in chat.');
    await attachLeadToUniversalChat({ submissionKey: created.submissionKey || submissionKey, name, contact, type, task });
    homeProjectForm.reset();
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Не удалось отправить заявку на сервер. Попробуйте ещё раз или напишите через контакты ниже.' : 'Could not submit the request to the server. Please try again or use the contact links below.', 'error');
  } finally {
    window.setTimeout(() => { if (button) button.disabled = false; }, 1800);
  }
});

const useLocalReviewDatabase = new URLSearchParams(location.search).has('test');
const reviewsDatabaseName = 'w1zzydev-reviews-test';
let supabaseConfigPromise;

async function getSupabaseConfig() {
  if (!supabaseConfigPromise) {
    supabaseConfigPromise = fetch('/supabase-config.json', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Supabase configuration is unavailable');
      const config = await response.json();
      const url = String(config.url || '').replace(/\/$/, '');
      const anonKey = String(config.anonKey || '');
      if (!url.startsWith('https://') || !anonKey || anonKey.includes('PASTE_')) throw new Error('Supabase is not connected');
      return { url, anonKey };
    });
  }
  return supabaseConfigPromise;
}

function normalizeSupabaseReview(review) {
  return {
    id: review.id,
    name: review.name,
    company: review.company || '',
    rating: Number(review.rating),
    text: review.text,
    status: review.status,
    published: review.status === 'published',
    createdAt: review.created_at,
    moderatedAt: review.moderated_at || null
  };
}

const publicReviewFallbacks = [
  {
    id: 'featured-daria-gorodnichaya',
    name: 'Дарья Городничая',
    company: 'Дизайнер',
    companyEn: 'Designer',
    rating: 5,
    text: 'Очень понравилось работать с Максимом, все объяснил до мелочей, рассказал все тонкости и показал как будет продвигаться работа. Сроки сумасшедшие - 7 дней и сайт готов, я в восторге.',
    textEn: 'I really enjoyed working with Maxim. He explained every detail, covered the important nuances and showed how the work would move forward. The timeline was incredible - 7 days and the site was ready. I am delighted.',
    status: 'published',
    published: true,
    createdAt: '2026-06-21T00:00:00.000Z',
    moderatedAt: '2026-06-21T00:00:00.000Z'
  }
];
const featuredReviewFallbacks = publicReviewFallbacks;

function normalizeReviewFingerprint(review) {
  return [
    review.id && String(review.id).replace(/^featured-/, ''),
    review.name,
    review.company,
    review.rating,
    review.text
  ].filter(Boolean).join('|').toLowerCase().replace(/\s+/g, ' ').trim();
}

function uniqueReviews(reviews) {
  const seen = new Set();
  return reviews.filter(review => {
    const key = normalizeReviewFingerprint(review);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function supabaseRequest(pathname, options = {}, accessToken = '') {
  const config = await getSupabaseConfig();
  const response = await fetch(`${config.url}${pathname}`, {
    ...options,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken || config.anonKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const details = await response.text();
    let parsed = null;
    try {
      parsed = details ? JSON.parse(details) : null;
    } catch (error) {
      parsed = null;
    }
    const error = new Error(parsed?.message || details || `Supabase request failed: ${response.status}`);
    error.status = response.status;
    error.code = parsed?.code || '';
    error.details = parsed?.details || '';
    error.hint = parsed?.hint || '';
    error.supabase = parsed || details;
    error.pathname = pathname;
    throw error;
  }
  if (response.status === 204) return null;
  const content = await response.text();
  return content ? JSON.parse(content) : null;
}

const universalChatStorageKey = 'w1zzydev-universal-chat-v1';
const universalChatPublicPaths = ['/', '/services/', '/projects/', '/pricing/', '/about/', '/reviews/', '/contact/', '/support/'];
const universalChatState = {
  widgetState: 'closed',
  open: false,
  ready: false,
  token: '',
  tokenHash: '',
  conversationId: '',
  messages: [],
  unread: 0,
  pollTimer: 0,
  lastSyncAt: '',
  lastMessageId: '',
  conversationStatus: 'new',
  closedAt: '',
  ratingSubmitted: false,
  sending: false,
  toastTimer: 0,
  category: 'question'
};
const chatCategoryLabels = {
  project: { ru: 'Хочу обсудить проект', en: 'Discuss a project' },
  consultation: { ru: 'Нужна консультация', en: 'Need a consultation' },
  question: { ru: 'У меня вопрос', en: 'I have a question' },
  support: { ru: 'Нужна техподдержка', en: 'Need support' }
};
const chatSenderLabels = {
  client: { ru: 'Клиент', en: 'Client' },
  owner: { ru: 'W1ZZYDEV', en: 'W1ZZYDEV' },
  assistant: { ru: 'Помощник', en: 'Assistant' },
  system: { ru: 'Система', en: 'System' }
};
const chatStatusLabels = {
  new: { ru: 'Новый', en: 'New' },
  waiting_owner: { ru: 'Нужен ответ', en: 'Needs reply' },
  waiting_client: { ru: 'Ожидает клиента', en: 'Waiting client' },
  in_progress: { ru: 'В работе', en: 'In progress' },
  closed: { ru: 'Закрыт', en: 'Closed' }
};
const assistantResponseProvider = {
  replies: {
    pricing: {
      ru: 'Стоимость зависит от объёма и сложности. После краткого описания задачи W1ZZYDEV подготовит оценку и этапы работы.',
      en: 'Cost depends on scope and complexity. After a short brief, W1ZZYDEV will prepare an estimate and work stages.'
    },
    timeline: {
      ru: 'Сроки зависят от структуры, контента и интеграций. Небольшие сайты обычно оцениваются быстрее, сложные продукты разбиваются на этапы.',
      en: 'Timing depends on structure, content and integrations. Smaller sites are estimated faster; complex products are split into stages.'
    },
    process: {
      ru: 'Работа проходит по этапам: обсуждение, оценка, прототип или дизайн, разработка, тестирование, запуск и поддержка.',
      en: 'The process includes discussion, estimate, prototype or design, development, testing, launch and support.'
    },
    support: {
      ru: 'W1ZZYDEV может помогать с доработками, исправлениями, обновлением страниц, скоростью и развитием уже запущенного сайта.',
      en: 'W1ZZYDEV can help with improvements, fixes, page updates, speed and growth of an existing website.'
    },
    specialist: {
      ru: 'Специалист подключится к диалогу.',
      en: 'A specialist will join the conversation.'
    }
  },
  get(key) {
    return this.replies[key]?.[lang] || this.replies[key]?.ru || '';
  }
};
function chatLabel(map, key) {
  return map[key]?.[lang] || map[key]?.ru || key || '—';
}
function createClientMessageId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)}`;
}
function normalizeChatMessage(message) {
  const serverId = message.id && !String(message.id).startsWith('temp-') ? message.id : '';
  const deliveryStatus = message.delivery_status || (message.failed ? 'failed' : message.pending ? 'sending' : 'sent');
  return {
    id: message.id || (message.client_message_id ? `temp-${message.client_message_id}` : createClientMessageId('local')),
    conversation_id: message.conversation_id || '',
    client_message_id: message.client_message_id || '',
    sender: message.sender || message.sender_role || 'system',
    sender_role: message.sender_role || message.sender || 'system',
    body: message.body || '',
    created_at: message.created_at || new Date().toISOString(),
    conversation_status: message.conversation_status || '',
    closed_at: message.closed_at || '',
    rating_submitted: Boolean(message.rating_submitted),
    delivery_status: deliveryStatus,
    error_message: message.error_message || null,
    pending: deliveryStatus === 'sending' || Boolean(message.pending),
    failed: deliveryStatus === 'failed' || Boolean(message.failed),
    server_id: serverId
  };
}
function isLocalUnsentMessage(message) {
  return ['sending', 'failed'].includes(message?.delivery_status) || message?.pending || message?.failed || String(message?.id || '').startsWith('temp-');
}
function mergeChatMessages(currentMessages, incomingMessages) {
  const byKey = new Map();
  [...currentMessages, ...incomingMessages].map(normalizeChatMessage).forEach(message => {
    const hasServerId = message.server_id || (message.id && !String(message.id).startsWith('temp-'));
    const keys = [hasServerId ? message.id : '', message.client_message_id].filter(Boolean);
    const existingKey = keys.find(key => byKey.has(key));
    const existing = existingKey ? byKey.get(existingKey) : null;
    const serverArrived = Boolean(hasServerId);
    const next = existing
      ? {
          ...existing,
          ...message,
          id: serverArrived ? message.id : existing.id,
          server_id: serverArrived ? message.id : existing.server_id,
          delivery_status: serverArrived ? 'sent' : message.delivery_status,
          pending: serverArrived ? false : message.pending,
          failed: serverArrived ? false : message.failed,
          error_message: serverArrived ? null : message.error_message
        }
      : message;
    keys.forEach(key => byKey.set(key, next));
  });
  return [...new Set(byKey.values())].sort((a, b) => {
    const byDate = new Date(a.created_at) - new Date(b.created_at);
    return byDate || String(a.id || a.client_message_id).localeCompare(String(b.id || b.client_message_id));
  });
}
function mergeById(currentItems, incomingItems) {
  const map = new Map();
  [...(currentItems || []), ...(incomingItems || [])].filter(item => item?.id).forEach(item => {
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  });
  return [...map.values()].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
}
function messageClass(message) {
  return ['message-bubble', message.sender || 'system', message.pending ? 'pending' : '', message.failed ? 'failed' : ''].filter(Boolean).join(' ');
}
function upsertMessage(message, state = universalChatState) {
  state.messages = mergeChatMessages(state.messages || [], [message]);
  const last = state.messages.at(-1);
  state.lastSyncAt = last?.created_at || state.lastSyncAt || '';
  state.lastMessageId = last?.id || state.lastMessageId || '';
  return state.messages;
}
function isPublicChatPage() {
  return universalChatPublicPaths.includes(path) || path.startsWith('/projects/');
}
function readChatSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(universalChatStorageKey) || '{}');
    if (!parsed.token) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}
function saveChatSession(session) {
  sessionStorage.setItem(universalChatStorageKey, JSON.stringify({
    token: session.token,
    conversationId: session.conversationId || '',
    expiresAt: session.expiresAt || ''
  }));
}
function clearChatSession() {
  sessionStorage.removeItem(universalChatStorageKey);
  universalChatState.token = '';
  universalChatState.tokenHash = '';
  universalChatState.conversationId = '';
  universalChatState.messages = [];
  universalChatState.conversationStatus = 'new';
  universalChatState.closedAt = '';
  universalChatState.ratingSubmitted = false;
}
function universalChatRoot() {
  return $('#w1zzy-chat');
}
function createUniversalChatWidget() {
  if (!isPublicChatPage() || universalChatRoot()) return;
  const root = document.createElement('section');
  root.className = 'support-widget';
  root.id = 'w1zzy-chat';
  root.setAttribute('aria-live', 'polite');
  root.innerHTML = `
    <button class="support-widget-button" type="button" aria-expanded="false" aria-controls="w1zzy-chat-panel">
      <span class="support-widget-icon" aria-hidden="true">✦</span>
      <span><strong data-ru="Напишите нам" data-en="Message us">Напишите нам</strong><small data-ru="Ответим в ближайшее время" data-en="We reply soon">Ответим в ближайшее время</small></span>
      <b class="support-widget-badge hidden" data-chat-badge>0</b>
    </button>
    <div class="support-widget-panel hidden" id="w1zzy-chat-panel" role="dialog" aria-label="W1ZZYDEV Support">
      <div class="support-widget-head">
        <div><strong>W1ZZYDEV Support</strong><small data-ru="Онлайн-диалог со студией" data-en="Online dialog with the studio">Онлайн-диалог со студией</small></div>
        <div class="support-widget-controls"><button type="button" data-chat-minimize aria-label="Свернуть">−</button><button type="button" data-chat-close aria-label="Закрыть">×</button></div>
      </div>
      <div class="support-widget-body" data-chat-body></div>
      <div class="support-widget-toast hidden" data-chat-toast role="status" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(root);
  const button = $('.support-widget-button', root);
  button?.addEventListener('click', () => openUniversalChat());
  $('[data-chat-close]', root)?.addEventListener('click', closeUniversalChat);
  $('[data-chat-minimize]', root)?.addEventListener('click', minimizeUniversalChat);
  setWidgetState('closed', { restoreFocus: false });
  renderUniversalChat();
  restoreUniversalChat().catch(() => {});
}
function clearChatToast() {
  window.clearTimeout(universalChatState.toastTimer);
  universalChatState.toastTimer = 0;
  const toast = $('[data-chat-toast]', universalChatRoot());
  if (!toast) return;
  toast.className = 'support-widget-toast hidden';
  toast.replaceChildren();
}
function showChatToast(message, type = 'success', duration = 2600, retryAction = null) {
  const toast = $('[data-chat-toast]', universalChatRoot());
  if (!toast) return;
  window.clearTimeout(universalChatState.toastTimer);
  toast.className = `support-widget-toast ${type}`;
  const text = document.createElement('span');
  text.textContent = message;
  toast.replaceChildren(text);
  if (retryAction) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = lang === 'ru' ? 'Повторить' : 'Retry';
    retry.addEventListener('click', retryAction, { once: true });
    toast.appendChild(retry);
  }
  universalChatState.toastTimer = window.setTimeout(clearChatToast, duration);
}
function setWidgetState(nextState = 'closed', options = {}) {
  const root = universalChatRoot();
  if (!root) return;
  const state = ['open', 'closed', 'minimized'].includes(nextState) ? nextState : 'closed';
  const launcher = $('.support-widget-button', root);
  const panel = $('.support-widget-panel', root);
  universalChatState.widgetState = state;
  universalChatState.open = state === 'open';
  root.dataset.widgetState = state;
  launcher?.classList.toggle('hidden', state === 'open');
  panel?.classList.toggle('hidden', state !== 'open');
  launcher?.setAttribute('aria-expanded', String(state === 'open'));
  if (state !== 'open') {
    clearChatToast();
    if (options.restoreFocus !== false) window.setTimeout(() => launcher?.focus(), 0);
  } else {
    universalChatState.unread = 0;
    updateChatBadge();
    window.setTimeout(() => $('[data-chat-message]', root)?.focus(), 80);
  }
}
function openUniversalChat(options = {}) {
  createUniversalChatWidget();
  setWidgetState('open');
  if (options.category) universalChatState.category = options.category;
  renderUniversalChat(options.notice);
}
function closeUniversalChat() {
  setWidgetState('closed');
}
function minimizeUniversalChat() {
  setWidgetState('minimized');
}
function updateChatBadge() {
  const badge = $('[data-chat-badge]');
  if (!badge) return;
  badge.textContent = String(universalChatState.unread);
  badge.classList.toggle('hidden', universalChatState.unread <= 0);
}
function chatExternalLinksHtml() {
  return `<div class="support-widget-external"><span data-ru="Удобнее в мессенджере?" data-en="Prefer a messenger?">Удобнее в мессенджере?</span>
    <div><a href="${externalChannelUrl('telegram')}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="${externalChannelUrl('whatsapp')}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${externalChannelUrl('instagram')}" target="_blank" rel="noopener noreferrer">Instagram</a><a href="${externalChannelUrl('email')}" target="_blank" rel="noopener noreferrer">Email</a></div></div>`;
}
function renderUniversalChat(notice = '') {
  const body = $('[data-chat-body]', universalChatRoot());
  if (!body) return;
  if (!universalChatState.tokenHash) {
    body.innerHTML = `
      <form class="support-widget-start" data-chat-start-form>
        ${notice ? `<div class="support-widget-note">${escapeHtml(notice)}</div>` : ''}
        <div class="support-widget-topics" role="radiogroup" aria-label="Тема обращения">
          ${Object.entries(chatCategoryLabels).map(([value, label]) => `<label><input type="radio" name="category" value="${value}" ${value === universalChatState.category ? 'checked' : ''}><span>${escapeHtml(label[lang])}</span></label>`).join('')}
        </div>
        <div class="field"><label data-ru="Как к вам обращаться?" data-en="What should we call you?">Как к вам обращаться?</label><input name="name" maxlength="80" required data-placeholder-ru="Ваше имя" data-placeholder-en="Your name"></div>
        <div class="field"><label data-ru="Контакт — необязательно" data-en="Contact — optional">Контакт — необязательно</label><input name="contact" maxlength="160" data-placeholder-ru="Telegram, email или телефон" data-placeholder-en="Telegram, email or phone"></div>
        <div class="field"><label data-ru="Чем можем помочь?" data-en="How can we help?">Чем можем помочь?</label><textarea name="message" maxlength="2000" required data-chat-message data-placeholder-ru="Напишите сообщение" data-placeholder-en="Write your message"></textarea></div>
        <button class="button primary" type="submit" data-ru="Начать диалог" data-en="Start dialog">Начать диалог</button>
        <p class="form-status" data-chat-status role="status" aria-live="polite"></p>
        ${chatExternalLinksHtml()}
      </form>`;
    setLang(lang);
    $('[data-chat-start-form]', body)?.addEventListener('submit', event => {
      event.preventDefault();
      startUniversalChatFromForm(event.currentTarget).catch(error => {
        setFormStatus($('[data-chat-status]', body), (lang === 'ru' ? 'Не удалось начать диалог: ' : 'Could not start the dialog: ') + String(error.message || error), 'error');
      });
    });
    return;
  }
  const isClosed = universalChatState.conversationStatus === 'closed';
  body.innerHTML = `
    ${notice ? `<div class="support-widget-note">${escapeHtml(notice)}</div>` : ''}
    <div class="support-widget-messages" data-chat-messages></div>
    ${isClosed ? renderUniversalChatRating() : renderAssistantQuickActions()}
    ${isClosed ? `<button class="button" type="button" data-chat-new-conversation data-ru="Создать новое обращение" data-en="Create new request">Создать новое обращение</button>` : `
      <form class="support-widget-reply" data-chat-reply-form>
        <textarea name="message" maxlength="2000" required data-chat-message data-placeholder-ru="Сообщение для W1ZZYDEV" data-placeholder-en="Message for W1ZZYDEV"></textarea>
        <button class="button primary" type="submit" data-ru="Отправить" data-en="Send">Отправить</button>
        <button class="button" type="button" data-chat-close-conversation data-ru="Завершить обращение" data-en="End request">Завершить обращение</button>
      </form>`}`;
  setLang(lang);
  const replyForm = $('[data-chat-reply-form]', body);
  if (isClosed && replyForm) {
    $$('textarea,button[type="submit"]', replyForm).forEach(node => { node.disabled = true; });
  }
  renderUniversalChatMessages();
  replyForm?.addEventListener('submit', event => {
    event.preventDefault();
    sendUniversalChatMessage(event.currentTarget).catch(error => {
      const textarea = $('[data-chat-message]', event.currentTarget);
      const failedText = textarea?.dataset.failedText || '';
      if (failedText && !textarea.value) textarea.value = failedText;
      showChatToast(
        lang === 'ru' ? 'Не удалось отправить сообщение. Попробуйте ещё раз.' : 'Could not send the message. Please try again.',
        'error',
        5000,
        () => event.currentTarget.requestSubmit()
      );
    });
  });
  $('[data-chat-close-conversation]', body)?.addEventListener('click', event => closeGuestConversation(event.currentTarget).catch(error => {
    console.error('[CHAT CLOSE ERROR]', {
      operation: 'guest_close_conversation',
      code: error?.code || '',
      message: error?.message || String(error),
      details: error?.details || '',
      hint: error?.hint || '',
      conversationId: universalChatState.conversationId || ''
    });
    showChatToast(actionErrorMessage(error), 'error', 5000);
  }));
  $('[data-chat-new-conversation]', body)?.addEventListener('click', () => {
    clearChatSession();
    universalChatState.category = 'question';
    renderUniversalChat();
  });
  $('[data-assistant-actions]', body)?.addEventListener('click', event => {
    const button = event.target.closest('[data-assistant-action]');
    if (!button) return;
    handleAssistantAction(button).catch(error => {
      console.error('[W1ZZYDEV CHAT]', {
        operation: `assistant.quick.${button.dataset.assistantAction || 'unknown'}`,
        code: error?.code || '',
        message: error?.message || String(error),
        details: error?.details || '',
        hint: error?.hint || '',
        conversationId: universalChatState.conversationId || ''
      });
      showChatToast(actionErrorMessage(error), 'error', 5000);
    });
  });
  $('[data-chat-rating-form]', body)?.addEventListener('submit', event => {
    event.preventDefault();
    submitConversationRating(event.currentTarget).catch(error => showChatToast(describeSupabaseError(error), 'error', 5000));
  });
}
function renderAssistantQuickActions() {
  return `<div class="support-widget-quick" data-assistant-actions aria-label="Быстрые ответы">
    ${[
      ['pricing', 'Стоимость разработки'],
      ['timeline', 'Сроки проекта'],
      ['process', 'Как проходит работа'],
      ['support', 'Поддержка сайта'],
      ['specialist', 'Связаться со специалистом']
    ].map(([value, label]) => `<button type="button" data-assistant-action="${value}">${escapeHtml(label)}</button>`).join('')}
  </div>`;
}
function renderUniversalChatRating() {
  if (universalChatState.ratingSubmitted) {
    return `<div class="support-widget-note">${escapeHtml(lang === 'ru' ? 'Спасибо за оценку. Можно оставить публичный отзыв на странице отзывов.' : 'Thank you for the rating. You can leave a public review on the reviews page.')} <a href="/reviews/?rating=5">${escapeHtml(lang === 'ru' ? 'Оставить публичный отзыв' : 'Leave a public review')}</a></div>`;
  }
  return `<form class="support-widget-rating" data-chat-rating-form>
    <strong data-ru="Оцените помощь W1ZZYDEV" data-en="Rate W1ZZYDEV support">Оцените помощь W1ZZYDEV</strong>
    <div class="support-widget-stars">${[1,2,3,4,5].map(value => `<label><input type="radio" name="rating" value="${value}" ${value === 5 ? 'checked' : ''}><span>★</span></label>`).join('')}</div>
    <textarea name="comment" maxlength="600" data-placeholder-ru="Комментарий — необязательно" data-placeholder-en="Comment — optional"></textarea>
    <button class="button primary" type="submit" data-ru="Отправить оценку" data-en="Send rating">Отправить оценку</button>
  </form>`;
}
function renderUniversalChatMessages() {
  const container = $('[data-chat-messages]');
  if (!container) return;
  container.innerHTML = universalChatState.messages.map(message => `
    <article class="${messageClass(message)}">
      <strong>${escapeHtml(chatLabel(chatSenderLabels, message.sender === 'client' ? 'client' : message.sender))}${message.pending ? ' · ...' : ''}${message.failed ? ' · ошибка' : ''}</strong>
      <p>${escapeHtml(message.body)}</p>
      <small>${new Date(message.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}</small>
    </article>`).join('') || adminEmpty(lang === 'ru' ? 'Диалог создан. Напишите первое сообщение.' : 'The dialog is ready. Send the first message.');
  container.scrollTop = container.scrollHeight;
}
async function startUniversalChat(payload) {
  const token = createGuestToken();
  const tokenHash = await hashGuestToken(token);
  const clientMessageId = createClientMessageId('guest');
  const result = await supabaseRequest('/rest/v1/rpc/chat_guest_start', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      p_guest_token_hash: tokenHash,
      p_name: cleanFormValue(payload.name, 80),
      p_contact: cleanFormValue(payload.contact, 160),
      p_category: payload.category || 'question',
      p_message: cleanMultilineValue(payload.message, 2000),
      p_page_url: location.href,
      p_lead_submission_key: payload.leadSubmissionKey || null,
      p_client_message_id: clientMessageId
    })
  });
  const data = Array.isArray(result) ? result[0] : result;
  universalChatState.token = token;
  universalChatState.tokenHash = tokenHash;
  universalChatState.conversationId = data?.conversation_id || '';
  saveChatSession({ token, tokenHash, conversationId: universalChatState.conversationId, expiresAt: data?.expires_at || '' });
  const messages = await loadUniversalChatMessages();
  const sourceMessage = messages.find(message => message.client_message_id === clientMessageId);
  requestAiAssistant({ messageId: sourceMessage?.id || '', clientMessageId }).catch(() => {});
  startUniversalChatPolling();
  return data;
}
async function startUniversalChatFromForm(formElement) {
  if (isRateLimited('w1zzydev-chat-start-last')) {
    setFormStatus($('[data-chat-status]', formElement), lang === 'ru' ? 'Подождите немного перед созданием нового обращения.' : 'Please wait before creating another request.', 'error');
    return;
  }
  const data = new FormData(formElement);
  const button = $('button[type="submit"]', formElement);
  button.disabled = true;
  try {
    universalChatState.category = cleanFormValue(data.get('category'), 40) || 'question';
    await startUniversalChat({
      name: data.get('name'),
      contact: data.get('contact'),
      category: universalChatState.category,
      message: data.get('message')
    });
    renderUniversalChat();
  } finally {
    button.disabled = false;
  }
}
async function loadUniversalChatMessages() {
  if (!universalChatState.tokenHash) return [];
  const result = await supabaseRequest('/rest/v1/rpc/chat_guest_messages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      p_guest_token_hash: universalChatState.tokenHash,
      p_after_created_at: universalChatState.lastSyncAt || null,
      p_after_id: universalChatState.lastMessageId || null
    })
  });
  const messages = Array.isArray(result) ? result : [];
  const knownIds = new Set(universalChatState.messages.map(item => item.id));
  const previousStatus = universalChatState.conversationStatus;
  messages.forEach(message => {
    universalChatState.conversationStatus = message.conversation_status || universalChatState.conversationStatus;
    universalChatState.closedAt = message.closed_at || universalChatState.closedAt;
    universalChatState.ratingSubmitted = Boolean(message.rating_submitted || universalChatState.ratingSubmitted);
    upsertMessage(message);
  });
  const newOwnerMessages = messages.filter(message => message.sender === 'owner' && !knownIds.has(message.id)).length;
  if (!universalChatState.open && newOwnerMessages) {
    universalChatState.unread += newOwnerMessages;
    updateChatBadge();
  }
  if (previousStatus !== universalChatState.conversationStatus) renderUniversalChat();
  else renderUniversalChatMessages();
  return messages;
}
async function sendUniversalChatMessage(formElement) {
  if (isSoftSpamLimited('w1zzydev-chat-message-burst')) {
    showChatToast(lang === 'ru' ? 'Слишком много сообщений подряд. Подождите несколько секунд.' : 'Too many messages in a row. Please wait a few seconds.', 'error', 4000);
    return;
  }
  const body = cleanMultilineValue(new FormData(formElement).get('message'), 2000);
  if (!body) return;
  const button = $('button[type="submit"]', formElement);
  const textarea = $('[data-chat-message]', formElement);
  const clientMessageId = createClientMessageId('guest');
  const optimistic = normalizeChatMessage({ client_message_id: clientMessageId, sender: 'client', body, pending: true });
  button.disabled = true;
  if (textarea) textarea.dataset.failedText = body;
  try {
    upsertMessage(optimistic);
    renderUniversalChatMessages();
    const result = await supabaseRequest('/rest/v1/rpc/chat_guest_send', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ p_guest_token_hash: universalChatState.tokenHash, p_body: body, p_client_message_id: clientMessageId })
    });
    const savedMessages = (Array.isArray(result) ? result : [result]).filter(Boolean);
    savedMessages.forEach(message => upsertMessage(message));
    if (!savedMessages.some(message => message.client_message_id === clientMessageId)) {
      upsertMessage({ ...optimistic, delivery_status: 'sent', pending: false, failed: false });
    }
    formElement.reset();
    if (textarea) textarea.dataset.failedText = '';
    renderUniversalChatMessages();
    const sourceMessage = savedMessages.find(message => message.client_message_id === clientMessageId);
    requestAiAssistant({ messageId: sourceMessage?.id || '', clientMessageId }).catch(error => {
      console.error('[W1ZZYDEV CHAT]', {
        operation: 'chat.background.notify',
        code: error?.code || '',
        message: error?.message || String(error),
        details: error?.details || '',
        hint: error?.hint || '',
        conversationId: universalChatState.conversationId || ''
      });
    });
    showChatToast(lang === 'ru' ? 'Сообщение отправлено' : 'Message sent', 'success', 2600);
  } catch (error) {
    upsertMessage({ ...optimistic, pending: false, failed: true });
    renderUniversalChatMessages();
    throw error;
  } finally {
    button.disabled = false;
  }
}
function assistantActionQuestion(action) {
  const labels = {
    pricing: { ru: 'Расскажите о стоимости разработки', en: 'Tell me about development pricing' },
    timeline: { ru: 'Расскажите о сроках проекта', en: 'Tell me about project timelines' },
    process: { ru: 'Как проходит работа?', en: 'How does the work process go?' },
    support: { ru: 'Какая поддержка сайта доступна?', en: 'What website support is available?' },
    specialist: { ru: 'Хочу связаться со специалистом', en: 'I want to speak with a specialist' }
  };
  return labels[action]?.[lang] || labels[action]?.ru || action;
}
async function handleAssistantAction(button) {
  if (!button || button.disabled) return;
  button.disabled = true;
  try {
    await sendAssistantQuickReply(button.dataset.assistantAction);
  } finally {
    button.disabled = false;
  }
}
async function sendAssistantQuickReply(action) {
  if (!universalChatState.tokenHash || universalChatState.conversationStatus === 'closed') return;
  const clientMessageId = createClientMessageId('assistant-action');
  const questionId = createClientMessageId('assistant-question');
  const question = assistantActionQuestion(action);
  const fallback = assistantResponseProvider.get(action);
  upsertMessage({ client_message_id: questionId, sender: 'client', body: question, pending: true });
  if (fallback) {
    upsertMessage({ client_message_id: clientMessageId, sender: 'assistant', body: fallback, pending: true });
    renderUniversalChatMessages();
  }
  const result = await supabaseRequest('/rest/v1/rpc/chat_guest_assistant_action', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      p_guest_token_hash: universalChatState.tokenHash,
      p_action: action,
      p_question: question,
      p_question_client_message_id: questionId,
      p_response_client_message_id: clientMessageId
    })
  });
  (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(message => upsertMessage(message));
  renderUniversalChatMessages();
}

async function requestAiAssistant({ messageId = '', clientMessageId = '' } = {}) {
  if ((!messageId && !clientMessageId) || !universalChatState.conversationId || !universalChatState.token) return null;
  const config = await getSupabaseConfig();
  const response = await fetch(`${config.url}/functions/v1/chat-assistant`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_id: universalChatState.conversationId,
      guest_token: universalChatState.token,
      message_id: messageId,
      client_message_id: clientMessageId,
      locale: lang
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[W1ZZYDEV CHAT]', {
      operation: 'assistant.edge',
      code: data?.code || response.status,
      message: data?.message || data?.error || response.statusText,
      details: data?.details || '',
      hint: data?.hint || '',
      conversationId: universalChatState.conversationId
    });
    return null;
  }
  const aiMessage = data?.message || data?.ai?.message;
  if (aiMessage) {
    upsertMessage(aiMessage);
    renderUniversalChatMessages();
  }
  if (data?.conversation || data?.ai?.conversation) {
    const conversation = data.conversation || data.ai.conversation;
    universalChatState.conversationStatus = conversation.status || universalChatState.conversationStatus;
  }
  return data;
}
async function closeGuestConversation(button) {
  if (!universalChatState.tokenHash) return;
  if (universalChatState.conversationStatus === 'closed') {
    renderUniversalChat();
    return;
  }
  if (button) button.disabled = true;
  try {
    const result = await supabaseRequest('/rest/v1/rpc/chat_guest_close', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ p_guest_token_hash: universalChatState.tokenHash, p_client_message_id: createClientMessageId('close') })
    });
    universalChatState.conversationStatus = 'closed';
    universalChatState.closedAt = new Date().toISOString();
    (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(message => {
      universalChatState.conversationStatus = message.conversation_status || universalChatState.conversationStatus;
      universalChatState.closedAt = message.closed_at || universalChatState.closedAt;
      upsertMessage(message);
    });
    renderUniversalChat();
  } catch (error) {
    if (button) button.disabled = false;
    throw error;
  }
}
async function submitConversationRating(formElement) {
  const data = new FormData(formElement);
  await supabaseRequest('/rest/v1/rpc/chat_guest_rate', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      p_guest_token_hash: universalChatState.tokenHash,
      p_rating: Math.min(5, Math.max(1, Number(data.get('rating')) || 5)),
      p_comment: cleanMultilineValue(data.get('comment'), 600)
    })
  });
  universalChatState.ratingSubmitted = true;
  renderUniversalChat();
}
async function restoreUniversalChat() {
  const session = readChatSession();
  if (!session) return;
  universalChatState.token = session.token;
  universalChatState.tokenHash = session.tokenHash || await hashGuestToken(session.token);
  universalChatState.conversationId = session.conversationId || '';
  try {
    await loadUniversalChatMessages();
    renderUniversalChat();
    startUniversalChatPolling();
  } catch (error) {
    clearChatSession();
    renderUniversalChat();
  }
}
function startUniversalChatPolling() {
  window.clearInterval(universalChatState.pollTimer);
  universalChatState.pollTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible' && universalChatState.tokenHash) loadUniversalChatMessages().catch(() => {});
  }, 2000);
}
async function attachLeadToUniversalChat(details) {
  openUniversalChat({ category: 'project', notice: lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.' });
  if (universalChatState.tokenHash) {
    await supabaseRequest('/rest/v1/rpc/chat_guest_attach_lead', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        p_guest_token_hash: universalChatState.tokenHash,
        p_lead_submission_key: details.submissionKey,
        p_message: lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.',
        p_client_message_id: createClientMessageId('lead-link')
      })
    }).catch(() => null);
    await loadUniversalChatMessages().catch(() => {});
    renderUniversalChat(lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.');
    return;
  }
  await startUniversalChat({
    name: details.name,
    contact: details.contact,
    category: 'project',
    message: `${lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.'}\n\n${details.task || ''}`,
    leadSubmissionKey: details.submissionKey
  });
  renderUniversalChat(lang === 'ru' ? 'Заявка принята. Продолжим обсуждение здесь.' : 'Request accepted. We can continue here.');
}
createUniversalChatWidget();
document.addEventListener('click', event => {
  const supportLink = event.target.closest('a[href="/support/"], [data-open-chat]');
  if (!supportLink || path === '/support/') return;
  event.preventDefault();
  openUniversalChat({ category: supportLink.getAttribute('href') === '/support/' ? 'support' : 'question' });
});

async function signInModerator(email, password) {
  if (!useLocalReviewDatabase && window.supabase?.createClient) {
    const client = await getSupabaseBrowserClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data?.session?.access_token) throw new Error(error?.message || 'Authorization failed');
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token || ''
    };
  }
  const config = await getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error(result.error_description || result.msg || 'Authorization failed');
  return { accessToken: result.access_token, refreshToken: result.refresh_token || '' };
}

let supabaseBrowserClientPromise;
async function getSupabaseBrowserClient() {
  if (!window.supabase?.createClient) throw new Error('Supabase Auth client is unavailable');
  if (!supabaseBrowserClientPromise) {
    supabaseBrowserClientPromise = getSupabaseConfig().then(config => window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'implicit',
        persistSession: true,
        autoRefreshToken: true
      }
    }));
  }
  return supabaseBrowserClientPromise;
}

async function requestPasswordResetEmail(email) {
  const client = await getSupabaseBrowserClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://w1zzydev.com/reviews/reset-password/'
  });
  if (error) throw error;
}

async function sendClientMagicLink(email, redirectPath = '/client/') {
  const client = await getSupabaseBrowserClient();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: authRedirectUrl(redirectPath),
      shouldCreateUser: true
    }
  });
  if (error) throw error;
}

async function getClientSession() {
  const client = await getSupabaseBrowserClient();
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const code = query.get('code');
  if (accessToken && refreshToken) {
    const { data, error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    history.replaceState(null, document.title, location.pathname);
    return data.session;
  }
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    history.replaceState(null, document.title, location.pathname);
    return data.session;
  }
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

async function claimClientProfile(accessToken) {
  return supabaseRequest('/rest/v1/rpc/claim_client_profile', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({})
  }, accessToken);
}

async function preparePasswordRecoverySession() {
  const client = await getSupabaseBrowserClient();
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const code = query.get('code');

  if (accessToken && refreshToken) {
    const { data, error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    history.replaceState(null, document.title, location.pathname);
    return data.session;
  }

  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    history.replaceState(null, document.title, location.pathname);
    return data.session;
  }

  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

const passwordResetForm = $('#password-reset-form');
async function initPasswordResetPage() {
  if (!passwordResetForm) return;
  const status = $('#password-reset-status');
  const fields = $$('input,button[type="submit"]', passwordResetForm);
  try {
    const session = await preparePasswordRecoverySession();
    if (!session?.access_token) throw new Error('Recovery session is unavailable');
    setFormStatus(status, lang === 'ru' ? 'Ссылка подтверждена. Введите новый пароль.' : 'The link is confirmed. Enter a new password.');
    fields.forEach(field => { field.disabled = false; });
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Ссылка восстановления недействительна или уже истекла. Запросите новую ссылку на странице входа.' : 'The recovery link is invalid or expired. Request a new link from the sign-in page.', 'error');
  }
}
initPasswordResetPage();

passwordResetForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(passwordResetForm);
  const password = String(data.get('password') || '');
  const confirmation = String(data.get('confirmation') || '');
  const status = $('#password-reset-status');
  const button = $('button[type="submit"]', passwordResetForm);
  if (password.length < 8 || password !== confirmation) {
    setFormStatus(status, lang === 'ru' ? 'Пароли должны совпадать и содержать минимум 8 символов.' : 'Passwords must match and contain at least 8 characters.', 'error');
    return;
  }
  button.disabled = true;
  try {
    const client = await getSupabaseBrowserClient();
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    await client.auth.signOut().catch(() => {});
    passwordResetForm.reset();
    setFormStatus(status, lang === 'ru' ? 'Пароль изменён. Теперь можно войти в панель W1ZZYDEV.' : 'Password changed. You can now sign in to the W1ZZYDEV panel.');
    $$('input,button[type="submit"]', passwordResetForm).forEach(field => { field.disabled = true; });
    const link = $('#password-reset-login');
    link?.classList.remove('hidden');
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Не удалось изменить пароль. Запросите новую ссылку.' : 'Could not change the password. Request a new recovery link.', 'error');
  } finally {
    if (!$('#password-reset-login')?.classList.contains('hidden')) return;
    button.disabled = false;
  }
});
function openReviewsDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(reviewsDatabaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('reviews')) {
        const store = database.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getReviews() {
  if (!useLocalReviewDatabase) {
    const rows = await supabaseRequest('/rest/v1/reviews?select=id,name,company,rating,text,status,created_at,moderated_at&status=eq.published&order=created_at.desc');
    return uniqueReviews(rows.map(normalizeSupabaseReview));
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readonly');
    const request = transaction.objectStore('reviews').getAll();
    request.onsuccess = () => resolve(uniqueReviews(request.result.filter(review => review.status === 'published' || (review.status == null && review.published === true)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function getAllReviews() {
  if (!useLocalReviewDatabase) {
    const token = sessionStorage.getItem('w1zzydev-moderator-token');
    if (!token) throw new Error('Moderator is not authorized');
    const rows = await supabaseRequest('/rest/v1/reviews?select=id,name,company,rating,text,status,created_at,moderated_at&order=created_at.desc', {}, token);
    return rows.map(normalizeSupabaseReview);
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readonly');
    const request = transaction.objectStore('reviews').getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function updateReviewStatus(id, status) {
  if (!useLocalReviewDatabase) {
    const token = sessionStorage.getItem('w1zzydev-moderator-token');
    if (!token) throw new Error('Moderator is not authorized');
    await supabaseRequest(`/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status, moderated_at: new Date().toISOString() })
    }, token);
    return;
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readwrite');
    const store = transaction.objectStore('reviews');
    const request = store.get(Number(id));
    request.onsuccess = () => {
      const review = request.result;
      if (!review) return reject(new Error('Review not found'));
      review.status = status;
      review.published = status === 'published';
      review.moderatedAt = new Date().toISOString();
      store.put(review);
    };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function deleteReview(id) {
  if (!useLocalReviewDatabase) {
    const token = sessionStorage.getItem('w1zzydev-moderator-token');
    if (!token) throw new Error('Moderator is not authorized');
    await supabaseRequest(`/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }, token);
    return;
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readwrite');
    transaction.objectStore('reviews').delete(Number(id));
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function saveReview(review) {
  if (!useLocalReviewDatabase) {
    await supabaseRequest('/rest/v1/reviews', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ name: review.name, company: review.company || null, rating: review.rating, text: review.text, status: 'pending' })
    });
    return;
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readwrite');
    const request = transaction.objectStore('reviews').add(review);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card reveal visible';
  const top = document.createElement('div');
  top.className = 'review-top';
  const avatar = document.createElement('span');
  avatar.className = 'review-avatar';
  avatar.textContent = review.name.trim().charAt(0).toUpperCase();
  const identity = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = review.name;
  identity.appendChild(name);
  if (review.company) {
    const company = document.createElement('small');
    if (review.companyEn) {
      company.dataset.ru = review.company;
      company.dataset.en = review.companyEn;
    }
    company.textContent = lang === 'en' && review.companyEn ? review.companyEn : review.company;
    identity.appendChild(company);
  }
  const stars = document.createElement('span');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', `${review.rating} / 5`);
  stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  top.append(avatar, identity, stars);
  const text = document.createElement('p');
  if (review.textEn) {
    text.dataset.ru = review.text;
    text.dataset.en = review.textEn;
  }
  text.textContent = lang === 'en' && review.textEn ? review.textEn : review.text;
  const date = document.createElement('time');
  date.dateTime = review.createdAt;
  date.textContent = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.createdAt));
  card.append(top, text, date);
  return card;
}

function createReviewsNotice(messageRu, messageEn) {
  const notice = document.createElement('div');
  notice.className = 'reviews-empty reviews-notice';
  notice.dataset.ru = messageRu;
  notice.dataset.en = messageEn;
  notice.textContent = lang === 'en' ? messageEn : messageRu;
  return notice;
}

async function renderReviews(container, limit = Infinity, fallbackReviews = publicReviewFallbacks) {
  if (!container) return;
  try {
    const publishedReviews = await getReviews();
    const reviews = publishedReviews.slice(0, limit);
    container.dataset.count = String(reviews.length);
    container.dataset.source = publishedReviews.length ? 'database' : 'empty';
    container.replaceChildren();
    if (!reviews.length) {
      container.appendChild(createReviewsNotice('Пока нет опубликованных отзывов.', 'There are no published reviews yet.'));
      return;
    }
    reviews.forEach(review => container.appendChild(createReviewCard(review)));
  } catch (error) {
    const fallback = uniqueReviews(fallbackReviews).slice(0, limit);
    if (fallback.length) {
      const reviews = fallback;
      container.dataset.count = String(reviews.length);
      container.dataset.source = 'fallback';
      container.replaceChildren(...reviews.map(createReviewCard));
      container.appendChild(createReviewsNotice('Показан сохранённый опубликованный отзыв. Новые отзывы временно загружаются с задержкой.', 'A saved published review is shown. New reviews may load with a temporary delay.'));
      return;
    }
    container.dataset.count = '0';
    container.dataset.source = 'error';
    container.replaceChildren(createReviewsNotice('Пока нет опубликованных отзывов.', 'There are no published reviews yet.'));
  }
}

const reviewsList = $('#reviews-list');
const homeReviews = $('#home-reviews');
renderReviews(reviewsList);
renderReviews(homeReviews, 2);

const clientLoginForm = $('#client-login-form');
const clientWorkspace = $('#client-workspace');
const clientState = { token: '', selectedConversationId: null, conversations: [], leads: [], tickets: [], messages: [] };

async function clientRequest(pathname, options = {}) {
  if (!clientState.token) throw new Error('Client is not authorized');
  return supabaseRequest(pathname, options, clientState.token);
}

function clientStatus(message, type = 'success') {
  setFormStatus($('#client-login-status') || $('#client-message-status'), message, type);
}

async function loadClientPortal() {
  const session = await getClientSession();
  if (!session?.access_token) return;
  clientState.token = session.access_token;
  await claimClientProfile(clientState.token).catch(() => null);
  clientLoginForm?.classList.add('hidden');
  clientWorkspace?.classList.remove('hidden');
  await renderClientPortal();
}

async function renderClientPortal() {
  const leadsContainer = $('#client-leads');
  const messagesContainer = $('#client-messages');
  if (leadsContainer) leadsContainer.innerHTML = adminEmpty(lang === 'ru' ? 'Загрузка заявок...' : 'Loading requests...');
  if (messagesContainer) messagesContainer.innerHTML = adminEmpty(lang === 'ru' ? 'Выберите диалог.' : 'Choose a dialog.');
  const [leads, tickets, conversations] = await Promise.all([
    clientRequest('/rest/v1/leads?select=id,project_type,description,status,conversation_id,contact_method,last_contact_channel,created_at,updated_at&order=created_at.desc'),
    clientRequest('/rest/v1/support_tickets?select=id,subject,project,priority,description,status,conversation_id,last_contact_channel,created_at,updated_at&order=created_at.desc'),
    clientRequest('/rest/v1/conversations?select=id,lead_id,support_ticket_id,subject,unread_for_client,created_at,updated_at&order=updated_at.desc')
  ]);
  clientState.leads = leads || [];
  clientState.tickets = tickets || [];
  clientState.conversations = conversations || [];
  if (leadsContainer) {
    const leadCards = clientState.leads.map(lead => {
      const dialog = clientState.conversations.find(item => item.id === lead.conversation_id);
      return `<article class="admin-card ${clientState.selectedConversationId === lead.conversation_id ? 'active' : ''}">
        <div class="admin-card-head"><div><strong>${escapeHtml(lead.project_type)}</strong><small>${new Date(lead.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}</small></div><span class="moderation-badge">${leadStatusLabels[lead.status] || escapeHtml(lead.status)}</span></div>
        <p>${escapeHtml(lead.description)}</p>
        <dl><dt>${lang === 'ru' ? 'Канал' : 'Channel'}</dt><dd>${channelLabel(lead.contact_method || lead.last_contact_channel)}</dd><dt>${lang === 'ru' ? 'Последний ответ' : 'Last reply'}</dt><dd>${dialog?.updated_at ? new Date(dialog.updated_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') : '—'}</dd></dl>
        ${lead.conversation_id ? `<div class="admin-actions"><button class="button small" type="button" data-client-dialog="${lead.conversation_id}">${lang === 'ru' ? 'Открыть диалог' : 'Open dialog'}</button></div>` : ''}
      </article>`;
    });
    const ticketCards = clientState.tickets.map(ticket => {
      const dialog = clientState.conversations.find(item => item.id === ticket.conversation_id);
      return `<article class="admin-card ${clientState.selectedConversationId === ticket.conversation_id ? 'active' : ''}">
        <div class="admin-card-head"><div><strong>${escapeHtml(ticket.subject)}</strong><small>${escapeHtml(ticket.project || (lang === 'ru' ? 'Техподдержка' : 'Support'))}</small></div><span class="moderation-badge">${ticketStatusLabels[ticket.status] || escapeHtml(ticket.status)}</span></div>
        <p>${escapeHtml(ticket.description)}</p>
        <dl><dt>${lang === 'ru' ? 'Приоритет' : 'Priority'}</dt><dd>${escapeHtml(ticket.priority)}</dd><dt>${lang === 'ru' ? 'Последний ответ' : 'Last reply'}</dt><dd>${dialog?.updated_at ? new Date(dialog.updated_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') : '—'}</dd></dl>
        ${ticket.conversation_id ? `<div class="admin-actions"><button class="button small" type="button" data-client-dialog="${ticket.conversation_id}">${lang === 'ru' ? 'Открыть переписку' : 'Open thread'}</button></div>` : ''}
      </article>`;
    });
    leadsContainer.innerHTML = [...leadCards, ...ticketCards].join('') || adminEmpty(lang === 'ru' ? 'Заявок и обращений пока нет. Если вы оставили заявку другим способом, войдите с тем же email.' : 'No requests or tickets yet. If you submitted through another channel, sign in with the same email.');
  }
}

async function loadClientMessages(conversationId) {
  clientState.selectedConversationId = conversationId;
  const title = $('#client-dialog-title');
  const messagesContainer = $('#client-messages');
  if (title) title.textContent = `${lang === 'ru' ? 'Диалог' : 'Dialog'} ${conversationId.slice(0, 8)}`;
  if (messagesContainer) messagesContainer.innerHTML = adminEmpty(lang === 'ru' ? 'Загрузка сообщений...' : 'Loading messages...');
  const messages = await clientRequest(`/rest/v1/messages?select=id,sender,body,created_at&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc`);
  clientState.messages = messages || [];
  if (messagesContainer) {
    messagesContainer.innerHTML = clientState.messages.map(message => `
      <article class="message-bubble ${message.sender === 'owner' ? 'owner' : 'client'}">
        <strong>${message.sender === 'owner' ? 'W1ZZYDEV' : (lang === 'ru' ? 'Вы' : 'You')}</strong>
        <p>${escapeHtml(message.body)}</p>
        <small>${new Date(message.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}</small>
      </article>
    `).join('') || adminEmpty(lang === 'ru' ? 'Сообщений пока нет.' : 'There are no messages yet.');
  }
}

clientLoginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = cleanFormValue(new FormData(clientLoginForm).get('email'), 160);
  const button = $('button[type="submit"]', clientLoginForm);
  if (!isEmail(email)) {
    setFormStatus($('#client-login-status'), lang === 'ru' ? 'Введите корректный email.' : 'Enter a valid email.', 'error');
    return;
  }
  button.disabled = true;
  try {
    await sendClientMagicLink(email, '/client/');
    setFormStatus($('#client-login-status'), lang === 'ru' ? 'Magic link отправлен. Откройте письмо и вернитесь по ссылке.' : 'Magic link sent. Open the email and return through the link.');
  } catch (error) {
    setFormStatus($('#client-login-status'), lang === 'ru' ? 'Не удалось отправить magic link. Проверьте Supabase Auth settings.' : 'Could not send the magic link. Check Supabase Auth settings.', 'error');
  } finally {
    button.disabled = false;
  }
});

$('#client-leads')?.addEventListener('click', event => {
  const button = event.target.closest('[data-client-dialog]');
  if (button) loadClientMessages(button.dataset.clientDialog).catch(() => setFormStatus($('#client-message-status'), lang === 'ru' ? 'Не удалось открыть диалог.' : 'Could not open the dialog.', 'error'));
});

$('#client-message-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!clientState.selectedConversationId) {
    setFormStatus($('#client-message-status'), lang === 'ru' ? 'Сначала выберите диалог.' : 'Choose a dialog first.', 'error');
    return;
  }
  const body = cleanMultilineValue(new FormData(event.currentTarget).get('message'), 2000);
  const button = $('button[type="submit"]', event.currentTarget);
  if (!body) return;
  button.disabled = true;
  try {
    await clientRequest('/rest/v1/messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ conversation_id: clientState.selectedConversationId, body })
    });
    event.currentTarget.reset();
    await loadClientMessages(clientState.selectedConversationId);
    setFormStatus($('#client-message-status'), lang === 'ru' ? 'Сообщение отправлено.' : 'Message sent.');
  } catch (error) {
    setFormStatus($('#client-message-status'), lang === 'ru' ? 'Не удалось отправить сообщение. Доступ проверяется RLS.' : 'Could not send the message. Access is checked by RLS.', 'error');
  } finally {
    button.disabled = false;
  }
});

$('#client-logout')?.addEventListener('click', async () => {
  const client = await getSupabaseBrowserClient();
  await client.auth.signOut().catch(() => {});
  location.reload();
});

if (clientLoginForm) loadClientPortal().catch(() => setFormStatus($('#client-login-status'), lang === 'ru' ? 'Сессия не найдена. Войдите по magic link.' : 'No session found. Sign in with a magic link.', 'error'));

const supportTicketForm = $('#support-ticket-form');
let lastSupportEmail = '';
supportTicketForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!supportTicketForm.reportValidity()) return;
  const data = new FormData(supportTicketForm);
  const status = $('#support-status');
  const button = $('button[type="submit"]', supportTicketForm);
  if (hasSpamSignal(supportTicketForm)) {
    setFormStatus(status, lang === 'ru' ? 'Тикет принят.' : 'Ticket accepted.');
    supportTicketForm.reset();
    return;
  }
  const payload = {
    p_name: cleanFormValue(data.get('name'), 80),
    p_email: cleanFormValue(data.get('email'), 160),
    p_project: cleanFormValue(data.get('project'), 120),
    p_subject: cleanFormValue(data.get('subject'), 160),
    p_priority: cleanFormValue(data.get('priority'), 20),
    p_description: cleanMultilineValue(data.get('description'), 2000)
  };
  button.disabled = true;
  try {
    await startUniversalChat({
      name: payload.p_name,
      contact: payload.p_email,
      category: 'support',
      message: `${payload.p_subject}\n\n${payload.p_description}${payload.p_project ? `\n\nПроект: ${payload.p_project}` : ''}`
    });
    lastSupportEmail = payload.p_email;
    updateChannelActionLinks($('#support-next-actions'), supportText, 'W1ZZYDEV — support');
    $('#support-next-actions')?.classList.remove('hidden');
    supportTicketForm.reset();
    openUniversalChat({ category: 'support', notice: lang === 'ru' ? 'Обращение создано. Продолжим здесь.' : 'The request is created. We can continue here.' });
    setFormStatus(status, lang === 'ru' ? 'Обращение создано в общем чате W1ZZYDEV.' : 'The request was created in the shared W1ZZYDEV chat.');
  } catch (error) {
    setFormStatus(status, (lang === 'ru' ? 'Не удалось создать обращение: ' : 'Could not create request: ') + String(error.message || error), 'error');
  } finally {
    button.disabled = false;
  }
});

$('#support-send-magic')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = $('#support-status');
  if (!isEmail(lastSupportEmail)) {
    openUniversalChat({ category: 'support' });
    setFormStatus(status, lang === 'ru' ? 'Чат открыт. Можно продолжить без email.' : 'The chat is open. You can continue without email.');
    return;
  }
  button.disabled = true;
  try {
    openUniversalChat({ category: 'support' });
    setFormStatus(status, lang === 'ru' ? 'Чат открыт на этой странице.' : 'The chat is open on this page.');
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Не удалось открыть чат.' : 'Could not open chat.', 'error');
  } finally {
    button.disabled = false;
  }
});

const reviewForm = $('#review-form');
reviewForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!reviewForm.reportValidity()) return;
  const data = new FormData(reviewForm);
  const status = $('#review-status');
  const button = $('button[type="submit"]', reviewForm);
  if (hasSpamSignal(reviewForm)) {
    setFormStatus(status, lang === 'ru' ? 'Спасибо! Отзыв отправлен на модерацию.' : 'Thank you! Your review was sent for moderation.');
    reviewForm.reset();
    return;
  }
  if (isRateLimited('w1zzydev-review-form-last')) {
    setFormStatus(status, lang === 'ru' ? 'Отзыв уже отправлен. Подождите немного перед повторной отправкой.' : 'The review has already been sent. Please wait before submitting again.', 'error');
    return;
  }
  button.disabled = true;
  try {
    await saveReview({
      name: cleanFormValue(data.get('name'), 60),
      company: cleanFormValue(data.get('company'), 80),
      rating: Math.min(5, Math.max(1, Number(data.get('rating')) || 5)),
      text: cleanMultilineValue(data.get('text'), 1200),
      createdAt: new Date().toISOString(),
      status: 'pending',
      published: false
    });
    reviewForm.reset();
    await renderReviews(reviewsList);
    setFormStatus(status, lang === 'ru' ? 'Спасибо! Отзыв отправлен на модерацию. После одобрения он появится на странице.' : 'Thank you! Your review was sent for moderation and will appear after approval.');
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Не удалось отправить отзыв. Попробуйте ещё раз чуть позже.' : 'Could not submit the review. Please try again later.', 'error');
  } finally {
    button.disabled = false;
  }
});

const moderationLogin = $('#moderation-login');
const moderationPanel = $('#moderation-panel');
const moderationList = $('#moderation-list');
const moderationMessage = $('#moderation-message');
const moderationLogout = $('#moderation-logout');
const forgotPasswordToggle = $('#forgot-password-toggle');
const forgotPasswordForm = $('#forgot-password-form');
const forgotPasswordCancel = $('#forgot-password-cancel');
const moderatorTokenKey = 'w1zzydev-moderator-token';
const moderatorRefreshTokenKey = 'w1zzydev-moderator-refresh-token';
const adminState = { selectedConversationId: null, loading: false, error: '' };
const adminChatState = {
  conversations: new Map(),
  messagesByConversation: new Map(),
  activeConversationId: null,
  realtimeChannel: null,
  globalRealtimeChannel: null,
  notificationPollingTimer: null,
  pollingTimer: null,
  pollingErrors: 0,
  sending: false,
  sendingMessageIds: new Set(),
  knownClientMessageIds: new Set(),
  notificationSoundReady: false,
  notificationAudioContext: null,
  lastSyncAt: '',
  lastMessageId: '',
  syncMode: 'connecting',
  requestGeneration: 0
};

const leadStatusLabels = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting_client: 'Ожидает клиента',
  completed: 'Завершена',
  archived: 'Архив',
  spam: 'Спам'
};
const ticketStatusLabels = {
  open: 'Открыт',
  in_progress: 'В работе',
  waiting_client: 'Ожидает клиента',
  resolved: 'Решён',
  closed: 'Закрыт'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function adminText(ru, en) {
  return lang === 'ru' ? ru : en;
}

function setAdminMessage(message = '', type = 'success') {
  if (!moderationMessage) return;
  moderationMessage.textContent = message;
  moderationMessage.classList.remove('success', 'error');
  if (message) moderationMessage.classList.add('visible', type);
}

function adminEmpty(message) {
  return `<div class="reviews-empty">${escapeHtml(message)}</div>`;
}

function setAdminLoading(isLoading) {
  adminState.loading = isLoading;
  const loadingText = adminText('Загрузка данных Supabase...', 'Loading Supabase data...');
  ['admin-leads', 'admin-dialogs', 'admin-tickets', 'admin-clients', 'admin-security', 'moderation-list'].forEach(id => {
    const node = document.getElementById(id);
    if (node && isLoading) node.innerHTML = adminEmpty(loadingText);
  });
}

function describeSupabaseError(error) {
  const text = String(error?.message || error || '');
  if (/permission denied|row-level security|JWT|not authorized|401|403/i.test(text) || ['42501','PGRST301'].includes(error?.code)) {
    return adminText('Ошибка доступа: проверьте OWNER в admin_profiles и RLS-политики.', 'Access error: check OWNER in admin_profiles and RLS policies.');
  }
  if (['42703','42883','42P01','PGRST202','PGRST204'].includes(error?.code)) {
    return adminText('Ошибка схемы Supabase: выполните актуальный SQL-файл синхронизации чата.', 'Supabase schema error: run the current chat sync SQL file.');
  }
  return adminText('Ошибка Supabase: проверьте схему, политики и подключение проекта.', 'Supabase error: check the schema, policies, and project connection.');
}

function isLocalDevelopment() {
  return ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
}

function actionErrorMessage(error) {
  if (isLocalDevelopment() && (error?.message || error?.code)) {
    return [error?.code, error?.message].filter(Boolean).join(': ');
  }
  return adminText('Не удалось выполнить действие. Попробуйте ещё раз.', 'Could not complete the action. Please try again.');
}

function logAdminChatActionError(operation, error, conversationId = adminChatState.activeConversationId) {
  console.error('[ADMIN CHAT ACTION ERROR]', {
    operation,
    code: error?.code || '',
    message: error?.message || String(error),
    details: error?.details || '',
    hint: error?.hint || '',
    conversationId: conversationId || ''
  });
}

function logAdminSupabaseError(operation, error, context = {}) {
  console.error('[W1ZZYDEV CHAT]', {
    operation,
    code: error?.code || '',
    message: error?.message || String(error),
    details: error?.details || '',
    hint: error?.hint || '',
    status: error?.status || '',
    pathname: error?.pathname || '',
    conversationId: context.conversation_id || context.conversationId || adminChatState.activeConversationId || '',
    context
  });
}

function adminToken() {
  const token = sessionStorage.getItem(moderatorTokenKey);
  if (!token) throw new Error('Moderator is not authorized');
  return token;
}

async function supabaseAdmin(pathname, options = {}) {
  return supabaseRequest(pathname, options, adminToken());
}

async function adminSupabase(operation, pathname, options = {}, context = {}) {
  try {
    return await supabaseAdmin(pathname, options);
  } catch (error) {
    logAdminSupabaseError(operation, error, context);
    throw error;
  }
}

async function ensureAdminAuthSession() {
  const storedAccessToken = sessionStorage.getItem(moderatorTokenKey);
  const storedRefreshToken = sessionStorage.getItem(moderatorRefreshTokenKey);
  if (!window.supabase?.createClient) {
    return { client: null, session: storedAccessToken ? { access_token: storedAccessToken } : null };
  }
  const client = await getSupabaseBrowserClient();
  let { data: { session }, error } = await client.auth.getSession();
  if (error) logAdminSupabaseError('admin.auth.getSession', error);
  if (!session?.access_token && storedAccessToken && storedRefreshToken) {
    const result = await client.auth.setSession({ access_token: storedAccessToken, refresh_token: storedRefreshToken });
    if (result.error) logAdminSupabaseError('admin.auth.setSession', result.error);
    session = result.data?.session || null;
  }
  if (!session?.access_token && storedAccessToken) session = { access_token: storedAccessToken };
  return { client, session };
}

function setAdminSyncMode(mode, detail = '') {
  adminChatState.syncMode = mode;
  const node = $('#admin-sync-status');
  if (!node) return;
  const labels = {
    realtime: adminText('Синхронизация: Realtime', 'Sync: Realtime'),
    polling: adminText('Синхронизация: Polling', 'Sync: Polling'),
    error: adminText('Синхронизация: Ошибка', 'Sync: Error'),
    idle: adminText('Синхронизация: ожидание', 'Sync: idle')
  };
  node.textContent = detail || labels[mode] || labels.idle;
  node.dataset.syncMode = mode;
}

function adminConversationList() {
  if (adminChatState.conversations instanceof Map) return [...adminChatState.conversations.values()];
  return adminChatState.conversations || [];
}

function setAdminConversations(conversations) {
  adminChatState.conversations = new Map((conversations || []).filter(item => item?.id).map(item => [item.id, item]));
  adminState.conversations = adminConversationList();
  renderAdminUnreadBadge();
  return adminState.conversations;
}

function adminUnreadTotal() {
  return adminConversationList().reduce((sum, item) => sum + Number(item.unread_for_owner || 0), 0);
}

function renderAdminUnreadBadge() {
  const total = adminUnreadTotal();
  $$('[data-admin-unread-badge]').forEach(node => {
    node.textContent = total > 99 ? '99+' : String(total);
    node.classList.toggle('hidden', total <= 0);
    node.setAttribute('aria-label', `${total} unread client messages`);
  });
}

function ensureAdminNotificationSound() {
  if (adminChatState.notificationAudioContext) return adminChatState.notificationAudioContext;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  adminChatState.notificationAudioContext = new AudioContext();
  return adminChatState.notificationAudioContext;
}

function playAdminNotificationSound() {
  try {
    const context = ensureAdminNotificationSound();
    if (!context) return;
    if (context.state === 'suspended') context.resume().catch(() => {});
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(740, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  } catch (error) {
    console.error('[W1ZZYDEV CHAT]', {
      operation: 'admin.notification.sound',
      message: error?.message || String(error)
    });
  }
}

function observeAdminClientMessages(messages, { silent = false } = {}) {
  let newClientMessages = 0;
  (messages || []).forEach(message => {
    if (message?.sender !== 'client') return;
    const key = message.id || message.client_message_id;
    if (!key || adminChatState.knownClientMessageIds.has(key)) return;
    adminChatState.knownClientMessageIds.add(key);
    newClientMessages += 1;
  });
  if (newClientMessages && !silent) playAdminNotificationSound();
  return newClientMessages;
}

function activeAdminMessages() {
  return adminChatState.messagesByConversation.get(adminChatState.activeConversationId) || [];
}

function setAdminMessages(conversationId, messages, { silent = false } = {}) {
  const current = adminChatState.messagesByConversation.get(conversationId) || [];
  const localUnsent = current.filter(isLocalUnsentMessage);
  const normalized = mergeChatMessages(localUnsent, messages || []);
  adminChatState.messagesByConversation.set(conversationId, normalized);
  observeAdminClientMessages(normalized, { silent });
  if (conversationId === adminChatState.activeConversationId) {
    const last = normalized.at(-1);
    adminChatState.lastSyncAt = last?.created_at || '';
    adminChatState.lastMessageId = last?.id || '';
  }
  return normalized;
}

function adminUpsertConversation(conversation) {
  if (!conversation?.id) return;
  const current = adminChatState.conversations instanceof Map ? adminChatState.conversations.get(conversation.id) : null;
  adminChatState.conversations.set(conversation.id, { ...(current || {}), ...conversation });
  adminState.conversations = adminConversationList().sort((a, b) => new Date(b.updated_at || b.last_message_at || b.created_at || 0) - new Date(a.updated_at || a.last_message_at || a.created_at || 0));
  renderAdminUnreadBadge();
}

function adminUpsertMessage(message) {
  const conversationId = message?.conversation_id || adminChatState.activeConversationId;
  if (!conversationId) return [];
  const currentMessages = adminChatState.messagesByConversation.get(conversationId) || [];
  const nextMessages = mergeChatMessages(currentMessages, [{ ...message, conversation_id: conversationId }]);
  const previousSignature = currentMessages.map(item => `${item.id}:${item.client_message_id}:${item.created_at}:${item.body}:${item.delivery_status}:${item.error_message || ''}`).join('|');
  const nextSignature = nextMessages.map(item => `${item.id}:${item.client_message_id}:${item.created_at}:${item.body}:${item.delivery_status}:${item.error_message || ''}`).join('|');
  adminChatState.messagesByConversation.set(conversationId, nextMessages);
  const last = nextMessages.at(-1);
  if (conversationId === adminChatState.activeConversationId) {
    adminChatState.lastSyncAt = last?.created_at || adminChatState.lastSyncAt || '';
    adminChatState.lastMessageId = last?.id || adminChatState.lastMessageId || '';
  }
  if (message.conversation_id) {
    adminState.messages = mergeChatMessages(adminState.messages || [], [message]);
  }
  observeAdminClientMessages([message]);
  return { messages: nextMessages, changed: previousSignature !== nextSignature };
}

function activeAdminConversation() {
  return adminChatState.conversations.get(adminChatState.activeConversationId) || (adminState.conversations || []).find(item => item.id === adminChatState.activeConversationId);
}

function scrollAdminMessages() {
  const container = $('#dialog-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

function renderAdminMessageHistory() {
  const container = $('#dialog-messages');
  if (!container) return;
  const conversation = activeAdminConversation();
  if (!adminChatState.activeConversationId) {
    container.innerHTML = adminEmpty(adminText('Выберите диалог слева.', 'Choose a dialog on the left.'));
    return;
  }
  const shouldStickToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 96;
  container.innerHTML = activeAdminMessages().map(message => `
    <article class="${messageClass(message)}">
      <strong>${escapeHtml(chatLabel(chatSenderLabels, message.sender))}${message.pending ? ' · отправка...' : ''}${message.failed ? ' · ошибка' : ''}</strong>
      <p>${escapeHtml(message.body)}</p>
      ${message.failed ? `<div class="admin-actions"><button class="button small" type="button" data-retry-owner-message="${escapeHtml(message.client_message_id)}">${adminText('Повторить', 'Retry')}</button><button class="button small delete-review" type="button" data-remove-local-message="${escapeHtml(message.client_message_id)}">${adminText('Удалить локально', 'Remove locally')}</button></div>` : ''}
      ${message.error_message ? `<small>${escapeHtml(message.error_message)}</small>` : ''}
      <small>${new Date(message.created_at).toLocaleString('ru-RU')}</small>
    </article>
  `).join('') || adminEmpty(adminText('Сообщений пока нет.', 'There are no messages yet.'));
  const form = $('#dialog-reply-form');
  if (form) {
    const isLocked = conversation?.status === 'closed' || Boolean(conversation?.archived_at);
    $$('textarea,button[type="submit"]', form).forEach(node => { node.disabled = isLocked || adminChatState.sending; });
  }
  if (shouldStickToBottom) scrollAdminMessages();
}

function renderAdminDialogActions() {
  const actions = $('#dialog-actions');
  if (!actions) return;
  const conversation = activeAdminConversation();
  if (!conversation) {
    actions.innerHTML = '';
    return;
  }
  const isClosed = conversation.status === 'closed';
  const isArchived = Boolean(conversation.archived_at);
  const mode = conversation.assistant_mode || 'auto';
  const aiActive = mode === 'auto' && !conversation.owner_joined_at && !conversation.needs_human && !isClosed && !isArchived;
  actions.innerHTML = `
    <span class="admin-inline-control">${aiActive ? adminText('AI отвечает', 'AI active') : adminText('AI на паузе', 'AI paused')}</span>
    <label class="admin-inline-control">${adminText('ИИ', 'AI')}<select data-admin-assistant-mode>
      ${[['auto','Auto'],['suggest','Suggest'],['disabled','Off']].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}
    </select></label>
    ${!conversation.owner_joined_at && !isClosed && !isArchived ? `<button class="button small" type="button" data-admin-take-dialog>${adminText('Взять диалог', 'Take dialog')}</button>` : ''}
    ${isClosed ? `<button class="button small" type="button" data-admin-reopen-dialog>${adminText('Открыть снова', 'Reopen')}</button>` : `<button class="button small" type="button" data-admin-close-dialog>${adminText('Закрыть диалог', 'Close dialog')}</button>`}
    ${isArchived ? `<button class="button small" type="button" data-admin-restore-dialog>${adminText('Восстановить', 'Restore')}</button>` : `<button class="button small" type="button" data-admin-archive-dialog>${adminText('Архивировать', 'Archive')}</button>`}
    <button class="button small delete-review" type="button" data-admin-delete-dialog>${adminText('Удалить навсегда', 'Delete permanently')}</button>`;
}

function stopAdminChatSync() {
  window.clearTimeout(adminChatState.pollingTimer);
  adminChatState.pollingTimer = null;
  if (adminChatState.realtimeChannel?.unsubscribe) {
    adminChatState.realtimeChannel.unsubscribe();
  }
  adminChatState.realtimeChannel = null;
}

async function fetchAdminConversations() {
  const [conversations, messages] = await Promise.all([
    adminSupabase('admin.conversations.list', '/rest/v1/conversations?select=id,client_id,lead_id,support_ticket_id,subject,category,status,page_url,unread_for_owner,unread_for_guest,priority,assistant_mode,needs_human,owner_joined_at,archived_at,archived_by,deleted_at,deleted_by,closed_at,closed_by,created_at,updated_at&order=updated_at.desc'),
    adminSupabase('admin.messages.preview', '/rest/v1/messages?select=id,conversation_id,sender,body,created_at,client_message_id&order=created_at.desc&limit=200').catch(error => {
      setAdminSyncMode('error');
      return [];
    })
  ]);
  setAdminConversations(conversations || []);
  adminState.messages = mergeChatMessages(adminState.messages || [], messages || []);
  observeAdminClientMessages(messages || []);
  renderAdminDashboard();
  renderAdminDialogs();
}

async function pollAdminChat(options = {}) {
  const generation = options.generation || adminChatState.requestGeneration;
  const conversationId = adminChatState.activeConversationId;
  try {
    await fetchAdminConversations();
  } catch (error) {
    adminChatState.pollingErrors += 1;
    setAdminSyncMode('error');
  }
  if (!conversationId || conversationId !== adminChatState.activeConversationId || generation !== adminChatState.requestGeneration) return;
  const result = await adminSupabase('admin.chat.pollMessages', '/rest/v1/rpc/chat_owner_messages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      p_conversation_id: conversationId,
      p_after_created_at: null,
      p_after_id: null
    })
  }, { conversation_id: conversationId }).catch(error => {
    adminChatState.pollingErrors += 1;
    setAdminSyncMode('error');
    return [];
  });
  if (conversationId !== adminChatState.activeConversationId || generation !== adminChatState.requestGeneration) return;
  const before = activeAdminMessages().map(item => `${item.id}:${item.client_message_id}:${item.created_at}:${item.body}:${item.delivery_status}:${item.error_message || ''}`).join('|');
  setAdminMessages(conversationId, Array.isArray(result) ? result : []);
  const after = activeAdminMessages().map(item => `${item.id}:${item.client_message_id}:${item.created_at}:${item.body}:${item.delivery_status}:${item.error_message || ''}`).join('|');
  if (before !== after) {
    renderAdminMessageHistory();
    renderAdminDialogs();
  }
  if (adminChatState.syncMode !== 'realtime') setAdminSyncMode('polling');
}

function scheduleAdminPolling(generation, delay = document.hidden ? 9000 : 2000) {
  window.clearTimeout(adminChatState.pollingTimer);
  adminChatState.pollingTimer = window.setTimeout(async () => {
    try {
      await pollAdminChat({ generation });
    } finally {
      if (adminChatState.activeConversationId && generation === adminChatState.requestGeneration) {
        scheduleAdminPolling(generation);
      }
    }
  }, delay);
}

async function startAdminRealtime(conversationId) {
  if (!window.supabase?.createClient) return false;
  try {
    const { client, session } = await ensureAdminAuthSession();
    if (!client || !session?.access_token) throw new Error('OWNER session is unavailable for Realtime');
    await client.realtime?.setAuth?.(session.access_token);
    const channel = client.channel(`owner-conversation-${conversationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
        if (conversationId !== adminChatState.activeConversationId) return;
        if (payload.eventType === 'DELETE' && payload.old?.id) {
          const current = activeAdminMessages().filter(message => message.id !== payload.old.id);
          setAdminMessages(conversationId, current, { silent: true });
          renderAdminMessageHistory();
          return;
        }
        if (payload.new) {
          const result = adminUpsertMessage(payload.new);
          if (result.changed) renderAdminMessageHistory();
          renderAdminDialogs();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` }, payload => {
        if (conversationId !== adminChatState.activeConversationId) return;
        if (payload.new) {
          adminUpsertConversation(payload.new);
          renderAdminDialogs();
          renderAdminDialogActions();
          renderAdminMessageHistory();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, payload => {
        if (payload.eventType === 'DELETE' && payload.old?.id) {
          adminChatState.conversations.delete(payload.old.id);
          adminState.conversations = adminConversationList();
          renderAdminDashboard();
          renderAdminDialogs();
          return;
        }
        if (payload.new) {
          adminUpsertConversation(payload.new);
          renderAdminDashboard();
          renderAdminDialogs();
        }
      })
      .subscribe((status, err) => {
        if (err) logAdminSupabaseError('admin.realtime.status', err, { conversation_id: conversationId });
        if (status === 'SUBSCRIBED') {
          setAdminSyncMode('realtime');
        }
        if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
          setAdminSyncMode('polling');
        }
      });
    adminChatState.realtimeChannel = channel;
    return true;
  } catch (error) {
    logAdminSupabaseError('admin.realtime.subscribe', error, { conversation_id: conversationId });
    setAdminSyncMode('polling');
    return false;
  }
}

function stopAdminGlobalNotifications() {
  window.clearTimeout(adminChatState.notificationPollingTimer);
  adminChatState.notificationPollingTimer = null;
  if (adminChatState.globalRealtimeChannel?.unsubscribe) {
    adminChatState.globalRealtimeChannel.unsubscribe();
  }
  adminChatState.globalRealtimeChannel = null;
}

async function startAdminGlobalNotifications() {
  if (adminChatState.globalRealtimeChannel || !window.supabase?.createClient) return false;
  try {
    const { client, session } = await ensureAdminAuthSession();
    if (!client || !session?.access_token) throw new Error('OWNER session is unavailable for global notifications');
    await client.realtime?.setAuth?.(session.access_token);
    const channel = client.channel('owner-global-client-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (!payload.new || payload.new.sender !== 'client') return;
        const result = adminUpsertMessage(payload.new);
        if (result.changed && payload.new.conversation_id === adminChatState.activeConversationId) renderAdminMessageHistory();
        renderAdminDashboard();
        renderAdminDialogs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, payload => {
        if (payload.eventType === 'DELETE' && payload.old?.id) {
          adminChatState.conversations.delete(payload.old.id);
          adminState.conversations = adminConversationList();
        } else if (payload.new) {
          adminUpsertConversation(payload.new);
        }
        renderAdminDashboard();
        renderAdminDialogs();
      })
      .subscribe((status, err) => {
        if (err) logAdminSupabaseError('admin.globalRealtime.status', err);
        if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
          adminChatState.globalRealtimeChannel = null;
          scheduleAdminNotificationPolling(3000);
        }
      });
    adminChatState.globalRealtimeChannel = channel;
    return true;
  } catch (error) {
    logAdminSupabaseError('admin.globalRealtime.subscribe', error);
    scheduleAdminNotificationPolling(3000);
    return false;
  }
}

function scheduleAdminNotificationPolling(delay = document.hidden ? 12000 : 4000) {
  window.clearTimeout(adminChatState.notificationPollingTimer);
  adminChatState.notificationPollingTimer = window.setTimeout(async () => {
    try {
      await fetchAdminConversations();
    } finally {
      scheduleAdminNotificationPolling();
    }
  }, delay);
}

async function startAdminChatSync(conversationId) {
  stopAdminChatSync();
  const generation = adminChatState.requestGeneration;
  const realtimeStarted = await startAdminRealtime(conversationId);
  if (!realtimeStarted) setAdminSyncMode('polling');
  scheduleAdminPolling(generation, 0);
}

function reviewStatusLabel(status) {
  const labels = {
    pending: lang === 'ru' ? 'На модерации' : 'Pending',
    published: lang === 'ru' ? 'Опубликован' : 'Published',
    rejected: lang === 'ru' ? 'Отклонён' : 'Rejected'
  };
  return labels[status] || labels.pending;
}

async function renderModeration() {
  if (!moderationList) return;
  setAdminLoading(true);
  setAdminMessage('');
  try {
    const [reviews, leads, conversations, tickets, clients, messages, activity, assistantSettings, assistantKnowledge] = await Promise.all([
      getAllReviews(),
      adminSupabase('admin.leads.list', '/rest/v1/leads?select=id,name,contact,contact_method,preferred_channel,last_contact_channel,project_type,description,source,status,conversation_id,client_id,created_at,updated_at&order=created_at.desc'),
      adminSupabase('admin.conversations.list.initial', '/rest/v1/conversations?select=id,client_id,lead_id,support_ticket_id,subject,category,status,page_url,unread_for_owner,unread_for_guest,priority,assistant_mode,needs_human,owner_joined_at,archived_at,archived_by,deleted_at,deleted_by,closed_at,closed_by,created_at,updated_at&order=updated_at.desc'),
      adminSupabase('admin.supportTickets.list', '/rest/v1/support_tickets?select=id,client_id,conversation_id,subject,project,priority,description,status,contact_method,last_contact_channel,created_at,updated_at&order=created_at.desc'),
      adminSupabase('admin.clients.list', '/rest/v1/clients?select=id,name,contact,email,preferred_channel,last_contact_channel,created_at,updated_at&order=created_at.desc'),
      adminSupabase('admin.messages.preview.initial', '/rest/v1/messages?select=id,conversation_id,sender,body,created_at,client_message_id&order=created_at.desc&limit=200').catch(error => []),
      adminSupabase('admin.activity.list', '/rest/v1/admin_activity?select=id,action,entity_type,entity_id,created_at&order=created_at.desc&limit=20').catch(error => []),
      adminSupabase('admin.assistant.settings', '/rest/v1/assistant_settings?select=enabled,default_mode,locale,tone,max_answer_chars,business_hours,services,pricing_rules,timeline_rules,handoff_message&id=eq.true').catch(error => []),
      adminSupabase('admin.assistant.knowledge', '/rest/v1/assistant_knowledge?select=id,title,category,enabled,updated_at&order=category.asc,title.asc&limit=80').catch(error => [])
    ]);
    adminState.reviews = reviews;
    adminState.leads = leads || [];
    setAdminConversations(conversations || []);
    adminState.tickets = tickets || [];
    adminState.clients = clients || [];
    adminState.messages = mergeChatMessages([], messages || []);
    observeAdminClientMessages(adminState.messages, { silent: true });
    adminChatState.messagesByConversation = new Map();
    adminState.messages.forEach(message => {
      const conversationMessages = adminChatState.messagesByConversation.get(message.conversation_id) || [];
      adminChatState.messagesByConversation.set(message.conversation_id, mergeChatMessages(conversationMessages, [message]));
    });
    adminState.activity = activity || [];
    adminState.assistantSettings = Array.isArray(assistantSettings) ? assistantSettings[0] : assistantSettings;
    adminState.assistantKnowledge = assistantKnowledge || [];

    renderAdminDashboard();
    renderAdminLeads();
    renderAdminDialogs();
    renderAdminTickets();
    renderAdminClients();
    renderAdminSecurity();
    startAdminGlobalNotifications().catch(error => logAdminSupabaseError('admin.globalNotifications.start', error));

    moderationList.replaceChildren();
    const counters = { pending: 0, published: 0, rejected: 0 };
    reviews.forEach(review => { counters[review.status || (review.published ? 'published' : 'pending')] += 1; });
    $$('[data-moderation-count]').forEach(node => { node.textContent = String(counters[node.dataset.moderationCount] || 0); });
    if (!reviews.length) {
      moderationList.innerHTML = adminEmpty(adminText('Отзывов для модерации пока нет.', 'There are no reviews to moderate yet.'));
      return;
    }
    reviews.forEach(review => {
      const status = review.status || (review.published ? 'published' : 'pending');
      const card = document.createElement('article');
      card.className = `moderation-card status-${status}`;
      card.dataset.reviewId = review.id;
      const header = document.createElement('div');
      header.className = 'moderation-card-head';
      const identity = document.createElement('div');
      const name = document.createElement('h3');
      name.textContent = review.name;
      const company = document.createElement('small');
      company.textContent = review.company || (lang === 'ru' ? 'Компания не указана' : 'No company provided');
      identity.append(name, company);
      const badge = document.createElement('span');
      badge.className = `moderation-badge ${status}`;
      badge.textContent = reviewStatusLabel(status);
      header.append(identity, badge);
      const rating = document.createElement('div');
      rating.className = 'review-stars';
      rating.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      const text = document.createElement('p');
      text.textContent = review.text;
      const date = document.createElement('time');
      date.dateTime = review.createdAt;
      date.textContent = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(review.createdAt));
      const actions = document.createElement('div');
      actions.className = 'moderation-actions';
      actions.innerHTML = `<button class="button small approve-review" type="button" data-action="published" data-id="${review.id}">${lang === 'ru' ? 'Одобрить' : 'Approve'}</button><button class="button small reject-review" type="button" data-action="rejected" data-id="${review.id}">${lang === 'ru' ? 'Отклонить' : 'Reject'}</button><button class="button small delete-review" type="button" data-action="delete" data-id="${review.id}">${lang === 'ru' ? 'Удалить' : 'Delete'}</button>`;
      card.append(header, rating, text, date, actions);
      moderationList.appendChild(card);
    });
  } catch (error) {
    const message = describeSupabaseError(error);
    setAdminMessage(message, 'error');
    ['admin-leads', 'admin-dialogs', 'admin-tickets', 'admin-clients', 'admin-security', 'moderation-list'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.innerHTML = adminEmpty(message);
    });
    throw error;
  } finally {
    adminState.loading = false;
  }
}

function renderAdminDashboard() {
  renderAdminUnreadBadge();
  const counts = {
    'new-leads': adminState.leads.filter(item => item.status === 'new').length,
    'unread-dialogs': adminConversationList().filter(item => Number(item.unread_for_owner || 0) > 0).length,
    'open-tickets': adminConversationList().filter(item => !['closed','resolved'].includes(item.status) && !item.archived_at && !item.deleted_at).length,
    'pending-reviews': adminState.reviews.filter(item => item.status === 'pending').length
  };
  Object.entries(counts).forEach(([key, value]) => {
    const node = $(`[data-admin-count="${key}"]`);
    if (node) node.textContent = String(value);
  });
}

function renderAdminLeads() {
  const container = $('#admin-leads');
  if (!container) return;
  const filter = $('#lead-status-filter')?.value || '';
  const leads = filter ? adminState.leads.filter(item => item.status === filter) : adminState.leads;
  container.innerHTML = leads.map(lead => `
    <article class="admin-card">
      <div class="admin-card-head"><div><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.contact)}</small></div><span class="moderation-badge">${leadStatusLabels[lead.status] || escapeHtml(lead.status)}</span></div>
      <p>${escapeHtml(lead.description)}</p>
      <dl><dt>Тип проекта</dt><dd>${escapeHtml(lead.project_type)}</dd><dt>Выбранный канал</dt><dd>${escapeHtml(channelLabel(lead.contact_method || lead.preferred_channel))}</dd><dt>Указанный контакт</dt><dd>${escapeHtml(lead.contact)}</dd><dt>Диалог на сайте</dt><dd>${lead.conversation_id ? 'активен' : 'нет'}</dd><dt>Последний канал</dt><dd>${escapeHtml(channelLabel(lead.last_contact_channel || lead.contact_method))}</dd><dt>Источник</dt><dd>${escapeHtml(lead.source)}</dd><dt>Дата</dt><dd>${new Date(lead.created_at).toLocaleString('ru-RU')}</dd></dl>
      <div class="admin-actions"><select data-lead-status="${lead.id}">${Object.entries(leadStatusLabels).map(([value,label]) => `<option value="${value}" ${lead.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select><select data-lead-channel="${lead.id}">${Object.keys(channelLabels).map(value => `<option value="${value}" ${(lead.last_contact_channel || lead.contact_method) === value ? 'selected' : ''}>${escapeHtml(channelLabel(value))}</option>`).join('')}</select></div>
    </article>
  `).join('') || adminEmpty(adminText('Заявок пока нет.', 'There are no requests yet.'));
}

function renderAdminDialogs() {
  const container = $('#admin-dialogs');
  if (!container) return;
  const filter = $('#message-category-filter')?.value || '';
  const dialogs = adminConversationList().filter(dialog => {
    if (dialog.deleted_at) return false;
    if (!filter || filter === 'active') return !dialog.archived_at && !['closed', 'resolved'].includes(dialog.status);
    if (filter === 'waiting_owner') return !dialog.archived_at && dialog.status === 'waiting_owner';
    if (filter === 'waiting_client') return !dialog.archived_at && dialog.status === 'waiting_client';
    if (filter === 'archive') return Boolean(dialog.archived_at);
    if (filter === 'all') return true;
    if (filter === 'closed') return ['closed', 'resolved'].includes(dialog.status);
    return (dialog.category || (dialog.lead_id ? 'project' : dialog.support_ticket_id ? 'support' : 'question')) === filter && !['closed', 'resolved'].includes(dialog.status);
  });
  container.innerHTML = dialogs.map(dialog => {
    const client = adminState.clients.find(item => item.id === dialog.client_id);
    const lead = adminState.leads.find(item => item.id === dialog.lead_id);
    const ticket = adminState.tickets.find(item => item.id === dialog.support_ticket_id);
    const category = dialog.category || (dialog.lead_id ? 'project' : dialog.support_ticket_id ? 'support' : 'question');
    const lastMessage = (adminChatState.messagesByConversation.get(dialog.id) || adminState.messages || []).filter(item => item.conversation_id === dialog.id).at(-1);
    const statusParts = [
      chatStatusLabels[dialog.status]?.ru || dialog.status || 'new',
      dialog.archived_at ? 'Архив' : '',
      dialog.needs_human ? 'Нужен ответ' : '',
      dialog.owner_joined_at ? 'Владелец подключился' : (dialog.assistant_mode === 'auto' ? 'AI отвечает' : '')
    ].filter(Boolean).join(' · ');
    return `<article class="admin-card dialog-item ${adminChatState.activeConversationId === dialog.id ? 'active' : ''}" data-dialog-id="${dialog.id}">
      <div class="admin-card-head"><div><strong>${escapeHtml(client?.name || lead?.name || ticket?.requester_name || 'Клиент')}</strong><small>${escapeHtml(chatCategoryLabels[category]?.ru || category)}${dialog.priority === 'high' ? ' · Нужен ответ' : ''}</small></div><span class="moderation-badge">${Number(dialog.unread_for_owner || 0)}</span></div>
      <p>${escapeHtml(lastMessage?.body || dialog.subject || 'Сообщений пока нет')}</p>
      <dl><dt>Тема</dt><dd>${escapeHtml(dialog.subject || chatCategoryLabels[category]?.ru || 'Обращение')}</dd><dt>Заявка</dt><dd>${lead ? escapeHtml(lead.project_type) : 'нет'}</dd><dt>Страница</dt><dd>${escapeHtml(dialog.page_url || 'не указана')}</dd><dt>Статус</dt><dd>${escapeHtml(statusParts)}</dd><dt>ИИ</dt><dd>${escapeHtml(dialog.assistant_mode || 'auto')}</dd><dt>Последнее сообщение</dt><dd>${lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleString('ru-RU') : '—'}</dd></dl>
      <div class="admin-actions"><select data-dialog-category="${dialog.id}">${Object.entries(chatCategoryLabels).map(([value,label]) => `<option value="${value}" ${category === value ? 'selected' : ''}>${escapeHtml(label.ru)}</option>`).join('')}</select><select data-dialog-status="${dialog.id}">${Object.entries(chatStatusLabels).map(([value,label]) => `<option value="${value}" ${(dialog.status || 'new') === value ? 'selected' : ''}>${escapeHtml(label.ru)}</option>`).join('')}</select></div>
    </article>`;
  }).join('') || adminEmpty(adminText('Сообщений пока нет.', 'There are no messages yet.'));
}

async function loadDialogMessages(conversationId) {
  const generation = adminChatState.requestGeneration + 1;
  adminChatState.requestGeneration = generation;
  adminState.selectedConversationId = conversationId;
  adminChatState.activeConversationId = conversationId;
  setAdminMessages(conversationId, [], { silent: true });
  adminChatState.lastSyncAt = '';
  adminChatState.lastMessageId = '';
  stopAdminChatSync();
  setAdminSyncMode('polling', adminText('Синхронизация: загрузка', 'Sync: loading'));
  renderAdminDialogs();
  const title = $('#dialog-title');
  const messagesContainer = $('#dialog-messages');
  const conversation = activeAdminConversation();
  if (title) title.textContent = conversation?.subject || `Диалог ${conversationId.slice(0, 8)}`;
  renderAdminDialogActions();
  if (messagesContainer) messagesContainer.innerHTML = adminEmpty(adminText('Загрузка сообщений...', 'Loading messages...'));
  const messages = await adminSupabase('admin.chat.loadMessages', '/rest/v1/rpc/chat_owner_messages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ p_conversation_id: conversationId, p_after_created_at: null, p_after_id: null })
  }, { conversation_id: conversationId });
  if (generation !== adminChatState.requestGeneration || conversationId !== adminChatState.activeConversationId) return;
  setAdminMessages(conversationId, Array.isArray(messages) ? messages : [], { silent: true });
  await adminSupabase('admin.chat.markRead', '/rest/v1/rpc/chat_owner_mark_read', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ p_conversation_id: conversationId })
  }, { conversation_id: conversationId }).catch(() => {});
  if (generation !== adminChatState.requestGeneration || conversationId !== adminChatState.activeConversationId) return;
  adminUpsertConversation({ id: conversationId, unread_for_owner: 0, updated_at: new Date().toISOString() });
  renderAdminDialogs();
  renderAdminDialogActions();
  renderAdminMessageHistory();
  await startAdminChatSync(conversationId);
}

function requestedAdminConversationId() {
  const id = new URLSearchParams(location.search).get('conversation') || '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? id : '';
}

async function openRequestedAdminConversation() {
  const conversationId = requestedAdminConversationId();
  if (!conversationId || !moderationPanel || moderationPanel.classList.contains('hidden')) return;
  if (!adminConversationList().some(item => item.id === conversationId)) return;
  const messagesTab = $('[data-admin-tab="messages"]');
  messagesTab?.click();
  await loadDialogMessages(conversationId);
}

function renderAdminTickets() {
  const container = $('#admin-tickets');
  if (!container) return;
  container.innerHTML = adminState.tickets.map(ticket => {
    const client = adminState.clients.find(item => item.id === ticket.client_id);
    return `<article class="admin-card">
      <div class="admin-card-head"><div><strong>${escapeHtml(ticket.subject)}</strong><small>${escapeHtml(client?.name || 'Клиент')}</small></div><span class="moderation-badge">${ticketStatusLabels[ticket.status] || escapeHtml(ticket.status)}</span></div>
      <p>${escapeHtml(ticket.description)}</p>
      <dl><dt>Проект</dt><dd>${escapeHtml(ticket.project || 'не указан')}</dd><dt>Приоритет</dt><dd>${escapeHtml(ticket.priority)}</dd><dt>Канал</dt><dd>${escapeHtml(channelLabel(ticket.contact_method || ticket.last_contact_channel || 'site_chat'))}</dd><dt>Дата</dt><dd>${new Date(ticket.created_at).toLocaleString('ru-RU')}</dd></dl>
      <div class="admin-actions"><select data-ticket-status="${ticket.id}">${Object.entries(ticketStatusLabels).map(([value,label]) => `<option value="${value}" ${ticket.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
    </article>`;
  }).join('') || adminEmpty(adminText('Тикетов пока нет.', 'There are no tickets yet.'));
}

function renderAdminClients() {
  const container = $('#admin-clients');
  if (!container) return;
  container.innerHTML = adminState.clients.map(client => {
    const leads = adminState.leads.filter(item => item.client_id === client.id);
    const tickets = adminState.tickets.filter(item => item.client_id === client.id);
    const dialogs = adminState.conversations.filter(item => item.client_id === client.id);
    return `<article class="admin-card">
      <div class="admin-card-head"><div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.contact || client.email || 'контакт не указан')}</small></div></div>
      <dl><dt>Заявки</dt><dd>${leads.length}</dd><dt>Выбранный канал</dt><dd>${escapeHtml(channelLabel(client.preferred_channel || leads[0]?.contact_method))}</dd><dt>Указанный контакт</dt><dd>${escapeHtml(client.contact || client.email || 'нет')}</dd><dt>Диалог на сайте</dt><dd>${dialogs.length ? 'есть' : 'нет'}</dd><dt>Последний канал</dt><dd>${escapeHtml(channelLabel(client.last_contact_channel || leads[0]?.last_contact_channel))}</dd><dt>Проекты</dt><dd>${leads.map(item => escapeHtml(item.project_type)).join(', ') || 'нет'}</dd><dt>Обращения</dt><dd>${tickets.length}</dd><dt>История переписки</dt><dd>${dialogs.length} диалогов</dd></dl>
    </article>`;
  }).join('') || adminEmpty(adminText('Клиентов пока нет.', 'There are no clients yet.'));
}

function renderAdminSecurity() {
  const container = $('#admin-security');
  if (!container) return;
  const settings = adminState.assistantSettings || {};
  const knowledge = adminState.assistantKnowledge || [];
  container.innerHTML = `
    <article class="admin-card"><strong>Supabase Auth</strong><p>Панель использует существующий Supabase JWT. Service role key не используется во frontend.</p></article>
    <article class="admin-card"><strong>RLS</strong><p>Примените файл <code>supabase/admin-panel-schema.sql</code>. OWNER задаётся строкой в <code>admin_profiles</code>.</p></article>
    <article class="admin-card"><strong>ИИ-ассистент</strong><p>Режим по умолчанию: <code>${escapeHtml(settings.default_mode || 'auto')}</code>. Язык: <code>${escapeHtml(settings.locale || 'ru')}</code>. Тон: <code>${escapeHtml(settings.tone || 'professional')}</code>. Ключ AI хранится только в Supabase Edge Function secret.</p></article>
    <article class="admin-card"><strong>База знаний</strong><p>${knowledge.length ? `Записей: ${knowledge.length}. Включено: ${knowledge.filter(item => item.enabled).length}.` : 'После выполнения SQL здесь появятся записи базы знаний ассистента.'}</p></article>
    ${adminState.activity.map(item => `<article class="admin-card"><strong>${escapeHtml(item.action)}</strong><small>${new Date(item.created_at).toLocaleString('ru-RU')}</small></article>`).join('')}
  `;
}

function openModerationPanel() {
  moderationLogin?.classList.add('hidden');
  moderationPanel?.classList.remove('hidden');
  renderModeration().then(() => openRequestedAdminConversation()).catch(() => {
    setAdminMessage(adminText('Панель открыта, но данные недоступны. Проверьте OWNER user id и RLS в Supabase.', 'The panel is open, but data is unavailable. Check the OWNER user id and RLS in Supabase.'), 'error');
  });
}

if (moderationLogin && sessionStorage.getItem(moderatorTokenKey)) openModerationPanel();
forgotPasswordToggle?.addEventListener('click', () => {
  moderationLogin?.classList.add('hidden');
  forgotPasswordForm?.classList.remove('hidden');
  setAdminMessage('');
  const email = moderationLogin?.elements?.email?.value;
  if (email && forgotPasswordForm?.elements?.email) forgotPasswordForm.elements.email.value = email;
});

forgotPasswordCancel?.addEventListener('click', () => {
  forgotPasswordForm?.classList.add('hidden');
  moderationLogin?.classList.remove('hidden');
  setAdminMessage('');
});

forgotPasswordForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(forgotPasswordForm);
  const email = cleanFormValue(data.get('email'), 160);
  const button = $('button[type="submit"]', forgotPasswordForm);
  if (!email) return;
  button.disabled = true;
  try {
    await requestPasswordResetEmail(email);
    forgotPasswordForm.reset();
    setAdminMessage(adminText('Если OWNER-аккаунт существует, Supabase отправит письмо со ссылкой для нового пароля.', 'If the OWNER account exists, Supabase will send an email with a new-password link.'));
  } catch (error) {
    setAdminMessage(adminText('Не удалось отправить письмо восстановления. Проверьте Supabase Auth settings и разрешённый redirect URL.', 'Could not send the recovery email. Check Supabase Auth settings and the allowed redirect URL.'), 'error');
  } finally {
    button.disabled = false;
  }
});

moderationLogin?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(moderationLogin);
  const button = $('button[type="submit"]', moderationLogin);
  button.disabled = true;
  try {
    const session = useLocalReviewDatabase
      ? { accessToken: 'local-test-token', refreshToken: '' }
      : await signInModerator(String(data.get('email')).trim(), String(data.get('password')));
    sessionStorage.setItem(moderatorTokenKey, session.accessToken);
    if (session.refreshToken) sessionStorage.setItem(moderatorRefreshTokenKey, session.refreshToken);
    if (moderationMessage) moderationMessage.textContent = '';
    openModerationPanel();
  } catch (error) {
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Не удалось войти. Проверьте email, пароль и подключение Supabase.' : 'Could not sign in. Check your email, password, and Supabase connection.';
  } finally {
    button.disabled = false;
  }
});

moderationLogout?.addEventListener('click', () => {
  stopAdminGlobalNotifications();
  stopAdminChatSync();
  sessionStorage.removeItem(moderatorTokenKey);
  sessionStorage.removeItem(moderatorRefreshTokenKey);
  getSupabaseBrowserClient().then(client => client.auth.signOut()).catch(() => {});
  location.reload();
});

moderationList?.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  button.disabled = true;
  try {
    if (button.dataset.action === 'delete') await deleteReview(button.dataset.id);
    else await updateReviewStatus(button.dataset.id, button.dataset.action);
    await renderModeration();
  } catch (error) {
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Не удалось изменить отзыв.' : 'Could not update the review.';
    button.disabled = false;
  }
});

$$('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
  adminChatState.notificationSoundReady = true;
  ensureAdminNotificationSound();
  $$('.admin-tab').forEach(item => item.classList.remove('active'));
  $$('.admin-view').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  $(`[data-admin-view="${tab.dataset.adminTab}"]`)?.classList.add('active');
}));

$('#lead-status-filter')?.addEventListener('change', renderAdminLeads);
$('#message-category-filter')?.addEventListener('change', renderAdminDialogs);

$('#admin-leads')?.addEventListener('change', async event => {
  const select = event.target.closest('select[data-lead-status]');
  const channelSelect = event.target.closest('select[data-lead-channel]');
  if (!select && !channelSelect) return;
  if (channelSelect) {
    channelSelect.disabled = true;
    try {
      await supabaseAdmin(`/rest/v1/leads?id=eq.${encodeURIComponent(channelSelect.dataset.leadChannel)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ last_contact_channel: channelSelect.value, preferred_channel: channelSelect.value, updated_at: new Date().toISOString() })
      });
      await renderModeration();
      setAdminMessage(adminText('Канал заявки обновлён.', 'Request channel updated.'));
    } catch (error) {
      setAdminMessage(describeSupabaseError(error), 'error');
      channelSelect.disabled = false;
    }
    return;
  }
  select.disabled = true;
  try {
    await supabaseAdmin(`/rest/v1/leads?id=eq.${encodeURIComponent(select.dataset.leadStatus)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: select.value, updated_at: new Date().toISOString() })
    });
    await renderModeration();
    setAdminMessage(adminText('Статус заявки изменён.', 'Request status updated.'));
  } catch (error) {
    setAdminMessage(describeSupabaseError(error), 'error');
    select.disabled = false;
  }
});

$('#admin-tickets')?.addEventListener('change', async event => {
  const select = event.target.closest('select[data-ticket-status]');
  if (!select) return;
  select.disabled = true;
  try {
    await supabaseAdmin(`/rest/v1/support_tickets?id=eq.${encodeURIComponent(select.dataset.ticketStatus)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: select.value, updated_at: new Date().toISOString() })
    });
    await renderModeration();
    setAdminMessage(adminText('Статус тикета изменён.', 'Ticket status updated.'));
  } catch (error) {
    setAdminMessage(describeSupabaseError(error), 'error');
    select.disabled = false;
  }
});

$('#admin-dialogs')?.addEventListener('click', event => {
  if (event.target.closest('select')) return;
  const card = event.target.closest('[data-dialog-id]');
  if (card) loadDialogMessages(card.dataset.dialogId).catch(error => {
    setAdminSyncMode('error');
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Не удалось открыть диалог.' : 'Could not open dialog.';
  });
});

$('#admin-dialogs')?.addEventListener('change', async event => {
  const categorySelect = event.target.closest('select[data-dialog-category]');
  const statusSelect = event.target.closest('select[data-dialog-status]');
  if (!categorySelect && !statusSelect) return;
  const select = categorySelect || statusSelect;
  const id = categorySelect?.dataset.dialogCategory || statusSelect?.dataset.dialogStatus;
  select.disabled = true;
  try {
    await adminSupabase('admin.conversation.updateMeta', `/rest/v1/conversations?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        ...(categorySelect ? { category: categorySelect.value } : { status: statusSelect.value }),
        updated_at: new Date().toISOString()
      })
    }, { conversation_id: id });
    adminUpsertConversation({ id, ...(categorySelect ? { category: categorySelect.value } : { status: statusSelect.value }), updated_at: new Date().toISOString() });
    renderAdminDialogs();
    renderAdminDialogActions();
    renderAdminMessageHistory();
    setAdminMessage(adminText('Диалог обновлён.', 'Dialog updated.'));
  } catch (error) {
    setAdminMessage(describeSupabaseError(error), 'error');
    select.disabled = false;
  }
});

async function sendOwnerChatMessage({ body, clientMessageId = createClientMessageId('owner'), formElement = null, textarea = null }) {
  const conversationId = adminChatState.activeConversationId;
  if (!conversationId || adminChatState.sendingMessageIds.has(clientMessageId)) return null;
  const optimistic = normalizeChatMessage({
    id: `temp-${clientMessageId}`,
    conversation_id: conversationId,
    client_message_id: clientMessageId,
    sender: 'owner',
    sender_role: 'owner',
    body,
    delivery_status: 'sending',
    pending: true
  });
  adminChatState.sendingMessageIds.add(clientMessageId);
  adminUpsertMessage(optimistic);
  renderAdminMessageHistory();
  try {
    const result = await adminSupabase('admin.chat.ownerSend', '/rest/v1/rpc/chat_owner_send', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        p_conversation_id: conversationId,
        p_body: body,
        p_client_message_id: clientMessageId
      })
    }, { conversation_id: conversationId, client_message_id: clientMessageId });
    (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(message => adminUpsertMessage(message));
    adminUpsertConversation({ id: conversationId, assistant_mode: 'suggest', status: 'waiting_client', updated_at: new Date().toISOString() });
    if (formElement) formElement.reset();
    if (textarea) textarea.value = '';
    renderAdminMessageHistory();
    await fetchAdminConversations().catch(() => {});
    setAdminMessage(adminText('Сообщение отправлено от имени W1ZZYDEV.', 'Message sent as W1ZZYDEV.'));
    return result;
  } catch (error) {
    console.error('[OWNER SEND ERROR]', {
      operation: 'chat_owner_send',
      code: error?.code || '',
      message: error?.message || String(error),
      details: error?.details || '',
      hint: error?.hint || '',
      conversationId,
      clientMessageId
    });
    adminUpsertMessage({
      ...optimistic,
      delivery_status: 'failed',
      pending: false,
      failed: true,
      error_message: isLocalDevelopment() ? [error?.code, error?.message].filter(Boolean).join(': ') : adminText('Не удалось отправить сообщение.', 'Could not send the message.')
    });
    if (textarea && !textarea.value) textarea.value = body;
    renderAdminMessageHistory();
    setAdminMessage(actionErrorMessage(error), 'error');
    throw error;
  } finally {
    adminChatState.sendingMessageIds.delete(clientMessageId);
  }
}

$('#dialog-reply-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!adminChatState.activeConversationId || adminChatState.sending) return;
  const formData = new FormData(event.currentTarget);
  const body = cleanMultilineValue(formData.get('message'), 2000);
  if (!body) return;
  const button = $('button[type="submit"]', event.currentTarget);
  const textarea = $('textarea[name="message"]', event.currentTarget);
  const clientMessageId = createClientMessageId('owner');
  adminChatState.sending = true;
  if (button) button.disabled = true;
  try {
    await sendOwnerChatMessage({ body, clientMessageId, formElement: event.currentTarget, textarea });
  } catch (error) {
    // sendOwnerChatMessage keeps the failed card in history and restores textarea text.
  } finally {
    adminChatState.sending = false;
    if (button) button.disabled = false;
  }
});

$('#dialog-messages')?.addEventListener('click', async event => {
  const retryButton = event.target.closest('[data-retry-owner-message]');
  const removeButton = event.target.closest('[data-remove-local-message]');
  if (!retryButton && !removeButton) return;
  const messageId = retryButton?.dataset.retryOwnerMessage || removeButton?.dataset.removeLocalMessage;
  const failedMessage = activeAdminMessages().find(message => message.client_message_id === messageId);
  if (!failedMessage) return;
  if (removeButton) {
    const conversationId = adminChatState.activeConversationId;
    const remaining = activeAdminMessages().filter(message => message.client_message_id !== messageId);
    adminChatState.messagesByConversation.set(conversationId, remaining);
    renderAdminMessageHistory();
    return;
  }
  if (!adminChatState.activeConversationId || adminChatState.sending || !failedMessage.body) return;
  retryButton.disabled = true;
  adminChatState.sending = true;
  try {
    await sendOwnerChatMessage({ body: failedMessage.body, clientMessageId: failedMessage.client_message_id });
  } catch (error) {
    // Failure is already rendered on the same local message.
  } finally {
    adminChatState.sending = false;
    retryButton.disabled = false;
  }
});

$('#dialog-actions')?.addEventListener('click', async event => {
  const conversationId = adminChatState.activeConversationId;
  if (!conversationId) return;
  const closeButton = event.target.closest('[data-admin-close-dialog]');
  const reopenButton = event.target.closest('[data-admin-reopen-dialog]');
  const archiveButton = event.target.closest('[data-admin-archive-dialog]');
  const restoreButton = event.target.closest('[data-admin-restore-dialog]');
  const deleteButton = event.target.closest('[data-admin-delete-dialog]');
  const takeButton = event.target.closest('[data-admin-take-dialog]');
  if (!closeButton && !reopenButton && !archiveButton && !restoreButton && !deleteButton && !takeButton) return;
  const button = closeButton || reopenButton || archiveButton || restoreButton || deleteButton || takeButton;
  const operation = takeButton ? 'take' : deleteButton ? 'delete_permanently' : archiveButton ? 'archive' : restoreButton ? 'restore' : closeButton ? 'close' : 'reopen';
  button.disabled = true;
  try {
    if (takeButton) {
      const result = await adminSupabase('admin.chat.takeDialog', '/rest/v1/rpc/chat_owner_take_dialog', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ p_conversation_id: conversationId })
      }, { conversation_id: conversationId });
      (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(conversation => adminUpsertConversation(conversation));
      await fetchAdminConversations();
      renderAdminDialogActions();
      renderAdminMessageHistory();
      setAdminMessage(adminText('Диалог взят владельцем. AI переведён в режим подсказок.', 'Dialog taken by owner. AI switched to suggest mode.'));
      return;
    }
    if (deleteButton) {
      const conversation = activeAdminConversation();
      if (conversation?.status !== 'closed') {
        setAdminMessage(adminText('Перед полным удалением диалог нужно закрыть.', 'Close the dialog before permanent deletion.'), 'error');
        return;
      }
      const confirmation = window.prompt(adminText('Для удаления навсегда введите УДАЛИТЬ', 'Type DELETE to delete permanently'));
      if (confirmation !== 'УДАЛИТЬ' && confirmation !== 'DELETE') return;
      await adminSupabase('admin.chat.deleteConversation', '/rest/v1/rpc/chat_owner_delete_permanently', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ p_conversation_id: conversationId, p_confirmation: confirmation })
      }, { conversation_id: conversationId });
      stopAdminChatSync();
      adminChatState.activeConversationId = null;
      adminChatState.messagesByConversation.delete(conversationId);
      adminChatState.conversations.delete(conversationId);
      adminState.conversations = adminConversationList();
      await fetchAdminConversations();
      renderAdminMessageHistory();
      renderAdminDialogActions();
      setAdminMessage(adminText('Диалог удалён.', 'Dialog deleted.'));
      return;
    }
    if (archiveButton || restoreButton) {
      const rpc = archiveButton ? 'chat_owner_archive' : 'chat_owner_restore';
      const result = await adminSupabase(`admin.chat.${archiveButton ? 'archive' : 'restore'}`, `/rest/v1/rpc/${rpc}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ p_conversation_id: conversationId })
      }, { conversation_id: conversationId });
      (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(conversation => adminUpsertConversation(conversation));
      await fetchAdminConversations();
      renderAdminDialogActions();
      renderAdminMessageHistory();
      setAdminMessage(archiveButton ? adminText('Диалог отправлен в архив.', 'Dialog archived.') : adminText('Диалог восстановлен.', 'Dialog restored.'));
      return;
    }
    const rpc = closeButton ? 'chat_owner_close' : 'chat_owner_reopen';
    const result = await adminSupabase(`admin.chat.${closeButton ? 'close' : 'reopen'}`, `/rest/v1/rpc/${rpc}`, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ p_conversation_id: conversationId, p_client_message_id: createClientMessageId(rpc) })
    }, { conversation_id: conversationId });
    (Array.isArray(result) ? result : [result]).filter(Boolean).forEach(message => adminUpsertMessage(message));
    adminUpsertConversation({
      id: conversationId,
      status: closeButton ? 'closed' : 'in_progress',
      closed_at: closeButton ? new Date().toISOString() : null,
      closed_by: closeButton ? 'owner' : null,
      archived_at: reopenButton ? null : activeAdminConversation()?.archived_at,
      archived_by: reopenButton ? null : activeAdminConversation()?.archived_by,
      updated_at: new Date().toISOString()
    });
    await fetchAdminConversations();
    renderAdminDialogActions();
    renderAdminMessageHistory();
    setAdminMessage(closeButton ? adminText('Диалог закрыт.', 'Dialog closed.') : adminText('Диалог снова открыт.', 'Dialog reopened.'));
  } catch (error) {
    logAdminChatActionError(operation, error, conversationId);
    setAdminMessage(actionErrorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

$('#dialog-actions')?.addEventListener('change', async event => {
  const select = event.target.closest('[data-admin-assistant-mode]');
  const conversationId = adminChatState.activeConversationId;
  if (!select || !conversationId) return;
  select.disabled = true;
  try {
    await adminSupabase('admin.chat.assistantMode', '/rest/v1/rpc/chat_owner_set_assistant_mode', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ p_conversation_id: conversationId, p_mode: select.value })
    }, { conversation_id: conversationId });
    adminUpsertConversation({ id: conversationId, assistant_mode: select.value, updated_at: new Date().toISOString() });
    renderAdminDialogs();
    setAdminMessage(adminText('Режим ИИ обновлён.', 'AI mode updated.'));
  } catch (error) {
    setAdminMessage(describeSupabaseError(error), 'error');
  } finally {
    select.disabled = false;
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && adminChatState.activeConversationId) {
    pollAdminChat({ generation: adminChatState.requestGeneration }).catch(() => {});
    scheduleAdminPolling(adminChatState.requestGeneration, 2000);
  }
});

const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .08 }) : null;
$$('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('visible'));

$$('.stat strong').filter(node => /^\d+$/.test(node.textContent.trim())).forEach(counter => {
  const target = Number(counter.textContent.trim());
  counter.textContent = '0';
  const animate = () => {
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 900, 1);
      counter.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { animate(); counterObserver.disconnect(); }
    }, { threshold: .5 });
    counterObserver.observe(counter);
  } else animate();
});

const canvas = document.createElement('canvas');
canvas.className = 'matrix-canvas';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const cursorCore = document.createElement('div');
cursorCore.className = 'cursor-core';
cursorCore.setAttribute('aria-hidden', 'true');
const cursorRing = document.createElement('div');
cursorRing.className = 'cursor-ring';
cursorRing.setAttribute('aria-hidden', 'true');
document.body.append(cursorCore, cursorRing);

const context = canvas.getContext('2d');
const glyphs = '01{}[]<>/\\_W1ZZYDEV';
let columns = [];
let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = Math.floor(canvasWidth * ratio);
  canvas.height = Math.floor(canvasHeight * ratio);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  columns = Array.from({ length: Math.ceil(canvasWidth / 24) }, (_, index) => ({
    x: index * 24,
    y: Math.random() * canvasHeight,
    speed: .3 + Math.random() * .8,
    size: 11 + Math.random() * 7,
    alpha: .08 + Math.random() * .34
  }));
}

let lastMatrixFrame = 0;
function drawMatrix(now = 0) {
  if (now - lastMatrixFrame < 34) {
    requestAnimationFrame(drawMatrix);
    return;
  }
  lastMatrixFrame = now;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  columns.forEach(column => {
    context.font = `${column.size}px Consolas, monospace`;
    context.fillStyle = `rgba(245,245,245,${column.alpha})`;
    context.shadowColor = 'rgba(99,230,186,.65)';
    context.shadowBlur = 8;
    context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], column.x, column.y);
    column.y += column.speed * 9;
    if (column.y > canvasHeight + 60) {
      column.y = -40;
      column.speed = .3 + Math.random() * .8;
      column.alpha = .08 + Math.random() * .34;
    }
  });
  requestAnimationFrame(drawMatrix);
}

resizeCanvas();
drawMatrix();
window.addEventListener('resize', resizeCanvas);

const trailSymbols = ['0', '1', '{', '}', '<', '>', '/', 'W', 'D'];
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let ringX = cursorX;
let ringY = cursorY;
let lastTrail = 0;

function moveCursor() {
  ringX += (cursorX - ringX) * .26;
  ringY += (cursorY - ringY) * .26;
  cursorCore.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;
  cursorRing.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
  requestAnimationFrame(moveCursor);
}

function spawnTrail(x, y) {
  const symbol = document.createElement('span');
  symbol.className = 'cursor-code';
  symbol.textContent = trailSymbols[Math.floor(Math.random() * trailSymbols.length)];
  symbol.style.left = `${x + Math.random() * 20 - 10}px`;
  symbol.style.top = `${y + Math.random() * 20 - 10}px`;
  symbol.style.setProperty('--trail-x', `${Math.random() * 46 - 23}px`);
  document.body.appendChild(symbol);
  window.setTimeout(() => symbol.remove(), 920);
}

window.addEventListener('pointermove', event => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  document.body.style.setProperty('--cursor-x', `${cursorX}px`);
  document.body.style.setProperty('--cursor-y', `${cursorY}px`);
  const now = performance.now();
  if (now - lastTrail > 58 && window.matchMedia('(pointer: fine)').matches) {
    spawnTrail(cursorX, cursorY);
    lastTrail = now;
  }
});

document.addEventListener('pointerover', event => {
  if (event.target.closest('a,button,input,select,textarea,label,[role="link"]')) document.body.classList.add('is-hovering');
});
document.addEventListener('pointerout', event => {
  if (event.target.closest('a,button,input,select,textarea,label,[role="link"]')) document.body.classList.remove('is-hovering');
});
moveCursor();
