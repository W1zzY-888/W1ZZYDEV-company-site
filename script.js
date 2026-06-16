const translations = {
  ru: {
    navServices: "Услуги",
    navCases: "Кейсы",
    navProcess: "Процесс",
    navContact: "Контакт",
    statusText: "Принимаем новые проекты - 2026",
    heroTitle: "Разработка цифровых систем, которые выглядят как бренд будущего.",
    heroText: "W1ZZYDEV создает сайты, интерфейсы и автоматизацию с сильной визуальной подачей, точной ручной сборкой и фундаментом для большой компании.",
    badgeOne: "3 проекта в работе",
    badgeTwo: "2 слота свободны",
    heroCta: "Обсудить проект",
    heroSecondary: "Смотреть услуги",
    statOne: "идей в разработке",
    statTwo: "цифровой режим",
    statThree: "две версии сайта",
    terminalOne: "✓ Архитектура сайта собрана",
    terminalTwo: "✓ Визуальный стиль закреплен",
    terminalThree: "✓ Анимации и адаптив проверены",
    terminalFour: "✓ GitHub Pages готов к запуску",
    qualityOne: "Ручная верстка",
    qualityTwo: "Быстрый интерфейс",
    qualityThree: "Чистая структура",
    toastText: "Проект усилен брендом W1ZZYDEV",
    servicesEyebrow: "Направления",
    servicesTitle: "Не визитка. Экосистема, которую можно расширять годами.",
    serviceOneTitle: "Сайты и платформы",
    serviceOneText: "Премиальные главные страницы, корпоративные сайты, лендинги и будущие разделы под продукты.",
    serviceTwoTitle: "Автоматизация процессов",
    serviceTwoText: "Инструменты, формы, заявки, CRM-логика и сценарии, которые экономят время и усиливают бизнес.",
    serviceThreeTitle: "Интерфейсы продукта",
    serviceThreeText: "Темные технологичные интерфейсы, панели управления, дизайн-системы и адаптивные экраны.",
    casesEyebrow: "Кейсы скоро",
    casesTitle: "Здесь будут работы, которые докажут масштаб W1ZZYDEV.",
    casesText: "Раздел готов под сайты, сервисы, автоматизации и визуальные кейсы с результатами, скриншотами и ссылками.",
    caseOne: "Сайты",
    caseTwo: "Сервисы",
    caseThree: "Автоматизация",
    caseFour: "Брендинг",
    processEyebrow: "Процесс",
    processTitle: "Каждый новый блок должен усиливать ощущение большой компании.",
    stepOneTitle: "Образ",
    stepOneText: "Темная технологичная сцена, зеленый брендовый свет, код и ощущение будущего.",
    stepTwoTitle: "Система",
    stepTwoText: "Главная, услуги, кейсы, процесс, основатель, контакты и будущие отдельные страницы.",
    stepThreeTitle: "Рост",
    stepThreeText: "Добавляем портфолио, SEO, аналитику, заявки, домен и новые продуктовые направления.",
    founderEyebrow: "Основатель",
    founderTitle: "Починков Максим Сергеевич",
    founderText: "W1ZZYDEV собирается как технологичная компания с амбицией вырасти в крупный бренд: сильный сайт, понятная подача и место для будущих продуктов.",
    contactCta: "Связаться"
  },
  en: {
    navServices: "Services",
    navCases: "Cases",
    navProcess: "Process",
    navContact: "Contact",
    statusText: "Accepting new projects - 2026",
    heroTitle: "Digital systems that look like a brand from the future.",
    heroText: "W1ZZYDEV builds websites, interfaces and automation with strong visual direction, precise hand-built execution and a foundation for a large company.",
    badgeOne: "3 projects active",
    badgeTwo: "2 slots open",
    heroCta: "Discuss project",
    heroSecondary: "View services",
    statOne: "ideas in progress",
    statTwo: "digital mode",
    statThree: "site versions",
    terminalOne: "✓ Site architecture assembled",
    terminalTwo: "✓ Visual system locked",
    terminalThree: "✓ Animation and responsive checks passed",
    terminalFour: "✓ GitHub Pages ready for launch",
    qualityOne: "Hand-built layout",
    qualityTwo: "Fast interface",
    qualityThree: "Clean structure",
    toastText: "Project amplified by W1ZZYDEV brand",
    servicesEyebrow: "Directions",
    servicesTitle: "Not a business card. An ecosystem that can grow for years.",
    serviceOneTitle: "Websites and platforms",
    serviceOneText: "Premium homepages, corporate websites, landing pages and future sections for products.",
    serviceTwoTitle: "Process automation",
    serviceTwoText: "Tools, forms, requests, CRM logic and scenarios that save time and strengthen the business.",
    serviceThreeTitle: "Product interfaces",
    serviceThreeText: "Dark technological interfaces, dashboards, design systems and responsive screens.",
    casesEyebrow: "Cases soon",
    casesTitle: "This is where work will prove the scale of W1ZZYDEV.",
    casesText: "The section is ready for websites, services, automations and visual case studies with results, screenshots and links.",
    caseOne: "Websites",
    caseTwo: "Services",
    caseThree: "Automation",
    caseFour: "Branding",
    processEyebrow: "Process",
    processTitle: "Every new block should increase the feeling of a large company.",
    stepOneTitle: "Image",
    stepOneText: "A dark technological scene, green brand light, code and the feeling of the future.",
    stepTwoTitle: "System",
    stepTwoText: "Home, services, cases, process, founder, contacts and future separate pages.",
    stepThreeTitle: "Growth",
    stepThreeText: "Add portfolio, SEO, analytics, requests, domain and new product directions.",
    founderEyebrow: "Founder",
    founderTitle: "Maksim Sergeevich Pochinkov",
    founderText: "W1ZZYDEV is being built as a technology company with the ambition to grow into a major brand: a strong site, clear presentation and room for future products.",
    contactCta: "Contact"
  }
};

