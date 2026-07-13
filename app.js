const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const resetHorizontalScroll = () => {
  if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
};
window.addEventListener('scroll', resetHorizontalScroll, { passive: true });
window.addEventListener('resize', resetHorizontalScroll);
window.addEventListener('orientationchange', () => window.setTimeout(resetHorizontalScroll, 120));
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
if (navKey === 'home') {
  const homeAnchors = {
    services: '#services-overview',
    projects: '#featured-projects',
    reviews: '#reviews-preview',
    contact: '#project-request'
  };
  Object.entries(homeAnchors).forEach(([key, href]) => {
    $$(`[data-nav="${key}"]`).forEach(link => { link.href = href; });
  });
  $$('.footer a[href="/services/"]').forEach(link => { link.href = '#services-overview'; });
  $$('.footer a[href="/projects/"]').forEach(link => { link.href = '#featured-projects'; });
  $$('.footer a[href="/reviews/"]').forEach(link => { link.href = '#reviews-preview'; });
  $$('.footer a[href="/contact/"]').forEach(link => { link.href = '#project-request'; });
}
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
    <div><strong data-ru="Навигация" data-en="Navigation"></strong><a href="/services/" data-ru="Услуги" data-en="Services"></a><a href="/projects/" data-ru="Проекты" data-en="Projects"></a><a href="/reviews/" data-ru="Отзывы" data-en="Reviews"></a><a href="/contact/" data-ru="Контакты" data-en="Contact"></a></div>
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
  const trustSection = $('.why-section') || $$('main > .section.dark-band')[1];
  if (trustSection && !$('.process-section')) {
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
  if (technologySection && !$('.reviews-preview')) {
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
async function submitLeadToSupabase(payload) {
  const submissionKey = payload.submissionKey || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const rows = await supabaseRequest('/rest/v1/leads?select=id,conversation_id,created_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: payload.name,
      contact: payload.contact,
      project_type: payload.projectType,
      description: payload.description,
      source: payload.source || 'website',
      submission_key: submissionKey
    })
  });
  return Array.isArray(rows) ? rows[0] : null;
}

const form = $('#project-form');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const status = $('#form-status');
  const button = $('button[type="submit"]', form);
  if (hasSpamSignal(form)) {
    setFormStatus(status, lang === 'ru' ? 'Заявка принята. Если нужно, отправьте сообщение удобным способом связи.' : 'Request accepted. If needed, send the message via your preferred channel.');
    form.reset();
    return;
  }
  if (isRateLimited('w1zzydev-project-form-last')) {
    setFormStatus(status, lang === 'ru' ? 'Заявка уже подготовлена. Подождите немного перед повторной отправкой.' : 'The request is already prepared. Please wait a moment before sending again.', 'error');
    return;
  }
  const name = cleanFormValue(data.get('name'), 80);
  const contact = cleanFormValue(data.get('contact'), 160);
  const type = cleanFormValue(data.get('type'), 80);
  const budget = cleanFormValue(data.get('budget'), 80);
  const task = cleanMultilineValue(data.get('message'), 2000);
  const message = `Новая заявка W1ZZYDEV\n\nИмя: ${name}\nКонтакт: ${contact}\nТип проекта: ${type}\nБюджет: ${budget}\n\nСообщение:\n${task}`;
  const encoded = encodeURIComponent(message);
  const channel = data.get('channel');
  if (button) button.disabled = true;
  const submissionKey = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await submitLeadToSupabase({ name, contact, projectType: type, description: task, source: `contact:${channel || 'unknown'}`, website: cleanFormValue(data.get('website'), 120), submissionKey });
    form.reset();
    setFormStatus(status, lang === 'ru' ? 'Спасибо. Заявка создана, мы свяжемся с вами по указанному способу связи.' : 'Thank you. The request was created; we will contact you through the provided channel.');
    if (button) button.disabled = false;
    return;
  } catch (error) {
    setFormStatus(status, lang === 'ru' ? 'Не удалось создать заявку на сервере. Используем выбранный способ связи.' : 'Could not create the server request. Using the selected contact channel.', 'error');
  }
  navigator.clipboard?.writeText(message).catch(() => {});
  setFormStatus(status, lang === 'ru' ? 'Готовим заявку и открываем выбранный способ связи...' : 'Preparing the request and opening your selected channel...');
  if (channel === 'telegram') {
    location.assign(`https://t.me/W1zzY228?text=${encoded}`);
  } else if (channel === 'whatsapp') {
    location.assign(`https://wa.me/message/ICHYJGLJUYAWI1?text=${encoded}`);
  } else if (channel === 'instagram') {
    location.assign('https://www.instagram.com/w1zzydev?igsh=Nnd5ZWNtMmNqeGI1&utm_source=qr');
  } else {
    location.href = `mailto:w1zzydev.studio@gmail.com?subject=${encodeURIComponent(`W1ZZYDEV — ${type}`)}&body=${encoded}`;
  }
  setFormStatus(status, channel === 'email'
    ? (lang === 'ru' ? 'Письмо подготовлено. Если почта не открылась, выберите Telegram, WhatsApp или Instagram.' : 'Email prepared. If it did not open, choose Telegram, WhatsApp or Instagram.')
    : (lang === 'ru' ? 'Заявка подготовлена и скопирована. Вставьте её в открывшийся чат и отправьте.' : 'Request prepared and copied. Paste it into the opened chat and send.'));
  window.setTimeout(() => { if (button) button.disabled = false; }, 1800);
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
    setFormStatus(status, created
      ? (lang === 'ru' ? 'Спасибо. Заявка создана, мы свяжемся с вами и откроем приватный диалог после подтверждения контакта.' : 'Thank you. The request was created; we will contact you and open a private conversation after contact confirmation.')
      : (lang === 'ru' ? 'Спасибо. Заявка сформирована, текст скопирован — можно продолжить диалог удобным способом без перехода со страницы.' : 'Thank you. The request is prepared and copied, so you can continue the conversation through any convenient channel without leaving the page.'));
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

