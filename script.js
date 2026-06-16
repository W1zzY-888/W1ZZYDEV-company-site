const translations = {
  ru: {
    navServices: "Услуги",
    navCases: "Кейсы",
    navProcess: "Процесс",
    navContact: "Контакт",
    heroEyebrow: "Главная компания Починкова Максима Сергеевича",
    heroTitle: "Строим цифровые продукты, которые выглядят крупно с первого экрана.",
    heroText: "W1ZZYDEV создает сайты, интерфейсы, автоматизацию и будущие AI-системы для бизнеса, которому нужен не шаблон, а сильный технологичный образ.",
    heroCta: "Начать проект",
    heroSecondary: "Смотреть направление",
    metricOne: "единый стиль бренда",
    metricTwo: "двуязычный запуск RU/EN",
    metricThree: "место для кейсов и роста",
    servicesEyebrow: "Что строим",
    servicesTitle: "Сайт компании как витрина силы, а не просто страница в интернете.",
    serviceOneTitle: "Корпоративные сайты",
    serviceOneText: "Главные страницы, лендинги, портфолио и масштабируемые разделы под будущие услуги.",
    serviceTwoTitle: "Интерфейсы и дизайн-системы",
    serviceTwoText: "Темные технологичные интерфейсы, адаптивные сетки, аккуратная анимация и брендовый визуальный язык.",
    serviceThreeTitle: "Автоматизация бизнеса",
    serviceThreeText: "Формы, заявки, внутренние панели и процессы, которые можно развивать вместе с компанией.",
    casesEyebrow: "Будущие кейсы",
    casesTitle: "Раздел готов для выполненных работ, когда вы начнете добавлять проекты.",
    casesText: "Сюда можно встроить карточки сайтов, сервисов, CRM, автоматизаций и AI-инструментов: с результатами, скриншотами и ссылками.",
    caseOne: "Сайты",
    caseTwo: "Приложения",
    caseThree: "Автоматизация",
    caseFour: "AI-функции",
    processEyebrow: "Как работаем",
    processTitle: "От сильной первой версии к большой компании.",
    stepOneTitle: "Фиксируем образ",
    stepOneText: "Берем баннер и логотип как основу: темный фон, зеленое свечение, кодовый характер.",
    stepTwoTitle: "Собираем структуру",
    stepTwoText: "Главный экран, услуги, кейсы, процесс, основатель, контакт и будущие страницы.",
    stepThreeTitle: "Расширяем систему",
    stepThreeText: "Добавляем настоящие работы, формы, аналитику, SEO и новые языковые версии.",
    founderEyebrow: "Основатель",
    founderTitle: "Починков Максим Сергеевич",
    founderText: "W1ZZYDEV создается как большая технологичная компания: с сильным брендом, понятной подачей и местом для будущих продуктов.",
    contactCta: "Связаться"
  },
  en: {
    navServices: "Services",
    navCases: "Cases",
    navProcess: "Process",
    navContact: "Contact",
    heroEyebrow: "Main company of Maksim Sergeevich Pochinkov",
    heroTitle: "We build digital products that feel powerful from the first screen.",
    heroText: "W1ZZYDEV creates websites, interfaces, automation and future AI systems for businesses that need a strong technological identity, not a template.",
    heroCta: "Start a project",
    heroSecondary: "View direction",
    metricOne: "unified brand style",
    metricTwo: "bilingual RU/EN launch",
    metricThree: "space for cases and growth",
    servicesEyebrow: "What we build",
    servicesTitle: "A company website as a display of strength, not just a page online.",
    serviceOneTitle: "Corporate websites",
    serviceOneText: "Homepages, landing pages, portfolios and scalable sections for future services.",
    serviceTwoTitle: "Interfaces and design systems",
    serviceTwoText: "Dark technological interfaces, responsive grids, refined animation and a branded visual language.",
    serviceThreeTitle: "Business automation",
    serviceThreeText: "Forms, requests, internal dashboards and processes that can grow with the company.",
    casesEyebrow: "Future cases",
    casesTitle: "This section is ready for completed work when you start adding projects.",
    casesText: "It can hold cards for websites, services, CRM systems, automations and AI tools with results, screenshots and links.",
    caseOne: "Websites",
    caseTwo: "Apps",
    caseThree: "Automation",
    caseFour: "AI features",
    processEyebrow: "How we work",
    processTitle: "From a strong first version to a large company.",
    stepOneTitle: "Lock the image",
    stepOneText: "We use the banner and logo as the base: dark background, green glow and code-driven character.",
    stepTwoTitle: "Build the structure",
    stepTwoText: "Hero, services, cases, process, founder, contact and future pages.",
    stepThreeTitle: "Expand the system",
    stepThreeText: "Add real work, forms, analytics, SEO and new language versions.",
    founderEyebrow: "Founder",
    founderTitle: "Maksim Sergeevich Pochinkov",
    founderText: "W1ZZYDEV is being created as a large technology company with a strong brand, clear presentation and room for future products.",
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