const buttons = document.querySelectorAll("[data-lang]");
const nodes = document.querySelectorAll("[data-i18n]");

function setLanguage(lang) {
  const dictionary = translations[lang] || translations.ru;
  document.documentElement.lang = lang;

  nodes.forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
    }
  });

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  localStorage.setItem("w1zzydev-language", lang);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

setLanguage(localStorage.getItem("w1zzydev-language") || "ru");

const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");
const glyphs = "01{}[]<>/\\_W1ZZYDEV";
let columns = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.ceil(width / 24);
  columns = Array.from({ length: count }, (_, index) => ({
    x: index * 24,
    y: Math.random() * height,
    speed: 0.35 + Math.random() * 0.9,
    size: 11 + Math.random() * 7,
    alpha: 0.1 + Math.random() * 0.36
  }));
}

function drawMatrix() {
  ctx.clearRect(0, 0, width, height);
  ctx.font = "14px Consolas, monospace";

  columns.forEach((column) => {
    const symbol = glyphs[Math.floor(Math.random() * glyphs.length)];
    ctx.font = `${column.size}px Consolas, monospace`;
    ctx.fillStyle = `rgba(245, 245, 245, ${column.alpha})`;
    ctx.shadowColor = "rgba(102, 242, 189, 0.65)";
    ctx.shadowBlur = 8;
    ctx.fillText(symbol, column.x, column.y);
    column.y += column.speed * 9;

    if (column.y > height + 60) {
      column.y = -40;
      column.speed = 0.35 + Math.random() * 0.9;
      column.alpha = 0.1 + Math.random() * 0.36;
    }
  });

  requestAnimationFrame(drawMatrix);
}

resizeCanvas();
drawMatrix();
window.addEventListener("resize", resizeCanvas);

const cursorCore = document.querySelector(".cursor-core");
const cursorRing = document.querySelector(".cursor-ring");
const trailSymbols = ["0", "1", "{", "}", "<", ">", "/", "W", "D"];
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let ringX = cursorX;
let ringY = cursorY;
let lastTrail = 0;

function moveCursor() {
  ringX += (cursorX - ringX) * 0.16;
  ringY += (cursorY - ringY) * 0.16;

  cursorCore.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(moveCursor);
}

function spawnTrail(x, y) {
  const node = document.createElement("span");
  node.className = "cursor-code";
  node.textContent = trailSymbols[Math.floor(Math.random() * trailSymbols.length)];
  node.style.left = `${x + (Math.random() * 20 - 10)}px`;
  node.style.top = `${y + (Math.random() * 20 - 10)}px`;
  node.style.setProperty("--trail-x", `${Math.random() * 46 - 23}px`);
  document.body.appendChild(node);
  window.setTimeout(() => node.remove(), 920);
}

window.addEventListener("pointermove", (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  document.body.style.setProperty("--cursor-x", `${cursorX}px`);
  document.body.style.setProperty("--cursor-y", `${cursorY}px`);

  const now = performance.now();
  if (now - lastTrail > 38 && window.matchMedia("(pointer: fine)").matches) {
    spawnTrail(cursorX, cursorY);
    lastTrail = now;
  }
});

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("mouseenter", () => document.body.classList.add("is-hovering"));
  element.addEventListener("mouseleave", () => document.body.classList.remove("is-hovering"));
});

moveCursor();
