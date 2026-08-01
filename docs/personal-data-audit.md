# W1ZZYDEV personal data audit

Date: 2026-07-28. Status: technical/legal preparation draft, not a legal compliance guarantee.

| Источник данных | Страница/компонент | Поля | Цель | Основание | Хранение | Срок | Доступ | Передача | Страна | Риск | Действие |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Заявка | `/contact/`, `#project-form`, `#home-project-form` | name, contact, contact_method, project_type, budget, description, submission_key, locale | Ответ и старт проекта | Согласие, действия до договора | Supabase `leads`, `clients`, `conversations` | TODO_REQUIRED | owner/admin, клиент по RLS | Supabase, возможный Telegram через чат | BLOCKER: LOCATION NOT VERIFIED | Critical | Проверить регион, применить consent RPC |
| Публичный чат | widget in `app.js` | name, contact, message, category, guest_token_hash, page_url | Переписка и поддержка | Согласие | Supabase `guest_sessions`, `messages`, `conversations` | TODO_REQUIRED | owner/admin, guest token | Supabase Edge, Telegram | BLOCKER | Critical | Серверная проверка consent, минимизировать Telegram |
| Вложения | chat widget | file name, MIME, size, storage_path, signed_url | Передача материалов | Согласие | Supabase Storage `chat-attachments` | TODO_REQUIRED | участники диалога/admin | Supabase Storage | BLOCKER | High | Private bucket, short signed URL, quarantine plan |
| Поддержка | `/support/` | name, contact/email, project, subject, priority, description | Обработка обращения | Согласие | Chat/conversation tables | TODO_REQUIRED | owner/admin | Supabase, Telegram minimal | BLOCKER | High | Atomic request + consent |
| Отзывы | `/reviews/` | name, company, rating, text, status | Модерация и публикация | Согласие + отдельное разрешение на публикацию | Supabase `reviews`, IndexedDB test mode | TODO_REQUIRED | public only published, admin all | Supabase | BLOCKER | High | Store publication consent |
| Клиентский кабинет | `/client/` | email, auth session, messages | Доступ к своим данным | Согласие, исполнение обращения | Supabase Auth/DB | Auth/session policy | client/admin | Supabase Auth | BLOCKER | Critical | Verify RLS and Supabase region |
| Модерация/админка | `/reviews/moderation/`, reset password | email, password flow, tokens in sessionStorage | Администрирование | Legitimate admin access | Supabase Auth, sessionStorage | Session | owner | Supabase Auth | BLOCKER | High | noindex, owner-only RLS, avoid token logs |
| Browser storage | `app.js` | language, theme, chat session, cookie consent, debug flag | UI and session continuity | Necessary/functional | localStorage/sessionStorage/IndexedDB | До очистки/session | browser user | none directly | user device | Medium | Cookie/storage policy and settings |
| External scripts | jsDelivr Supabase SDK, devicons | IP, user-agent to CDN | Library/assets loading | Site operation | CDN logs outside project | Provider policy | CDN provider | jsDelivr | not verified | High | Self-host critical SDK/assets |
| Telegram notifications | Edge Function | message id, topic, client name/body before patch; minimal mode after patch | Notify owner | operational need + assessment | Telegram API/logs | Provider policy | Telegram/bot owner | Telegram | likely foreign | Critical | Default minimal mode, do DPIA/legal check |
| Server/hosting logs | GitHub Pages/Supabase/Edge | IP, user-agent, request path, errors | Security and delivery | legitimate technical need | providers | Provider policy | providers/admin | providers | not verified | High | Verify logs, retention and DPA |

## Critical risks

- CRITICAL BLOCKER: PERSONAL DATA LOCALIZATION. Browser sends personal data directly to `https://yeyasotjctjlplbrzwzc.supabase.co`; repository does not verify Russian primary storage.
- BLOCKER: LOCATION NOT VERIFIED for Supabase Database, Storage, Edge Functions, backups and hosting logs.
- Possible cross-border transfer to Supabase, Telegram, jsDelivr and social/contact providers.
- Public frontend depends on anon key and RLS correctness; service role key was not found in frontend, but RLS must be tested in production.

## High risks

- Attachments may contain excess personal data and active/malicious files; MIME checks are not sufficient.
- Telegram notifications historically included message body/client name.
- External CDN scripts receive IP/user-agent.
- Auth and admin flows rely on Supabase Auth region and settings not verified in repo.

## Medium risks

- localStorage/sessionStorage/IndexedDB inventory must stay aligned with code.
- Retention periods and destruction procedure are not approved.
- Legal operator requisites are missing.

## Unknown circumstances

- Supabase region, backups, Storage location, Edge Functions location.
- GitHub Pages/log processing country and retention for the custom domain.
- Whether owner has filed/needs Roskomnadzor notification.
- Actual production RLS state vs SQL files in repository.

## Manual owner actions

- Fill operator details and PD contact.
- Verify Supabase project region in dashboard/contract and export evidence.
- Decide retention periods with Russian legal counsel.
- Assess and document cross-border transfers.
- Complete Roskomnadzor notification/checklist outside code if required.
