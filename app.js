const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const path = location.pathname.replace(/\/index\.html$/, '/');
const navKey = path.includes('/services') ? 'services' : path.includes('/projects') ? 'projects' : path.includes('/pricing') ? 'pricing' : path.includes('/about') ? 'about' : path.includes('/reviews') ? 'reviews' : path.includes('/contact') ? 'contact' : 'home';
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
  if (hero) {
    const banner = document.createElement('section');
    banner.className = 'brand-banner container reveal';
    banner.setAttribute('aria-label', 'W1ZZYDEV banner');
    banner.innerHTML = '<img src="/assets/w1zzydev-banner.png" alt="W1ZZYDEV">';
    hero.before(banner);
  }
  const trustSection = $$('main > .section.dark-band')[1];
  if (trustSection) {
    const processSection = document.createElement('section');
    processSection.className = 'section process-section';
    processSection.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow" data-ru="Как мы работаем" data-en="How we work"></p><h2 data-ru="Прозрачный процесс. Предсказуемый результат." data-en="A transparent process. A predictable result."></h2></div><p data-ru="Каждый проект проходит одинаковый путь — от идеи до запуска." data-en="Every project follows the same path — from idea to launch."></p></div><div class="process-grid">
      <article class="process-card reveal"><span>01</span><h3 data-ru="Исследование" data-en="Research"></h3><p data-ru="Обсуждаем цели бизнеса, аудиторию и задачи." data-en="We discuss business goals, audience and objectives."></p></article>
      <article class="process-card reveal"><span>02</span><h3 data-ru="Проектирование" data-en="Architecture"></h3><p data-ru="Продумываем структуру и пользовательский путь." data-en="We plan the structure and user journey."></p></article>
      <article class="process-card reveal"><span>03</span><h3 data-ru="Дизайн" data-en="Design"></h3><p data-ru="Создаём визуальную систему проекта." data-en="We create the project's visual system."></p></article>
      <article class="process-card reveal"><span>04</span><h3 data-ru="Разработка" data-en="Development"></h3><p data-ru="Собираем продукт на современном стеке." data-en="We build the product with a modern stack."></p></article>
      <article class="process-card reveal"><span>05</span><h3 data-ru="Тестирование" data-en="Testing"></h3><p data-ru="Проверяем адаптивность и производительность." data-en="We test responsiveness and performance."></p></article>
      <article class="process-card reveal"><span>06</span><h3 data-ru="Запуск и поддержка" data-en="Launch & support"></h3><p data-ru="Публикуем проект и помогаем после релиза." data-en="We publish the project and support it after release."></p></article>
    </div></div>`;
    const founderSection = document.createElement('section');
    founderSection.className = 'section dark-band founder-section';
    founderSection.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow" data-ru="Основатель" data-en="Founder"></p><h2 data-ru="Кто стоит за W1ZZYDEV" data-en="Who stands behind W1ZZYDEV"></h2></div></div><article class="founder-card reveal"><div class="founder-avatar"><img src="/assets/favicon.png" alt="Максим П."><span>MP</span></div><div><span class="tag">Founder & Web Developer</span><h3 data-ru="Максим П." data-en="Maxim P."></h3><p data-ru="W1ZZYDEV — независимая веб-студия, которая помогает бизнесу и личным брендам создавать современные сайты, интерфейсы и веб-приложения. Мы делаем акцент на дизайне, удобстве и реальной пользе для клиента." data-en="W1ZZYDEV is an independent web studio helping businesses and personal brands create modern websites, interfaces and web applications. We focus on design, usability and real value for the client."></p></div></article></div>`;
    trustSection.before(processSection, founderSection);
    trustSection.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow" data-ru="Почему выбирают W1ZZYDEV" data-en="Why choose W1ZZYDEV"></p><h2 data-ru="Система работы, которой можно доверять." data-en="A workflow you can trust."></h2></div></div><div class="grid-3 trust-cards">
      <article class="card reason-card"><span class="card-index">01</span><h3 data-ru="Индивидуальный подход" data-en="Individual approach"></h3><p data-ru="Решение строится вокруг бизнеса, аудитории и задачи." data-en="The solution is built around the business, audience and goal."></p></article>
      <article class="card reason-card"><span class="card-index">02</span><h3 data-ru="Быстрый запуск" data-en="Fast launch"></h3><p data-ru="Понятные этапы и фокус на действительно важном." data-en="Clear stages and focus on what truly matters."></p></article>
      <article class="card reason-card"><span class="card-index">03</span><h3 data-ru="Современные технологии" data-en="Modern technology"></h3><p data-ru="Надёжный стек без лишней технической сложности." data-en="A reliable stack without unnecessary complexity."></p></article>
      <article class="card reason-card"><span class="card-index">04</span><h3 data-ru="Адаптивность" data-en="Responsiveness"></h3><p data-ru="Интерфейс продуман для телефона, планшета и компьютера." data-en="The interface is designed for mobile, tablet and desktop."></p></article>
      <article class="card reason-card"><span class="card-index">05</span><h3 data-ru="Поддержка после запуска" data-en="Post-launch support"></h3><p data-ru="Помогаем развивать продукт и решать новые задачи." data-en="We help evolve the product and solve new challenges."></p></article>
      <article class="card reason-card"><span class="card-index">06</span><h3 data-ru="SEO-готовность" data-en="SEO-ready"></h3><p data-ru="Закладываем метаданные, структуру и техническую основу." data-en="We include metadata, structure and a technical foundation."></p></article>
    </div></div>`;
  }
  const technologySection = $$('.tech-cloud')[0]?.closest('section');
  if (technologySection) {
    const reviewSection = document.createElement('section');
    reviewSection.className = 'section reviews-preview';
    reviewSection.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow" data-ru="Отзывы клиентов" data-en="Client reviews"></p><h2 data-ru="Реальные впечатления о совместной работе." data-en="Real experiences from working together."></h2></div><p data-ru="Здесь отображаются только отзывы, оставленные посетителями сайта." data-en="Only reviews submitted by website visitors are shown here."></p></div><div class="reviews-grid" id="home-reviews"></div><div class="card-actions"><a class="button" href="/reviews/" data-ru="Все отзывы и форма →" data-en="All reviews and form →"></a></div></div>`;
    technologySection.before(reviewSection);
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
  cloud.innerHTML = technologies.map(([name,file,url]) => `<a class="tech-logo" data-tech="${name}" href="${url}" target="_blank" rel="noreferrer" aria-label="${name}"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${file}" alt=""><b>${name}</b><small>↗</small></a>`).join('');
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

const serviceSlugs = ['landing','corporate','commerce','web-app','ui-ux','support'];
$$('.service-card').forEach((card, index) => {
  card.id = serviceSlugs[index] || `service-${index + 1}`;
  makeCardInteractive(card, `/contact/?service=${serviceSlugs[index] || 'custom'}`, `${$('h3', card)?.textContent || 'Услуга'} — обсудить проект`);
});
if (navKey === 'home') {
  $$('.grid-4 .reason-card').forEach((card, index) => makeCardInteractive(card, `/services/#${['landing','corporate','web-app','ui-ux'][index]}`, `${$('h3', card)?.textContent || 'Услуга'} — открыть услугу`));
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
  const requestedIndex = { landing:0, start:0, corporate:1, business:1, commerce:2, 'web-app':3, custom:3, 'ui-ux':4, support:5 }[requested];
  if (typeSelect && !Array.from(typeSelect.options).some(option => option.value === 'support')) {
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
  menu.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('a', panel).forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const destination = link.getAttribute('href');
    panel.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
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
function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  $$('[data-ru][data-en]').forEach(element => { element.textContent = element.dataset[lang]; });
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

const form = $('#project-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `Новая заявка W1ZZYDEV\n\nИмя: ${data.get('name')}\nКонтакт: ${data.get('contact')}\nТип проекта: ${data.get('type')}\nБюджет: ${data.get('budget')}\n\nСообщение:\n${data.get('message')}`;
  const encoded = encodeURIComponent(message);
  const channel = data.get('channel');
  const status = $('#form-status');
  navigator.clipboard?.writeText(message).catch(() => {});
  if (channel === 'telegram') {
    location.assign(`https://t.me/W1zzY228?text=${encoded}`);
  } else if (channel === 'whatsapp') {
    location.assign(`https://wa.me/message/ICHYJGLJUYAWI1?text=${encoded}`);
  } else {
    location.href = `mailto:w1zzydev.studio@gmail.com?subject=${encodeURIComponent(`W1ZZYDEV — ${data.get('type')}`)}&body=${encoded}`;
  }
  if (status) {
    status.textContent = channel === 'email'
      ? (lang === 'ru' ? 'Письмо подготовлено. Если почта не открылась, выберите Telegram или WhatsApp.' : 'Email prepared. If it did not open, choose Telegram or WhatsApp.')
      : (lang === 'ru' ? 'Заявка подготовлена и скопирована. Вставьте её в открывшийся чат и отправьте.' : 'Request prepared and copied. Paste it into the opened chat and send.');
    status.classList.add('visible');
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
    throw new Error(details || `Supabase request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  const content = await response.text();
  return content ? JSON.parse(content) : null;
}

async function signInModerator(email, password) {
  const config = await getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error(result.error_description || result.msg || 'Authorization failed');
  return result.access_token;
}

const passwordResetForm = $('#password-reset-form');
passwordResetForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(passwordResetForm);
  const password = String(data.get('password') || '');
  const confirmation = String(data.get('confirmation') || '');
  const status = $('#password-reset-status');
  const button = $('button[type="submit"]', passwordResetForm);
  if (password.length < 8 || password !== confirmation) {
    status.textContent = lang === 'ru' ? 'Пароли должны совпадать и содержать минимум 8 символов.' : 'Passwords must match and contain at least 8 characters.';
    status.classList.add('visible');
    return;
  }
  const token = new URLSearchParams(location.hash.slice(1)).get('access_token');
  if (!token) {
    status.textContent = lang === 'ru' ? 'Ссылка восстановления недействительна или уже истекла.' : 'The recovery link is invalid or has expired.';
    status.classList.add('visible');
    return;
  }
  button.disabled = true;
  try {
    const config = await getSupabaseConfig();
    const response = await fetch(`${config.url}/auth/v1/user`, {
      method: 'PUT',
      headers: { apikey: config.anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error(await response.text());
    passwordResetForm.reset();
    status.textContent = lang === 'ru' ? 'Пароль изменён. Теперь можно войти в панель модерации.' : 'Password changed. You can now sign in to the moderation panel.';
    status.classList.add('visible');
    const link = $('#password-reset-login');
    link?.classList.remove('hidden');
  } catch (error) {
    status.textContent = lang === 'ru' ? 'Не удалось изменить пароль. Запросите новую ссылку.' : 'Could not change the password. Request a new recovery link.';
    status.classList.add('visible');
  } finally {
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
    return rows.map(normalizeSupabaseReview);
  }
  const database = await openReviewsDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('reviews', 'readonly');
    const request = transaction.objectStore('reviews').getAll();
    request.onsuccess = () => resolve(request.result.filter(review => review.status === 'published' || (review.status == null && review.published === true)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
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
    company.textContent = review.company;
    identity.appendChild(company);
  }
  const stars = document.createElement('span');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', `${review.rating} / 5`);
  stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  top.append(avatar, identity, stars);
  const text = document.createElement('p');
  text.textContent = review.text;
  const date = document.createElement('time');
  date.dateTime = review.createdAt;
  date.textContent = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.createdAt));
  card.append(top, text, date);
  return card;
}

async function renderReviews(container, limit = Infinity) {
  if (!container) return;
  try {
    const reviews = (await getReviews()).slice(0, limit);
    container.replaceChildren();
    if (!reviews.length) {
      const empty = document.createElement('div');
      empty.className = 'reviews-empty';
      empty.dataset.ru = 'Пока нет опубликованных отзывов. Первый отзыв можно оставить прямо на сайте.';
      empty.dataset.en = 'There are no published reviews yet. The first review can be submitted directly on the website.';
      empty.textContent = empty.dataset[lang];
      container.appendChild(empty);
      return;
    }
    reviews.forEach(review => container.appendChild(createReviewCard(review)));
  } catch (error) {
    const failed = document.createElement('div');
    failed.className = 'reviews-empty';
    failed.textContent = lang === 'ru' ? 'Система отзывов пока не подключена.' : 'The review system is not connected yet.';
    container.replaceChildren(failed);
  }
}

const reviewsList = $('#reviews-list');
const homeReviews = $('#home-reviews');
renderReviews(reviewsList);
renderReviews(homeReviews, 6);

const reviewForm = $('#review-form');
reviewForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!reviewForm.reportValidity()) return;
  const data = new FormData(reviewForm);
  const status = $('#review-status');
  const button = $('button[type="submit"]', reviewForm);
  button.disabled = true;
  try {
    await saveReview({
      name: String(data.get('name')).trim(),
      company: String(data.get('company') || '').trim(),
      rating: Number(data.get('rating')),
      text: String(data.get('text')).trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      published: false
    });
    reviewForm.reset();
    await renderReviews(reviewsList);
    if (status) {
      status.textContent = lang === 'ru' ? 'Спасибо! Отзыв отправлен на модерацию. После одобрения он появится на странице.' : 'Thank you! Your review was sent for moderation and will appear after approval.';
      status.classList.add('visible');
    }
  } catch (error) {
    if (status) {
      status.textContent = lang === 'ru' ? 'Не удалось отправить отзыв. Попробуйте ещё раз чуть позже.' : 'Could not submit the review. Please try again later.';
      status.classList.add('visible');
    }
  } finally {
    button.disabled = false;
  }
});

const moderationLogin = $('#moderation-login');
const moderationPanel = $('#moderation-panel');
const moderationList = $('#moderation-list');
const moderationMessage = $('#moderation-message');
const moderationLogout = $('#moderation-logout');
const moderatorTokenKey = 'w1zzydev-moderator-token';

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
  const reviews = await getAllReviews();
  moderationList.replaceChildren();
  const counters = { pending: 0, published: 0, rejected: 0 };
  reviews.forEach(review => { counters[review.status || (review.published ? 'published' : 'pending')] += 1; });
  $$('[data-moderation-count]').forEach(node => { node.textContent = String(counters[node.dataset.moderationCount] || 0); });
  if (!reviews.length) {
    const empty = document.createElement('div');
    empty.className = 'reviews-empty';
    empty.textContent = lang === 'ru' ? 'Отзывов для модерации пока нет.' : 'There are no reviews to moderate yet.';
    moderationList.appendChild(empty);
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
}

function openModerationPanel() {
  moderationLogin?.classList.add('hidden');
  moderationPanel?.classList.remove('hidden');
  renderModeration().catch(() => {
    sessionStorage.removeItem(moderatorTokenKey);
    moderationPanel?.classList.add('hidden');
    moderationLogin?.classList.remove('hidden');
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Сессия истекла или Supabase ещё не подключён.' : 'The session expired or Supabase is not connected yet.';
  });
}

if (moderationLogin && sessionStorage.getItem(moderatorTokenKey)) openModerationPanel();
moderationLogin?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(moderationLogin);
  const button = $('button[type="submit"]', moderationLogin);
  button.disabled = true;
  try {
    const token = useLocalReviewDatabase
      ? 'local-test-token'
      : await signInModerator(String(data.get('email')).trim(), String(data.get('password')));
    sessionStorage.setItem(moderatorTokenKey, token);
    if (moderationMessage) moderationMessage.textContent = '';
    openModerationPanel();
  } catch (error) {
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Не удалось войти. Проверьте email, пароль и подключение Supabase.' : 'Could not sign in. Check your email, password, and Supabase connection.';
  } finally {
    button.disabled = false;
  }
});

moderationLogout?.addEventListener('click', () => {
  sessionStorage.removeItem(moderatorTokenKey);
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
