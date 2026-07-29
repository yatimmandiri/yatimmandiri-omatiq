# AGENTS.md — Yatim Mandiri OmatiQ

## Stack

Laravel 13 + Inertia v3 + React 19 SPA. TypeScript 6, Tailwind v4, Vite 8.

Key packages: Fortify (auth), Socialite, Reverb (websockets), Spatie (permissions, media-library, settings, activitylog, backup), Firebase, DomPDF, TipTap (rich text), Wayfinder (TS route helpers), Pest 4 (tests).

## Dev Commands

| To do | Command |
|---|---|
| Full dev server | `composer run dev` |
| Run all tests | `composer run test` |
| Single test | `php artisan test --compact --filter=testName` |
| Lint + format + types + test | `composer run ci:check` |
| PHP format (auto) | `vendor/bin/pint --dirty --format agent` |
| ESLint | `npm run lint` / `npm run lint:check` |
| TypeScript check | `npm run types:check` |
| Prettier | `npm run format` / `npm run format:check` |
| Build assets | `npm run build` |
| New Pest test | `php artisan make:test --pest SomeFeatureTest` |

Order when touching PHP: `vendor/bin/pint --dirty --format agent` then `composer run test`.
Order for full check: `npm run lint:check` → `npm run types:check` → `composer run test`.

## Architecture

- **Auth**: Fortify handles login/register/reset-password/2FA/email-verification. Inertia views defined in `FortifyServiceProvider`. Socialite OAuth in `routes/auth.php`.
- **Admin**: All admin routes at `/admin/*`, guarded by `auth`, `verified`, `auth.admin` middleware. Uses Spatie roles/permissions.
- **Public**: Public routes in `routes/home.php` — homepage, about, olimpiade listing, registration, news.
- **Layouts**: AppLayout (admin/user), AuthLayout, HomeLayout. Selected in `app.tsx` based on page name prefix.
- **Route types**: Use Wayfinder generated imports — `@/routes/` for named routes, `@/actions/` for controller actions.

## Domain

Two model namespaces:
- `App\Models\Core` — User, Role, Permission, Social, LogActivity
- `App\Models\Company` — Olimpiade, OlimpiadeGallery, OlimpiadeObjective, OlimpiadeSchedule, OlimpiadeVideo, Participant, Slider, Testimonial, Review, FaqCompany

## Conventions

- Use `php artisan make:*` with `--no-interaction` for all new files.
- New models should ship with factories and seeders.
- Controllers use Admin/Home/Settings namespace split matching route files.
- Regions (province/regency/district/village) use `azishapidin/indoregion`.
- Site settings via `spatie/laravel-settings` — see `app/Settings/SiteSettings.php`.
- Breadcrumbs via `diglactic/laravel-breadcrumbs` — defined in `routes/breadcrumbs/`.
- Rich text uses TipTap — see `resources/js/components/ui/tiptap/`.
- Media via Spatie media-library (conversions for images, PDF, video, SVG).
- ESLint ignores: `resources/js/actions/**`, `resources/js/routes/**`, `resources/js/wayfinder/**`, `resources/js/components/ui/*` (generated/third-party).
- Prettier ignores in `.prettierignore`.

## Testing

- Pest v4, tests in `tests/Feature/` and `tests/Unit/`.
- PHPUnit config uses SQLite in-memory. Tests must not rely on external services.
- `RefreshDatabase` is **not** applied by default in `Pest.php` — apply per-testcase when needed.
- Factories live in `database/factories/` under PSR-4 `Database\Factories\`.
