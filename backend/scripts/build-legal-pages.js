import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const version = '2026-07-31';
const effectiveDateRu = '31 июля 2026';
const effectiveDateEn = 'July 31, 2026';
const email = 'w1zzydev.studio@gmail.com';
const controllerRu = 'Оператор персональных данных: физическое лицо Починков Максим, осуществляющее деятельность под обозначением W1ZZYDEV';
const controllerEn = 'Personal Data Controller: Maxim Pochinkov, an individual operating under the W1ZZYDEV name.';
const contactRu = `По вопросам обработки персональных данных, отзыва согласия, уточнения или удаления данных можно обратиться по адресу: ${email}.`;
const contactEn = `For questions concerning personal data processing, withdrawal of consent, correction, or deletion, contact: ${email}.`;

const docs = [
  ['/legal/privacy/', 'Политика обработки персональных данных', 'Privacy Policy', 'Полное описание обработки персональных данных на сайте.', 'Full description of personal data processing on the site.'],
  ['/legal/personal-data-consent/', 'Согласие на обработку персональных данных', 'Personal Data Consent', 'Текст согласия для форм, чата, кабинета, поддержки и отзывов.', 'Consent text for forms, chat, account area, support, and reviews.'],
  ['/legal/cookies/', 'Политика cookie и аналогичных технологий', 'Cookie and Similar Technologies Policy', 'Категории хранения данных и управление выбором.', 'Storage categories and preference management.'],
  ['/legal/terms/', 'Пользовательское соглашение', 'Terms of Use', 'Правила использования сайта и пользовательских функций.', 'Rules for using the site and its user-facing features.'],
  ['/legal/data-request/', 'Запрос по персональным данным', 'Personal Data Request', 'Форма обращения субъекта персональных данных.', 'Personal data request form.'],
  ['/legal/#operator-contacts', 'Контакты оператора', 'Operator Contacts', 'Контакты для вопросов по сайту и персональным данным.', 'Contacts for website and personal data questions.']
];

const servicesRu = 'Фактически обнаружены: GitHub Pages для публикации статического сайта, Supabase для базы данных, авторизации, RPC, realtime и Storage, jsDelivr CDN для Supabase SDK и иконок технологий, Telegram/WhatsApp/Instagram как внешние каналы связи, email через mailto-ссылки.';
const servicesEn = 'Actually detected: GitHub Pages for static site publishing, Supabase for database, authentication, RPC, realtime, and Storage, jsDelivr CDN for the Supabase SDK and technology icons, Telegram/WhatsApp/Instagram as external contact channels, and email through mailto links.';
const transferRu = 'При использовании отдельных внешних сервисов обработка или техническая передача данных может осуществляться с использованием инфраструктуры, расположение которой зависит от соответствующего поставщика. Актуальный перечень фактически используемых сервисов указан в настоящей Политике.';
const transferEn = 'Where external services are used, data processing or technical transmission may involve infrastructure whose location depends on the relevant provider. The current list of services actually used is specified in this Policy.';

const shell = ({ titleRu, titleEn, descriptionRu, descriptionEn, path, body }) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${titleRu} — W1ZZYDEV</title>
  <meta name="description" content="${descriptionRu}">
  <meta name="robots" content="${path.includes('/security/') ? 'noindex,follow' : 'index,follow'}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()">
  <link rel="canonical" href="https://w1zzydev.com${path}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="stylesheet" href="/styles.css?v=legal-20260731">
