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
- **Routing**: `routes/web.php` only requires the others: `auth.php`, `settings.php`, `admin.php`, `home.php`. Controllers split by namespace (`App\Http\Controllers\Admin`, `Home`, `Auth`, `Settings`) matching route files. Settings routes are grouped with prefix `admin.` under a `auth` guard.
- **Admin**: All admin routes at `/admin/*`, guarded by `auth`, `verified`, `auth.admin` (`App\Http\Middleware\AdminMiddleware`). Uses Spatie roles/permissions. Middleware aliases defined in `bootstrap/app.php`.
- **Public**: Public routes in `routes/home.php` — home page, about, olimpiade listing, schedule, registration, news, contact.
- **Layouts**: Selected in `resources/js/app.tsx` by page name prefix: `home/*` → HomeLayout, `auth/*` → AuthLayout, `settings/*` → [AppLayout, SettingsLayout], `welcome` → null, default → AppLayout.
- **Route types**: Use Wayfinder generated imports — `@/routes/` for named routes, `@/actions/` for controller actions. Regenerate when routes change via the Vite plugin / `wayfinder:generate` if TS errors appear.

## Domain

Two model namespaces:
- `App\Models\Core` — User, Role, Permission, Social, LogActivity; plus `App\Models\Core\Region` (Province, Regency, District, Village from `azishapidin/indoregion`)
- `App\Models\Company` — Olimpiade, OlimpiadeGallery, OlimpiadeObjective, OlimpiadeSchedule, OlimpiadeVideo, Participant, Student, Slider, Testimonial, Review, FaqCompany

Note: "Teacher" is **not** an Eloquent model — mentor/teacher roles are `User` rows with a Spatie role. `Admin\Teacher\TeacherStudentController` manages participants from the mentor's perspective.

## Conventions

- **Migrations**: Do NOT create separate migration files for schema changes. Always edit the existing `create_*` table migration directly, since we use `migrate:fresh --seed`. This applies to every feature — modify the original table creation file, not a new `update_*` file.
- Use `php artisan make:*` with `--no-interaction` for all new files.
- New models should ship with factories and seeders.
- Controllers use Admin/Home/Settings namespace split matching route files.
- Regions (province/regency/district/village) use `azishapidin/indoregion`.
- Site settings via `spatie/laravel-settings` — see `app/Settings/SiteSettings.php`.
- Breadcrumbs via `diglactic/laravel-breadcrumbs` — defined in `routes/breadcrumbs/` for Blade; every Inertia page component **must** define a static `.layout` property with `breadcrumbs` array: `{ title: string, href: routeHelper().url }`. Last item = current page (plain text). Import `dashboard` from `@/routes/admin` for the root breadcrumb.
- **New routes**: every new page/route (public `routes/home.php`, `routes/settings.php`, `routes/admin.php`) must add its own page component with a `.layout` breadcrumbs array — this is how the current page shows in the AppLayout header. Public (`home/*`) pages use HomeLayout and don't need breadcrumbs; admin/settings pages do.
- **Breadcrumb bug to avoid**: the breadcrumb link field is `href` (per `BreadcrumbItem` in `resources/js/types/navigation.ts`), NOT `url`. `resources/js/components/breadcrumbs.tsx` renders `item.href`; the last item is rendered as plain text regardless of its `href`.
- **Header dropdowns** (public `home-sidebar-layout.tsx`): desktop dropdown must bridge the hover gap — wrap the panel in a `pt-3` container inside the `group-hover` wrapper so the cursor doesn't leave the hover zone while moving to the dropdown (a bare `mt-3` gap makes the panel disappear before click). Mobile dropdown already uses `Disclosure` via `menu.children`.
- Rich text uses TipTap — see `resources/js/components/ui/tiptap/`.
- Media via Spatie media-library (conversions for images, PDF, video, SVG).
- ESLint ignores: `resources/js/actions/**`, `resources/js/routes/**`, `resources/js/wayfinder/**`, `resources/js/components/ui/*` (generated/third-party).
- Prettier ignores in `.prettierignore`.

## Data Management & Scale

Target: tables will grow to thousands+ rows. Optimize for that from day one.

- **Eager loading & N+1**: always `with()` relations in list/datatable queries; never lazy-load inside loops. Use explicit column lists (`->get(['id', 'name'])`) in eager loads to keep payloads small.
- **Inertia payloads**: never rely on Eloquent `$hidden`/`$visible` when building page props — they silently strip columns during serialization (Region models hide `province_id`/`regency_id`/`district_id`). If a hidden column is needed on the client, map the query to plain arrays (`->map(fn ($m) => ['id' => $m->id, ...])`); don't call `makeVisible()` ad hoc. Send only columns the page actually renders.
- **Reference lists (cascading dropdowns)**: don't ship the full region table to every page. If a parent→child lookup (province→regency) grows large, serve it from a dedicated endpoint filtered by parent id instead of filtering a full `regencies` prop client-side.
- **Indexes**: edit the `create_*` migration (schema changes never get new migration files). Index every column used in `where`, `orderBy`, `join`, and FK lookups — e.g. on `participants`: `status`, `olimpiade_id`, `mentor_id`, `[mentor_id, created_at]`, `created_at`, `registration_number`; plus `student_id` (FK) and `deleted_at` for soft-delete scoping.
- **Soft-delete-aware unique constraints**: a trashed row still occupies its unique value (e.g. `participants.nik`). If the same NIK must be re-registerable after delete, use a composite unique on `(nik, deleted_at)`.
- **LIKE searches**: `LIKE '%term%'` (used by `globalSearch`) is a full scan. Prefix `LIKE 'term%'` can use an index; at scale switch to full-text search.
- **Pagination, always**: never `->get()` on an unbounded result set. `getData()` must default to a bounded `perPage` (no `get()` fallback) and cap it (current cap = 100). For very large tables prefer `cursorPaginate`.
- **Batch jobs**: use `chunkById`/`cursor()`/`lazy()` for any batch processing (sync, export, backup) — never `->get()` everything.
- **Delete semantics**: deleting a child record (e.g. Participant) must never delete parent master data (Student) or its media files just because it references them. Wrap multi-step writes in `DB::transaction` and keep sequence generation under `lockForUpdate` (see `generateRegistrationNumber()`).
- **Activity logging**: `LogsActivity` fires per model event; keep `logOnlyDirty()`, avoid row-by-row logging inside bulk operations.

## Testing

- Pest v4, tests in `tests/Feature/` and `tests/Unit/`.
- PHPUnit config uses SQLite in-memory. Tests must not rely on external services.
- `RefreshDatabase` is **not** applied by default in `Pest.php` — apply per-testcase when needed.
- Factories live in `database/factories/` under PSR-4 `Database\Factories\`.