const featuredReviewFallbacks = [
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

async function renderReviews(container, limit = Infinity, fallbackReviews = []) {
  if (!container) return;
  try {
    const publishedReviews = await getReviews();
    const reviews = (publishedReviews.length ? publishedReviews : fallbackReviews).slice(0, limit);
    container.dataset.count = String(reviews.length);
    container.dataset.source = publishedReviews.length ? 'database' : (fallbackReviews.length ? 'fallback' : 'empty');
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
    if (fallbackReviews.length) {
      const reviews = fallbackReviews.slice(0, limit);
      container.dataset.count = String(reviews.length);
      container.dataset.source = 'fallback';
      container.replaceChildren(...reviews.map(createReviewCard));
      return;
    }
    const failed = document.createElement('div');
    failed.className = 'reviews-empty';
    failed.textContent = lang === 'ru' ? 'Система отзывов пока не подключена.' : 'The review system is not connected yet.';
    container.dataset.count = '0';
    container.dataset.source = 'error';
    container.replaceChildren(failed);
  }
}

const reviewsList = $('#reviews-list');
const homeReviews = $('#home-reviews');
renderReviews(reviewsList);
renderReviews(homeReviews, 6, featuredReviewFallbacks);

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
const adminState = { selectedConversationId: null, loading: false, error: '' };

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
  if (/permission denied|row-level security|JWT|not authorized|401|403/i.test(text)) {
    return adminText('Ошибка доступа: проверьте OWNER в admin_profiles и RLS-политики.', 'Access error: check OWNER in admin_profiles and RLS policies.');
  }
  return adminText('Ошибка Supabase: проверьте схему, политики и подключение проекта.', 'Supabase error: check the schema, policies, and project connection.');
}

function adminToken() {
  const token = sessionStorage.getItem(moderatorTokenKey);
  if (!token) throw new Error('Moderator is not authorized');
  return token;
}

