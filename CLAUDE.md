# income-tracker — заметки для переписывания на "проще"

Этот файл — снимок текущей архитектуры (backend + frontend) и тезисы кандидатов
на удаление/упрощение перед рефакторингом. Правки в разметке "оставляем /
упрощаем / убираем" делает пользователь — здесь только факты и предложения.

## Что это

Личный трекер смен водителя: доход/расходы/пробег за смену, сравнение факта с
недельным планом, плюс отдельный модуль учёта ТО (визиты + запчасти).
Судя по всему — приложение одного пользователя (самого автора), не публичный
SaaS с множеством клиентов.

## Стек

- Backend: NestJS 11 + Prisma 5 + PostgreSQL. JWT-аутентификация
  (access + refresh, passport-jwt), bcrypt для паролей.
- Frontend: React 19 + Vite 7 + TypeScript + React Router 7 + Sass-модули.
  Без стейт-менеджера — hooks + прямые fetch через `authClient.ts`.
- Инфра: `docker-compose.yml` поднимает только Postgres. Тестов нет вообще
  (ни backend, ни frontend). CI не настроен.

## Backend — как устроено

`backend/src/`
- `app.module.ts` — собирает модули: `PrismaModule`, `UsersModule`,
  `AuthModule`, `ShiftsModule`, `ServiceVisitsModule`.
- `auth/` — регистрация, логин, refresh, logout, `/auth/me`.
  - `auth.service.ts` — bcrypt-хэширование пароля и refresh-токена,
    подпись access/refresh JWT с раздельными секретами и TTL (15m / 7d).
  - Refresh-токен (хэш) хранится в `User.refreshTokenHash` — при каждом
    логине/рефреше перезаписывается.
- `users/` — `users.service.ts`: CRUD пользователя + `updateSettings`
  (недельный план: `dailyTargetNet`, `workDaysPerWeek`, `hasWeeklyPlan`).
- `shifts/` — CRUD смен. `upsert` по `(userId, date)`: при create/update
  вложенные расходы (`fuelings/washes/snacks/others`) полностью пересоздаются
  через `deleteMany` + `create` (это 4 одинаковые по структуре таблицы,
  отличаются только именем).
- `service-visits/` — CRUD визитов ТО с запчастями (`ServicePart`), автосчёт
  `totalCost = workCost + Σ(unitCost*quantity)`, `deleteMany`+`create` для
  запчастей при обновлении.
- `common/` — `JwtAuthGuard` + `@CurrentUser()` декоратор, используются на
  всех защищённых контроллерах.

### Модель данных (`backend/prisma/schema.prisma`)

- `User` — email, name, passwordHash, refreshTokenHash, поля плана
  (`dailyTargetNet: Float?`, `workDaysPerWeek: Int?`, `hasWeeklyPlan: Boolean`).
- `Day` (= смена) — date (уникален с userId), note, mileageKm, engineHours,
  incomeTotal (Int), tripsCount.
- `Fueling`, `Wash`, `Snack`, `Other` — 4 идентичные таблицы-расходы
  (`dayId`, `costTotal: Int`), различаются только названием/назначением.
- `ServiceVisit` + `ServicePart` — визит ТО и его запчасти (position, name,
  isOriginal, unitCost, quantity, totalCost).

⚠️ Несогласованность: деньги в `Day`/расходах/ТО хранятся как `Int`
(целые единицы валюты), а `User.dailyTargetNet` — `Float`. Это стоит
унифицировать при переписывании, независимо от решения по остальному.

## Frontend — как устроено

`frontend/src/`
- `App.tsx` — роутинг, все страницы кроме `/`, `/login`, `/register` закрыты
  проверкой `isAuthenticated` (из `useAuthStatus`, читает `accessToken` из
  localStorage). Есть дублирующиеся маршруты на один и тот же компонент:
  `/history/:id` и `/shift/:id` оба рендерят `ShiftDetailsPage`.
- `api/authClient.ts` — обёртка над fetch: подставляет Bearer-токен, при 401
  сама делает `/auth/refresh` и повторяет запрос; `clearAuth()` чистит
  localStorage (accessToken/refreshToken/userName/userEmail).