</head>
<body class="legal-page" data-title-ru="${titleRu} — W1ZZYDEV" data-title-en="${titleEn} — W1ZZYDEV" data-description-ru="${descriptionRu}" data-description-en="${descriptionEn}">
<div class="site">
  <header class="header"><div class="container header-inner">
    <a class="brand" href="/"><span class="brand-mark">&lt;W1D&gt;</span>W1ZZYDEV</a>
    <nav class="desktop-nav" aria-label="Legal navigation"><a class="nav-link" href="/" data-ru="Главная" data-en="Home">Главная</a><a class="nav-link active" href="/legal/" data-ru="Юридический центр" data-en="Legal Center">Юридический центр</a><a class="nav-link" href="/contact/" data-ru="Контакты" data-en="Contact">Контакты</a></nav>
    <div class="header-tools"><button class="lang" type="button">EN</button><button class="menu-toggle" type="button" aria-label="Открыть меню" data-aria-label-ru="Открыть меню" data-aria-label-en="Open menu" aria-expanded="false"><i></i></button></div>
  </div></header>
  <nav class="mobile-panel" aria-label="Mobile legal navigation"><a class="nav-link" href="/" data-ru="Главная" data-en="Home">Главная</a><a class="nav-link active" href="/legal/" data-ru="Юридический центр" data-en="Legal Center">Юридический центр</a><a class="nav-link" href="/contact/" data-ru="Контакты" data-en="Contact">Контакты</a></nav>
  <main>${body}</main>
  <footer class="footer"><div class="container"><div class="footer-bottom"><span>© 2026 W1ZZYDEV</span><span data-ru="Юридические документы" data-en="Legal documents">Юридические документы</span></div></div></footer>