async function supabaseAdmin(pathname, options = {}) {
  return supabaseRequest(pathname, options, adminToken());
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
    const [reviews, leads, conversations, tickets, clients, activity] = await Promise.all([
      getAllReviews(),
      supabaseAdmin('/rest/v1/leads?select=id,name,contact,project_type,description,source,status,conversation_id,client_id,created_at,updated_at&order=created_at.desc'),
      supabaseAdmin('/rest/v1/conversations?select=id,client_id,lead_id,support_ticket_id,subject,unread_for_owner,created_at,updated_at&order=updated_at.desc'),
      supabaseAdmin('/rest/v1/support_tickets?select=id,client_id,conversation_id,subject,project,priority,description,status,created_at,updated_at&order=created_at.desc'),
      supabaseAdmin('/rest/v1/clients?select=id,name,contact,email,created_at,updated_at&order=created_at.desc'),
      supabaseAdmin('/rest/v1/admin_activity?select=id,action,entity_type,entity_id,created_at&order=created_at.desc&limit=20').catch(() => [])
    ]);
    adminState.reviews = reviews;
    adminState.leads = leads || [];
    adminState.conversations = conversations || [];
    adminState.tickets = tickets || [];
    adminState.clients = clients || [];
    adminState.activity = activity || [];

    renderAdminDashboard();
    renderAdminLeads();
    renderAdminDialogs();
    renderAdminTickets();
    renderAdminClients();
    renderAdminSecurity();

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
  const counts = {
    'new-leads': adminState.leads.filter(item => item.status === 'new').length,
    'unread-dialogs': adminState.conversations.filter(item => Number(item.unread_for_owner || 0) > 0).length,
    'open-tickets': adminState.tickets.filter(item => item.status === 'open').length,
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
      <dl><dt>Тип проекта</dt><dd>${escapeHtml(lead.project_type)}</dd><dt>Источник</dt><dd>${escapeHtml(lead.source)}</dd><dt>Дата</dt><dd>${new Date(lead.created_at).toLocaleString('ru-RU')}</dd><dt>Диалог</dt><dd>${lead.conversation_id ? escapeHtml(lead.conversation_id) : 'создаётся триггером'}</dd></dl>
      <div class="admin-actions"><select data-lead-status="${lead.id}">${Object.entries(leadStatusLabels).map(([value,label]) => `<option value="${value}" ${lead.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
    </article>
  `).join('') || adminEmpty(adminText('Заявок пока нет.', 'There are no requests yet.'));
}

function renderAdminDialogs() {
  const container = $('#admin-dialogs');
  if (!container) return;
  container.innerHTML = adminState.conversations.map(dialog => {
    const client = adminState.clients.find(item => item.id === dialog.client_id);
    return `<article class="admin-card dialog-item ${adminState.selectedConversationId === dialog.id ? 'active' : ''}" data-dialog-id="${dialog.id}">
      <div class="admin-card-head"><div><strong>${escapeHtml(dialog.subject || 'Диалог')}</strong><small>${escapeHtml(client?.name || 'Клиент')}</small></div><span class="moderation-badge">${Number(dialog.unread_for_owner || 0)}</span></div>
      <p>${dialog.lead_id ? 'Связан с заявкой' : dialog.support_ticket_id ? 'Связан с тикетом' : 'Общий диалог'}</p>
    </article>`;
  }).join('') || adminEmpty(adminText('Диалогов пока нет.', 'There are no dialogs yet.'));
}

async function loadDialogMessages(conversationId) {
  adminState.selectedConversationId = conversationId;
  renderAdminDialogs();
  const title = $('#dialog-title');
  const messagesContainer = $('#dialog-messages');
  if (title) title.textContent = `Диалог ${conversationId.slice(0, 8)}`;
  if (messagesContainer) messagesContainer.innerHTML = adminEmpty(adminText('Загрузка сообщений...', 'Loading messages...'));
  const messages = await supabaseAdmin(`/rest/v1/messages?select=id,sender,body,created_at,read_by_owner_at&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc`);
  if (!messagesContainer) return;
  messagesContainer.innerHTML = messages.map(message => `
    <article class="message-bubble ${message.sender === 'owner' ? 'owner' : 'client'}">
      <strong>${message.sender === 'owner' ? 'W1ZZYDEV' : 'Клиент'}</strong>
      <p>${escapeHtml(message.body)}</p>
      <small>${new Date(message.created_at).toLocaleString('ru-RU')}</small>
    </article>
  `).join('') || adminEmpty(adminText('Сообщений пока нет.', 'There are no messages yet.'));
  await supabaseAdmin(`/rest/v1/conversations?id=eq.${encodeURIComponent(conversationId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ unread_for_owner: 0, updated_at: new Date().toISOString() })
  }).catch(() => {});
}

function renderAdminTickets() {
  const container = $('#admin-tickets');
  if (!container) return;
  container.innerHTML = adminState.tickets.map(ticket => {
    const client = adminState.clients.find(item => item.id === ticket.client_id);
    return `<article class="admin-card">
      <div class="admin-card-head"><div><strong>${escapeHtml(ticket.subject)}</strong><small>${escapeHtml(client?.name || 'Клиент')}</small></div><span class="moderation-badge">${ticketStatusLabels[ticket.status] || escapeHtml(ticket.status)}</span></div>
      <p>${escapeHtml(ticket.description)}</p>
      <dl><dt>Проект</dt><dd>${escapeHtml(ticket.project || 'не указан')}</dd><dt>Приоритет</dt><dd>${escapeHtml(ticket.priority)}</dd><dt>Дата</dt><dd>${new Date(ticket.created_at).toLocaleString('ru-RU')}</dd></dl>
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
      <dl><dt>Заявки</dt><dd>${leads.length}</dd><dt>Проекты</dt><dd>${leads.map(item => escapeHtml(item.project_type)).join(', ') || 'нет'}</dd><dt>Обращения</dt><dd>${tickets.length}</dd><dt>История переписки</dt><dd>${dialogs.length} диалогов</dd></dl>
    </article>`;
  }).join('') || adminEmpty(adminText('Клиентов пока нет.', 'There are no clients yet.'));
}

function renderAdminSecurity() {
  const container = $('#admin-security');
  if (!container) return;
  container.innerHTML = `
    <article class="admin-card"><strong>Supabase Auth</strong><p>Панель использует существующий Supabase JWT. Service role key не используется во frontend.</p></article>
    <article class="admin-card"><strong>RLS</strong><p>Примените файл <code>supabase/admin-panel-schema.sql</code>. OWNER задаётся строкой в <code>admin_profiles</code>.</p></article>
    ${adminState.activity.map(item => `<article class="admin-card"><strong>${escapeHtml(item.action)}</strong><small>${new Date(item.created_at).toLocaleString('ru-RU')}</small></article>`).join('')}
  `;
}

function openModerationPanel() {
  moderationLogin?.classList.add('hidden');
  moderationPanel?.classList.remove('hidden');
  renderModeration().catch(() => {
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

$$('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.admin-tab').forEach(item => item.classList.remove('active'));
  $$('.admin-view').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  $(`[data-admin-view="${tab.dataset.adminTab}"]`)?.classList.add('active');
}));

$('#lead-status-filter')?.addEventListener('change', renderAdminLeads);

$('#admin-leads')?.addEventListener('change', async event => {
  const select = event.target.closest('select[data-lead-status]');
  if (!select) return;
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
  const card = event.target.closest('[data-dialog-id]');
  if (card) loadDialogMessages(card.dataset.dialogId).catch(error => {
    if (moderationMessage) moderationMessage.textContent = lang === 'ru' ? 'Не удалось открыть диалог.' : 'Could not open dialog.';
  });
});

$('#dialog-reply-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!adminState.selectedConversationId) return;
  const formData = new FormData(event.currentTarget);
  const body = cleanMultilineValue(formData.get('message'), 2000);
  if (!body) return;
  const button = $('button[type="submit"]', event.currentTarget);
  if (button) button.disabled = true;
  try {
    await supabaseAdmin('/rest/v1/messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ conversation_id: adminState.selectedConversationId, body })
    });
    event.currentTarget.reset();
    await loadDialogMessages(adminState.selectedConversationId);
    setAdminMessage(adminText('Сообщение отправлено от имени W1ZZYDEV.', 'Message sent as W1ZZYDEV.'));
  } catch (error) {
    setAdminMessage(describeSupabaseError(error), 'error');
  } finally {
    if (button) button.disabled = false;
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