- `hooks/useAuthStatus.ts` — состояние авторизации на кастомном событии
  `auth-changed` + `storage` (мультивкладочная синхронизация).
- Страницы (`pages/`): Home (лендинг с hero-текстом и CTA "Начать учёт"),
  Login, Register, Profile (настройка плана), History (+ график), ShiftDetails,
  ShiftEdit, NewShift, Services/ServiceDetails/ServiceEdit/ServiceNew.
- Компоненты (`components/`):
  - `ShiftDataForm` — общий 6-шаговый визард (дата → доход → пробег/поездки →
    моточасы → расходы по 4 категориям → итог), используется и в
    `NewShiftForm`, и в `ShiftEditForm`.
  - `ShiftResultModal` + `shiftResultModalState.ts` — модалка после сохранения
    смены с прогрессом по недельному плану (факт/план дня и недели).
  - `ServiceVisitForm`, `ServiceEditForm` — форма визита ТО с динамическим
    списком запчастей.
  - `AppHeader`, `BurgerButton`, `BurgerMenu`, `HeaderAuth` — навигация/логин
    статус в шапке.
  - `HistoryChart`, `ShiftCard`, `ShiftList`, `ShiftDetails` — вывод истории.
- `utils/theme.ts` — light/dark тема через `data-theme` атрибут + localStorage,
  используется в `main.tsx` и `BurgerMenu`.
- `utils/incomeMode.ts` — переключатель "gross/net" отображения дохода в
  истории, используется только в `HistoryPage`.

## Тезисы: кандидаты на упрощение

Ниже — предложения, не решения. Пользователь помечает, что оставляем/убираем.

**Скорее всего убрать (раз приложение для одного пользователя):**
1. Регистрация целиком: `RegisterPage`, `RegisterForm`, `register.dto.ts`,
   `AuthService.register`, `POST /auth/register`. Пользователя можно завести
   один раз вручную (seed-скрипт/сид в БД) вместо публичной формы регистрации.
2. Refresh-токен механика (access+refresh с раздельными секретами, хранение
   `refreshTokenHash`, эндпоинт `/auth/refresh`, авто-refresh в
   `authClient.ts`). Для одного пользователя проще: один долгоживущий токен
   без ротации, либо простой пароль-гейт без JWT вообще, если приложение и так
   не публикуется в открытый интернет.
3. Hero-лендинг на `HomePage` (маркетинговый текст "Деньги под контролем" и
   т.п.) — не нужен, если это личный инструмент, а не продукт для чужих
   пользователей. Можно заменить на прямой редирект на `/history` или
   `/shift/new`.
4. Дублирующиеся маршруты `/history/:id` и `/shift/:id` → оставить один.

**Архитектурное упрощение (независимо от auth-решения):**
5. `Fueling` / `Wash` / `Snack` / `Other` — 4 идентичные таблицы и 4 одинаковых
   блока `deleteMany`+`create` в `shifts.service.ts` можно заменить одной
   таблицей `Expense` с полем `category` (enum). Меньше кода в схеме, сервисе
   и DTO, логика та же.
6. Унифицировать типы денег (Int везде, включая `dailyTargetNet`).

**Скорее оставить (похоже на ценную функциональность):**
- Учёт смен (доход/расходы/пробег/поездки) — ядро приложения.
- Недельный план + `ShiftResultModal` — то, над чем шла недавняя работа,
  явно осознанная фича, а не случайная сложность.
- Модуль ТО (`ServiceVisit`/`ServicePart`) — самостоятельная полезная функция,
  если продолжаете следить за обслуживанием машины.
- Light/dark тема — небольшой код, не мешает.
- `incomeMode` (gross/net в истории) — маленькая фича, дешёвая в поддержке.

**Нужно уточнить у пользователя:**
- Останется ли приложение доступным из интернета (тогда какая-то
  авторизация всё равно нужна) или будет только в локальной сети/на своём
  сервере за VPN (тогда auth можно убрать вообще)?
- Нужен ли модуль ТО дальше, или это тоже кандидат на вырезание?