</div>
<script src="/assets/js/legal-config.js?v=20260731"></script>
<script src="/assets/js/data-api/types.js?v=20260729"></script><script src="/assets/js/data-api/validation.js?v=20260729"></script><script src="/assets/js/data-api/router.js?v=20260729"></script><script src="/assets/js/data-api/ru-adapter.js?v=20260729"></script><script src="/assets/js/data-api/international-adapter.js?v=20260729"></script><script src="/assets/js/data-api/client.js?v=20260729"></script>
<script src="/app.js?v=legal-20260731"></script>
</body></html>`;

const hero = (crumb, h1Ru, h1En, leadRu, leadEn) => `<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="/legal/">LEGAL</a> / ${crumb}</div><p class="eyebrow" data-ru="Редакция ${effectiveDateRu}" data-en="Effective ${effectiveDateEn}">Редакция ${effectiveDateRu}</p><h1 data-ru="${h1Ru}" data-en="${h1En}">${h1Ru}</h1><p class="lead" data-ru="${leadRu}" data-en="${leadEn}">${leadRu}</p></div></section>`;
const card = (hRu, hEn, pRu, pEn) => `<article class="legal-card"><h2 data-ru="${hRu}" data-en="${hEn}">${hRu}</h2><p data-ru="${pRu}" data-en="${pEn}">${pRu}</p></article>`;
const section = content => `<section class="section"><div class="container legal-list">${content}</div></section>`;

const legalIndex = shell({
  path: '/legal/',
  titleRu: 'Юридический центр',
  titleEn: 'Legal Center',
  descriptionRu: 'Единый юридический центр W1ZZYDEV: персональные данные, согласие, cookie, условия и запросы субъекта.',
  descriptionEn: 'W1ZZYDEV legal center: privacy, consent, cookies, terms, and personal data requests.',
  body: hero('CENTER', 'Юридический центр W1ZZYDEV', 'W1ZZYDEV Legal Center', 'Здесь собраны документы, которые описывают работу сайта, форм, чата, кабинета, отзывов, cookie и обращений по персональным данным.', 'This center brings together documents describing the site, forms, chat, account area, reviews, cookies, and personal data requests.') + `<section class="section"><div class="container legal-doc-grid">${docs.map(([href, ru, en, purposeRu, purposeEn]) => `<article class="legal-doc-card"><span class="tag">v${version}</span><h2 data-ru="${ru}" data-en="${en}">${ru}</h2><p data-ru="${purposeRu}" data-en="${purposeEn}">${purposeRu}</p><dl><dt data-ru="Дата редакции" data-en="Effective date">Дата редакции</dt><dd data-ru="${effectiveDateRu}" data-en="${effectiveDateEn}">${effectiveDateRu}</dd><dt data-ru="Версия" data-en="Version">Версия</dt><dd>${version}</dd></dl><a class="button small" href="${href}" data-ru="Открыть" data-en="Open">Открыть</a></article>`).join('')}</div></section>` + section(card('Контакты оператора', 'Operator contacts', `${controllerRu}. ${contactRu}`, `${controllerEn} ${contactEn}`))
});

const privacy = shell({
  path: '/legal/privacy/',
  titleRu: 'Политика обработки персональных данных',
  titleEn: 'Privacy Policy',
  descriptionRu: 'Политика обработки персональных данных W1ZZYDEV: цели, данные, права субъекта, сроки, внешние сервисы и меры защиты.',
  descriptionEn: 'W1ZZYDEV Privacy Policy: purposes, data, subject rights, retention, external services, and safeguards.',
  body: hero('PRIVACY', 'Политика обработки персональных данных', 'Privacy Policy', 'Документ описывает только процессы, подтвержденные кодом сайта: заявки, чат, поддержка, кабинет, отзывы, вложения, запросы субъекта и уведомления владельцу.', 'This document describes only processes confirmed by the site code: requests, chat, support, account area, reviews, attachments, personal data requests, and owner notifications.') + section([
    card('1. Общие положения', '1. General provisions', 'Политика объясняет, какие данные обрабатываются при использовании сайта W1ZZYDEV и его функций. Она не является заявлением о полной юридической гарантии.', 'This Policy explains what data is processed when using the W1ZZYDEV site and its features. It is not a statement of complete legal guarantee.'),
    card('2. Сведения об операторе', '2. Operator information', `${controllerRu}. ${contactRu}`, `${controllerEn} ${contactEn}`),
    card('3. Категории субъектов', '3. Data subjects', 'Посетители сайта, отправители заявок, пользователи чата и поддержки, клиенты кабинета, авторы отзывов, модераторы и лица, направляющие запросы по персональным данным.', 'Site visitors, request senders, chat and support users, account users, review authors, moderators, and people submitting personal data requests.'),
    card('4. Персональные данные', '4. Personal data', 'Имя, email, телефон или username, выбранный канал связи, страна обращения, тип проекта, бюджет, сообщения, отзывы, компания в отзыве, оценка, вложения, технические идентификаторы сессий, статусы обращений и auth-сессии Supabase.', 'Name, email, phone or username, selected contact channel, request country, project type, budget, messages, reviews, review company, rating, attachments, technical session identifiers, request statuses, and Supabase auth sessions.'),
    card('5. Цели обработки', '5. Processing purposes', 'Ответ на заявки, ведение переписки, техническая поддержка, доступ к кабинету, модерация и публикация отзывов при отдельном разрешении, обработка запросов субъекта, защита форм от злоупотреблений и уведомления владельцу.', 'Responding to requests, correspondence, technical support, account access, review moderation and publication with separate permission, processing personal data requests, protecting forms from abuse, and owner notifications.'),
    card('6. Правовые основания', '6. Legal bases', 'Согласие пользователя, действия до возможного договора, выполнение запроса пользователя и законный интерес в защите сайта от злоупотреблений, где применимо.', 'User consent, steps before a possible contract, fulfilling a user request, and legitimate interest in protecting the site from abuse where applicable.'),
    card('7. Способы обработки', '7. Processing operations', 'Сбор, запись, систематизация, хранение, уточнение, использование, передача обработчикам, ограничение, удаление и уничтожение в электронных системах.', 'Collection, recording, organization, storage, correction, use, transfer to processors, restriction, deletion, and destruction in electronic systems.'),
    card('8. Сроки обработки и хранения', '8. Retention', 'Данные хранятся столько, сколько необходимо для ответа на обращение, поддержки, доступа к кабинету, защиты от злоупотреблений или выполнения обязательных требований. Точные сроки должен утвердить владелец.', 'Data is kept as long as needed to respond, provide support, maintain account access, prevent abuse, or meet mandatory requirements. Exact retention periods must be approved by the owner.'),
    card('9. Прекращение обработки', '9. Ending processing', 'Обработка прекращается при достижении цели, отзыве согласия, законном требовании субъекта или отсутствии необходимости дальнейшего хранения.', 'Processing ends when the purpose is achieved, consent is withdrawn, a lawful subject request is fulfilled, or further storage is no longer needed.'),
    card('10. Передача обработчикам и третьим лицам', '10. Processors and third parties', servicesRu, servicesEn),
    card('11. Возможная трансграничная передача', '11. Possible cross-border transfer', transferRu, transferEn),
    card('12. Права субъекта', '12. Data subject rights', 'Субъект может запросить сведения об обработке, уточнение, удаление, ограничение обработки, отзыв согласия или направить иное обращение через форму запроса.', 'A data subject may request processing information, correction, deletion, restriction, withdrawal of consent, or another request through the request form.'),
    card('13. Отзыв согласия', '13. Withdrawal of consent', 'Согласие можно отозвать через форму запроса или контакт сайта. Отзыв не влияет на законность обработки до момента отзыва.', 'Consent can be withdrawn through the request form or site contact. Withdrawal does not affect processing that was lawful before withdrawal.'),
    card('14. Меры защиты', '14. Safeguards', 'Используются ограничения доступа, Supabase Auth и RLS по локальным SQL-файлам, проверка форм, ограничения длины, honeypot, signed URL для вложений, безопасный вывод пользовательского текста и отсутствие service role key во frontend.', 'The site uses access controls, Supabase Auth and RLS according to local SQL files, form checks, length limits, honeypot, signed URLs for attachments, safe rendering of user text, and no service role key in the frontend.'),
    card('15. Обращения к оператору', '15. Requests to the operator', `${contactRu} Оператор может запросить разумное подтверждение личности безопасным способом.`, `${contactEn} The controller may request reasonable identity confirmation through a safe method.`),
    card('16. Изменение политики', '16. Policy changes', 'Политика может обновляться при изменении сайта, форм, внешних сервисов или требований владельца.', 'This Policy may be updated when the site, forms, external services, or owner requirements change.'),
    card('17. Версия и дата', '17. Version and effective date', `Версия ${version}, действует с ${effectiveDateRu}.`, `Version ${version}, effective ${effectiveDateEn}.`)
  ].join(''))
});

const consent = shell({
  path: '/legal/personal-data-consent/',
  titleRu: 'Согласие на обработку персональных данных',
  titleEn: 'Personal Data Consent',
  descriptionRu: 'Согласие на обработку персональных данных для форм, чата, поддержки, кабинета и отзывов W1ZZYDEV.',
  descriptionEn: 'Personal data consent for W1ZZYDEV forms, chat, support, account area, and reviews.',
  body: hero('CONSENT', 'Согласие на обработку персональных данных', 'Personal Data Consent', 'Формы сайта используют отдельный неотмеченный чекбокс согласия. Для публикации отзыва используется отдельное разрешение.', 'Site forms use a separate unchecked consent checkbox. Review publication uses a separate permission.') + section([
    card('Оператор', 'Operator', `${controllerRu}. ${contactRu}`, `${controllerEn} ${contactEn}`),
    card('Категории данных', 'Data categories', 'Имя, контакт, email, телефон или username, страна обращения, тема, сообщение, отзыв, компания, оценка, вложения, технические идентификаторы сессии и auth-сессии.', 'Name, contact, email, phone or username, request country, subject, message, review, company, rating, attachments, technical session identifiers, and auth sessions.'),
    card('Цели', 'Purposes', 'Ответ на обращение, создание заявки, чат, поддержка, кабинет, модерация отзывов, обработка запроса субъекта и защита сайта от злоупотреблений.', 'Responding to requests, creating a request, chat, support, account area, review moderation, processing personal data requests, and protecting the site from abuse.'),
    card('Действия с данными', 'Processing operations', 'Сбор, запись, хранение, использование, уточнение, передача обработчикам, ограничение, удаление и уничтожение.', 'Collection, recording, storage, use, correction, transfer to processors, restriction, deletion, and destruction.'),
    card('Срок и отзыв', 'Term and withdrawal', 'Согласие действует до достижения цели, истечения срока хранения или отзыва. Отзыв можно направить через форму запроса или контакт сайта.', 'Consent remains valid until the purpose is achieved, retention expires, or consent is withdrawn. Withdrawal can be submitted through the request form or site contact.'),
    card('Передача обработчикам', 'Processors', `${servicesRu} ${transferRu}`, `${servicesEn} ${transferEn}`),
    card('Отдельное согласие на отзыв', 'Separate review publication consent', 'Публикация отзыва возможна только при отдельном разрешении автора отзыва после модерации.', 'A review may be published only with the review author’s separate permission after moderation.')
  ].join(''))
});

const cookies = shell({
  path: '/legal/cookies/',
  titleRu: 'Политика cookie и аналогичных технологий',
  titleEn: 'Cookie and Similar Technologies Policy',
  descriptionRu: 'Политика W1ZZYDEV о cookie, localStorage, sessionStorage и настройках хранения.',
  descriptionEn: 'W1ZZYDEV policy for cookies, localStorage, sessionStorage, and storage preferences.',
  body: hero('COOKIES', 'Политика cookie и аналогичных технологий', 'Cookie and Similar Technologies Policy', 'Сайт использует browser storage для необходимых функций и пользовательских настроек. Аналитические и маркетинговые инструменты аудитом не обнаружены.', 'The site uses browser storage for essential features and user preferences. Analytics and marketing tools were not found during the audit.') + `<section class="section"><div class="container legal-list">
  ${card('1. Что используется', '1. What is used', 'Используются localStorage и sessionStorage. Собственные рекламные cookie, Google Analytics, Яндекс Метрика, Meta Pixel и TikTok Pixel не обнаружены.', 'localStorage and sessionStorage are used. First-party advertising cookies, Google Analytics, Yandex Metrica, Meta Pixel, and TikTok Pixel were not found.')}
  ${card('2. Для чего используется', '2. Purpose', 'Хранение нужно для выбора согласия, защиты форм, активной сессии чата, авторизации, языка и темы.', 'Storage is used for consent choice, form protection, active chat session, authentication, language, and theme.')}
  ${card('3. Категории', '3. Categories', 'Необходимые включены всегда. Функциональные сохраняют язык и тему между посещениями. Аналитические и маркетинговые сейчас не используются.', 'Essential storage is always enabled. Functional storage saves language and theme between visits. Analytics and marketing are not currently used.')}
  <article class="legal-card"><h2 data-ru="4. Реально обнаруженные технологии" data-en="4. Actually detected technologies">4. Реально обнаруженные технологии</h2><table><thead><tr><th data-ru="Технология" data-en="Technology">Технология</th><th data-ru="Назначение" data-en="Purpose">Назначение</th><th data-ru="Категория" data-en="Category">Категория</th><th data-ru="Срок" data-en="Retention">Срок</th><th data-ru="Поставщик" data-en="Provider">Поставщик</th></tr></thead><tbody>
    <tr><td><code>localStorage:w1zzydev-cookie-consent-v1</code></td><td data-ru="Сохранение выбора по категориям." data-en="Stores category preferences.">Сохранение выбора по категориям.</td><td data-ru="Необходимые" data-en="Essential">Необходимые</td><td data-ru="До очистки браузера или смены версии" data-en="Until browser cleanup or version change">До очистки браузера или смены версии</td><td>W1ZZYDEV</td></tr>
    <tr><td><code>localStorage/sessionStorage:w1zzy-lang</code></td><td data-ru="Язык интерфейса." data-en="Interface language.">Язык интерфейса.</td><td data-ru="Функциональные" data-en="Functional">Функциональные</td><td data-ru="localStorage до очистки; sessionStorage до закрытия вкладки" data-en="localStorage until cleanup; sessionStorage until tab close">localStorage до очистки; sessionStorage до закрытия вкладки</td><td>W1ZZYDEV</td></tr>
    <tr><td><code>localStorage/sessionStorage:w1zzydev-theme-v2</code></td><td data-ru="Тема интерфейса." data-en="Interface theme.">Тема интерфейса.</td><td data-ru="Функциональные" data-en="Functional">Функциональные</td><td data-ru="localStorage до очистки; sessionStorage до закрытия вкладки" data-en="localStorage until cleanup; sessionStorage until tab close">localStorage до очистки; sessionStorage до закрытия вкладки</td><td>W1ZZYDEV</td></tr>
    <tr><td><code>sessionStorage:w1zzydev-*-form-last</code></td><td data-ru="Защита активной отправки формы от случайного повтора." data-en="Protects active form submission from accidental repeat.">Защита активной отправки формы от случайного повтора.</td><td data-ru="Необходимые" data-en="Essential">Необходимые</td><td data-ru="До закрытия вкладки" data-en="Until tab close">До закрытия вкладки</td><td>W1ZZYDEV</td></tr>
    <tr><td><code>sessionStorage:w1zzydev-universal-chat-v1</code></td><td data-ru="Активная сессия чата." data-en="Active chat session.">Активная сессия чата.</td><td data-ru="Необходимые" data-en="Essential">Необходимые</td><td data-ru="До закрытия вкладки или завершения чата" data-en="Until tab close or chat end">До закрытия вкладки или завершения чата</td><td>W1ZZYDEV / Supabase</td></tr>
    <tr><td><code>sessionStorage:w1zzydev-moderator-token</code></td><td data-ru="Активная сессия закрытой панели." data-en="Active restricted panel session.">Активная сессия закрытой панели.</td><td data-ru="Необходимые" data-en="Essential">Необходимые</td><td data-ru="До закрытия вкладки или выхода" data-en="Until tab close or logout">До закрытия вкладки или выхода</td><td>W1ZZYDEV / Supabase</td></tr>
    <tr><td><code>Supabase Auth browser storage</code></td><td data-ru="Auth-сессия кабинета после входа." data-en="Account auth session after sign-in.">Auth-сессия кабинета после входа.</td><td data-ru="Необходимые" data-en="Essential">Необходимые</td><td data-ru="По настройкам Supabase Auth или до выхода" data-en="According to Supabase Auth settings or until logout">По настройкам Supabase Auth или до выхода</td><td>Supabase</td></tr>
  </tbody></table></article>
  ${card('5. Как изменить выбор', '5. How to change preferences', 'Откройте ссылку «Настройки cookie» в футере или кнопку ниже. Можно сохранить выбранное, отклонить необязательные или принять все доступные категории.', 'Open the “Cookie Settings” link in the footer or the button below. You can save selected preferences, reject optional storage, or accept all available categories.')}
  <article class="legal-card"><p><button class="button primary" type="button" onclick="window.W1ZZYDEV_OPEN_COOKIE_SETTINGS?.({userInitiated:true})" data-ru="Открыть настройки cookie" data-en="Open cookie settings">Открыть настройки cookie</button></p></article>
  ${card('6. Как удалить данные браузера', '6. How to delete browser data', 'Удалить cookie и storage можно в настройках браузера в разделе конфиденциальности, cookie, данных сайтов или хранилища сайтов.', 'Cookies and storage can be deleted in browser settings under privacy, cookies, site data, or site storage.')}
  ${card('7. Версия и дата', '7. Version and date', `Версия ${version}, действует с ${effectiveDateRu}.`, `Version ${version}, effective ${effectiveDateEn}.`)}
</div></section>`
});

const terms = shell({
  path: '/legal/terms/',
  titleRu: 'Пользовательское соглашение',
  titleEn: 'Terms of Use',
  descriptionRu: 'Условия использования сайта W1ZZYDEV.',
  descriptionEn: 'Terms of use for the W1ZZYDEV site.',
  body: hero('TERMS', 'Пользовательское соглашение', 'Terms of Use', 'Соглашение регулирует использование публичного сайта и не заменяет отдельное согласие на обработку персональных данных.', 'These Terms govern use of the public site and do not replace separate personal data consent.') + section([
    card('Использование сайта', 'Use of the site', 'Пользователь может просматривать страницы, отправлять заявки, сообщения, отзывы и запросы по персональным данным.', 'A user may view pages and submit requests, messages, reviews, and personal data requests.'),
    card('Ограничения', 'Restrictions', 'Запрещены спам, вредоносные действия, попытки обхода авторизации, загрузка запрещенных файлов и передача чужих персональных данных без основания.', 'Spam, malicious activity, attempts to bypass authorization, prohibited file uploads, and submitting another person’s personal data without a basis are not allowed.'),
    card('Внешние ссылки', 'External links', 'Сайт содержит ссылки на Telegram, WhatsApp, Instagram, email и внешние страницы проектов. Их условия определяются соответствующими сервисами.', 'The site links to Telegram, WhatsApp, Instagram, email, and external project pages. Their terms are determined by those services.'),
    card('Работа сайта', 'Site operation', 'W1ZZYDEV принимает разумные технические меры, но не заявляет, что сайт неуязвим или всегда работает без сбоев.', 'W1ZZYDEV takes reasonable technical measures but does not claim that the site is invulnerable or always uninterrupted.')
  ].join(''))
});

const dataRequest = shell({
  path: '/legal/data-request/',
  titleRu: 'Запрос по персональным данным',
  titleEn: 'Personal Data Request',
  descriptionRu: 'Форма запроса субъекта персональных данных W1ZZYDEV.',
  descriptionEn: 'W1ZZYDEV personal data request form.',
  body: hero('DATA REQUEST', 'Запрос по персональным данным', 'Personal Data Request', 'Через эту форму можно направить обращение по обработке персональных данных. Паспорт через публичную форму не запрашивается.', 'Use this form to submit a personal data request. A passport is not requested through the public form.') + `<section class="section"><div class="container contact-layout"><article class="legal-card"><h2 data-ru="Порядок" data-en="Process">Порядок</h2><p data-ru="Оператор может запросить разумное подтверждение личности безопасным способом. Автоматическое удаление по одному публичному нажатию не выполняется." data-en="The operator may request reasonable identity confirmation through a safe method. Automatic deletion by a single public click is not performed.">Оператор может запросить разумное подтверждение личности безопасным способом. Автоматическое удаление по одному публичному нажатию не выполняется.</p></article><form class="form" id="data-request-form"><div class="form-grid"><div class="field"><label data-ru="Имя" data-en="Name">Имя</label><input name="subject_name" maxlength="80" required data-placeholder-ru="Как к вам обращаться" data-placeholder-en="Your name"></div><div class="field"><label>Email</label><input type="email" name="reply_contact" maxlength="160" required data-placeholder-ru="name@example.com" data-placeholder-en="name@example.com"></div><div class="field full"><label data-ru="Тип запроса" data-en="Request type">Тип запроса</label><select name="request_type" required><option value="access" data-ru="Получить сведения об обработке" data-en="Request processing information">Получить сведения об обработке</option><option value="rectification" data-ru="Уточнить данные" data-en="Correct personal data">Уточнить данные</option><option value="erasure" data-ru="Удалить данные" data-en="Delete personal data">Удалить данные</option><option value="restriction" data-ru="Ограничить обработку" data-en="Restrict processing">Ограничить обработку</option><option value="withdraw_consent" data-ru="Отозвать согласие" data-en="Withdraw consent">Отозвать согласие</option><option value="other" data-ru="Иное обращение" data-en="Other request">Иное обращение</option></select></div><div class="field full"><label data-ru="Описание" data-en="Description">Описание</label><textarea name="description" maxlength="2000" required data-placeholder-ru="Опишите запрос без паспортных данных" data-placeholder-en="Describe the request without passport data"></textarea></div></div><button class="button primary" type="submit" data-ru="Отправить запрос" data-en="Submit request">Отправить запрос</button><p class="form-status" id="data-request-status" role="status" aria-live="polite"></p></form></div></section>`
});

const securityRedirect = shell({
  path: '/legal/security/',
  titleRu: 'Меры защиты',
  titleEn: 'Safeguards',
  descriptionRu: 'Раздел мер защиты объединен с Политикой обработки персональных данных.',
  descriptionEn: 'Safeguards are included in the Privacy Policy.',
  body: hero('SECURITY', 'Меры защиты описаны в Политике', 'Safeguards are described in the Privacy Policy', 'Публичная страница безопасности не раскрывает внутреннюю архитектуру. Перейдите к разделу «Меры защиты» в Политике обработки персональных данных.', 'The public security page does not disclose internal architecture. Go to the “Safeguards” section in the Privacy Policy.') + section(`<article class="legal-card"><a class="button primary" href="/legal/privacy/" data-ru="Открыть Политику" data-en="Open Privacy Policy">Открыть Политику</a></article>`)
});

const pages = new Map([
  ['legal/index.html', legalIndex],
  ['legal/privacy/index.html', privacy],
  ['legal/personal-data-consent/index.html', consent],
  ['legal/cookies/index.html', cookies],
  ['legal/terms/index.html', terms],
  ['legal/data-request/index.html', dataRequest],
  ['legal/security/index.html', securityRedirect]
]);

for (const [relative, html] of pages) {
  const file = join(root, relative);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

console.log(`legal pages generated: ${pages.size}`);
