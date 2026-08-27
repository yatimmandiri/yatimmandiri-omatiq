# AGENTS.md — Yatim Mandiri OmatiQ

## Stack

Laravel 13 + Inertia v3 + React 19 SPA. TypeScript 6, Tailwind v4, Vite 8.

Key packages: Fortify (auth), Socialite, Reverb (websockets), Spatie (permissions, media-library, settings, activitylog, backup), Firebase, DomPDF, TipTap (rich text), Wayfinder (TS route helpers), Pest 4 (tests).

## Dev Commands

| To do | Command |
|---|---|
| Fresh setup (install + .env + migrate + build) | `composer run setup` — runs `migrate --force` **without `--seed`**; run `php artisan migrate:fresh --seed` manually after editing `create_*` migrations |
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
Order for full check (matches `ci:check`): `npm run lint:check` → `npm run format:check` → `npm run types:check` → `composer run test`.
`composer run dev` = `php artisan serve` + `queue:listen` + Vite concurrently; `composer run test` = `config:clear` + `pint --parallel --test` + `php artisan test`.

## Architecture

- **Auth**: Fortify handles login/register/reset-password/2FA/email-verification (for `Administrators`/`Participant`). Guru login is **phone-only via Penyaluran** (`GuruAuthController@store` → `POST api/v1/guru/login` `{phone}` → Bearer token → `GET guru/me` → `User::updateOrCreate(penyaluran_id)` with `penyaluran_token`/`phone`/`Teacher` role + `markEmailAsVerified()` if needed, session `penyaluran_token`/`penyaluran_id`; direct `Auth::login` when `PENYALURAN_OTP_ENABLED=false` (default, `config/services.php:penyaluran.otp_enabled`). **OTP scaffold** (`app/Services/PhoneOtpService.php`, hashed 6-digit `phone_otp` + `phone_otp_expires_at` 5min / `phone_otp_attempts` 5 / lockout 15min / resend cooldown 60s, `users.phone_otp*` + `phone_verified_at` columns) when `PENYALURAN_OTP_ENABLED=true`: `generate()` → `session otp_user_id` → `GET guru/verify-otp` (`auth/guru-verify-otp.tsx`) → `POST guru/verify-otp` → `POST guru/resend-otp`; routes under `guest` + throttles `5,1`/`3,1` in `routes/auth.php` (`guru.login`, `guru.login.store`, `guru.verify`, `guru.verify.store`, `guru.resend`, `guru.logout`). `App\Models\Core\User::hasVerifiedEmail()` override returns `true` for `Teacher` (bypasses `verified` middleware — `Admin` guard is `auth,verified,auth.admin`). `PenyaluranService::me()` caches `penyaluran:me:`.sha1(token) (sha1 fix for token-safe cache key, 300s TTL). Inertia views in `FortifyServiceProvider`. Socialite OAuth in `routes/auth.php`. `routes/admin.php` only wires `AuthController@updateProfile`; remaining methods dead. Breadcrumbs for `guru.login` + `guru.verify` in `routes/breadcrumbs/auth-breadcrumbs.php`; `HandleInertiaRequests::share()` wraps `Breadcrumbs::generate` in try-catch → `[]` if missing.
- **Routing**: `routes/web.php` only requires the others: `auth.php`, `settings.php`, `admin.php`, `home.php`. Controllers split by namespace (`App\Http\Controllers\Admin`, `Home`, `Auth`, `Settings` + `Admin\Settings` for `SiteSettingsController`) matching route files. Settings routes use `as('admin.')` name-prefix (not URL prefix) under `auth` / `auth+verified` guards — URLs are `/settings/profile`, `/settings/security` (names `admin.profile.edit`, etc.).
- **Admin**: All admin routes at `/admin/*`, guarded by `auth`, `verified`, `auth.admin` (`App\Http\Middleware\AdminMiddleware`). Uses Spatie roles/permissions. Middleware aliases defined in `bootstrap/app.php`: `auth.admin`, `auth.user` (`UserMiddleware` — no-op passthrough), `guest.redirect` (`RedirectIfAuthenticated`), plus Spatie `role` / `permission` / `role_or_permission`. `AdminMiddleware` is a **blacklist**, not a whitelist — it 403s anyone with `Users` role unless they also have `Participant` or `Teacher` (so `Users+Administrators` would also 403 — avoid assigning `Users` alongside `Administrators`); it never checks for an admin role. Roles seeded in `UserRolePermissionSeeder`: `Administrators` (all permissions), `Teacher` (view/create/data-participant), `Participant` (view/data-participant), `Users` (default, no permissions). `config/permission.php` maps to the base `Spatie\Permission\Models` Role/Permission, so `App\Models\Core\Role` / `Core\Permission` are wrappers not wired via config (but used in the seeder — don't delete them).
- **Public**: Public routes in `routes/home.php` — home page, about, olimpiade listing, schedule, registration, news, contact.
- **Layouts**: Selected in `resources/js/app.tsx` by page name prefix: `home/*` → HomeLayout, `auth/*` → AuthLayout, `settings/*` → [AppLayout, SettingsLayout], `welcome` → null, default → AppLayout.
- **Route types**: Use Wayfinder generated imports — `@/routes/` for named routes, `@/actions/` for controller actions. Regenerate when routes change via the Vite plugin / `wayfinder:generate` if TS errors appear.

## Domain

Two model namespaces:
- `App\Models\Core` — User, Role, Permission, Social, LogActivity; plus `App\Models\Core\Region` (Province, Regency, District, Village from `azishapidin/indoregion`)
- `App\Models\Company` — Olimpiade, OlimpiadeGallery, OlimpiadeObjective, OlimpiadeSchedule, OlimpiadeVideo, Participant, Student, Slider, Testimonial, Review, FaqCompany

Note: "Teacher" is **not** an Eloquent model — mentor/teacher roles are `User` rows with a Spatie role (`penyaluran_id`/`penyaluran_token`/`phone` synced from Penyaluran; `User::hasVerifiedEmail()` bypass for Teacher). `PenyaluranService` wraps `APP_PENYALURAN_URL` (`POST guru/login` `{phone}` → token → `GET guru/me` cached `penyaluran:me:`.sha1(token) → `GET guru/students` normalized to `{student_id,name,nik,nis,gender(P/L→male/female),school_name,school_level,class,birth_date,status}` de-duplicated by `student_id` (`->unique(student_id)`) → flat `GET guru/sanggars` `[{id,name,type}]`). `Admin\Teacher\TeacherStudentController` is the mentor-facing "Kelola Binaan" feature: **pure API** — roster from `PenyaluranService::students(token)` (fallback to local `students.is_binaan` only in `testing`), in-memory `globalSearch` + `filterValue[registration]` + manual pagination (cap 100), `TeacherService::getFormOptionsFromApi` excludes `whereIn(status,[submitted,verified])` for both `penyaluran_student_id`/`student_id`, `registerStudent()` creates `Participant` with full snapshot (`penyaluran_student_id,penyaluran_student_name,penyaluran_student_nik,penyaluran_student_nis,penyaluran_student_gender,penyaluran_student_school_name,penyaluran_student_school_level,penyaluran_student_class,penyaluran_student_birth_date,penyaluran_sanggar_id/name,nik`) + guru fields (`achievements,has_joined_before,previous_year,referral_source,branch,notes`) + `preselected_student_id` via `?student_id=`/`?penyaluran_student_id=`. Routes `only(['index','create','store','show'])` under `admin/teacher/students`. `Student` now only for **peserta umum** (`is_binaan=false` via `ParticipantRegistrationController::store` using `Student::firstOrCreate(nik)`, `SoftDeletes` retained, `unique(nik,deleted_at)`); `participants` is **hard delete** (no `SoftDeletes`/no `deleted_at`, `DELETE` + `deleteFile(payment_proof)`, `generateRegistrationNumber()` uses `max()` + `lockForUpdate`, no `deleted_at` — run `migrate:fresh --seed` after hardness change or DB GUI shows 1054). Admin `Participant` (`ParticipantController@edit/update` + `UpdateParticipantRequest`) is **unified single `Data Peserta` form** for both binaan & umum (binaan snapshot `penyaluran_student_*` auto-synced from `full_name/nik/gender/school_name/grade/birth_date/nis/school_level/class/sanggar` via `transform`, `payload()` filters `null` to avoid overwriting, `participantPayload()` synthesizes `student` from snapshot; `isBinaan` fields `nik,full_name,gender,school` sync both ways, `birth_place/age/address/province` hidden for binaan `required={!isBinaan}`); admin can edit **all** `participants` (guru fills initially, admin corrects) plus **inline verification** in list (`PUT admin/companies/participants/{id}/status` `{status: submitted|verified|rejected}` via `Badge`+`DropdownMenu` in `list.tsx`). `Admin\Company\TeacherController` (Data Guru) is read-only — routes `only(['index','show'])` + `getData`; `create/store/edit/update/destroy` `abort(403)`; snapshot from Penyaluran on login; `StudentController` (Data Binaan) removed — binaan via `participants` snapshot only.

Legacy JSON: `olimpiades` stores `benefits`, `objectives`, `gallery`, `videos` as JSON array columns (casts in `Olimpiade`) alongside the newer relational `OlimpiadeObjective`/`OlimpiadeGallery`/`OlimpiadeVideo` tables. Unused scopes: `Testimonial::scopeType`, `Review::scopeType`, `FaqCompany::scopeSearch` are dead.

## Conventions

- **Migrations**: Do NOT create separate migration files for schema changes. Always edit the existing `create_*` table migration directly, since we use `migrate:fresh --seed`. This applies to every feature — modify the original table creation file, not a new `update_*` file.
- Use `php artisan make:*` with `--no-interaction` for all new files.
- New models should ship with factories and seeders.
- Controllers use Admin/Home/Settings namespace split matching route files. Beware: `App\Http\Controllers\SliderController` and `App\Http\Controllers\FaqCompanyController` are unused leftovers at `app/Http/Controllers/SliderController.php` / `FaqCompanyController.php` with wrong namespace `Admin\Company` (PSR-4 mismatch) — always use the `Admin\Company\*` versions.
- **UI label "Binaan"**: the Student concept is shown to users as **"Binaan"** everywhere in the UI — sidebar (`Kelola Binaan` only; `Data Binaan` removed), page headings (`Detail Binaan`, `Daftarkan Binaan`), breadcrumbs, table headers, flash messages (`Binaan {name} berhasil ditambahkan.`) and validation errors (`Binaan ini bukan binaan Anda.`). Never show "Siswa"/"Murid" in user-facing strings. The DB schema and code identifiers keep `student*` (`Student`, `students`, `student_id`) — do not rename them to match the label. `routes/breadcrumbs/*` labels use "Binaan" too. Admin `Participant` edit (`ParticipantController@edit/update` + `UpdateParticipantRequest`) can edit **all snapshot columns** (`penyaluran_student_name,nik,nis,gender,school_name,school_level,class,sanggar_name` plus legacy `Student` fields when `student_id` present); show/detail synthesizes `student` object from snapshot for pure-API binaan. Guru via `TeacherStudentController@store` cannot edit snapshot — it is auto-filled from `PenyaluranService::students()` (`TeacherService::registerStudent`) and guru only supplies `olimpiade_id` + optional `penyaluran_sanggar_id` + supplemental fields (`achievements,has_joined_before,previous_year,referral_source,branch,notes`).
- Regions (province/regency/district/village) use `azishapidin/indoregion`.
- Site settings via `spatie/laravel-settings` — see `app/Settings/SiteSettings.php`.
- Breadcrumbs via `diglactic/laravel-breadcrumbs` — `routes/breadcrumbs.php` for Blade (requires per-area files in `routes/breadcrumbs/`); every Inertia page component **must** define a static `.layout` property with `breadcrumbs` array: `{ title: string, href: routeHelper().url }`. Last item = current page (plain text). Import `dashboard` from `@/routes/admin` for the root breadcrumb.
- **New routes**: every new page/route (public `routes/home.php`, `routes/settings.php`, `routes/admin.php`) must add its own page component with a `.layout` breadcrumbs array — this is how the current page shows in the AppLayout header. Public (`home/*`) pages use HomeLayout and don't need breadcrumbs; admin/settings pages do.
- **Breadcrumb bug to avoid**: the breadcrumb link field is `href` (per `BreadcrumbItem` in `resources/js/types/navigation.ts`), NOT `url`. `resources/js/components/breadcrumbs.tsx` renders `item.href`; the last item is rendered as plain text regardless of its `href`.
- **Header dropdowns** (public `home-sidebar-layout.tsx`): desktop dropdown must bridge the hover gap — wrap the panel in a `pt-3` container inside the `group-hover` wrapper so the cursor doesn't leave the hover zone while moving to the dropdown (a bare `mt-3` gap makes the panel disappear before click). Mobile dropdown already uses `Disclosure` via `menu.children`.
- Rich text uses TipTap — see `resources/js/components/ui/tiptap/`.
- File uploads are manual (NOT Spatie media-library): forms use the `FileField` component, controllers store the path in a `*_path` column under `uploads/...`, and models expose a `*_url` accessor via `storageUrl()`. `laravel-medialibrary` is installed and configured but used by no model.
- Brand colors `#17524A` (dark green) and `#E5BE1E` (yellow) are hard-coded hex in components (e.g. `marketing-components.tsx`, `home-footer-layout.tsx`) — not shared Tailwind tokens.
- News pages (`home/news/*`) fetch from external WordPress REST APIs (`https://yatimmandiri.org/news/wp-json/ymapi/v2/posts?categories=557` & `https://yatimmandiri.org/blog/wp-json/ymapi/v2/posts`) client-side; `MainController@news` only passes `pageTitle`/`meta`.
- ESLint ignores: `resources/js/actions/**`, `resources/js/routes/**`, `resources/js/wayfinder/**`, `resources/js/components/ui/*` (generated/third-party) plus `vendor`, `bootstrap/ssr`, `tailwind.config.js`.
- Prettier ignores in `.prettierignore`.

## Data Management & Scale

Target: tables will grow to thousands+ rows. Optimize for that from day one.

- **Eager loading & N+1**: always `with()` relations in list/datatable queries; never lazy-load inside loops. Use explicit column lists (`->get(['id', 'name'])`) in eager loads to keep payloads small.
- **Inertia payloads**: never rely on Eloquent `$hidden`/`$visible` when building page props — they silently strip columns during serialization (Region models hide `province_id`/`regency_id`/`district_id`). If a hidden column is needed on the client, map the query to plain arrays (`->map(fn ($m) => ['id' => $m->id, ...])`); don't call `makeVisible()` ad hoc. Send only columns the page actually renders.
- **Reference lists (cascading dropdowns)**: don't ship the full region table to every page. If a parent→child lookup (province→regency) grows large, serve it from a dedicated endpoint filtered by parent id instead of filtering a full `regencies` prop client-side.
- **Indexes**: edit the `create_*` migration (schema changes never get new migration files). Index every column used in `where`, `orderBy`, `join`, and FK lookups — e.g. on `participants`: `status`, `[mentor_id, created_at]`, `[penyaluran_student_id, created_at]`, `created_at`, `registration_number` (unique), `penyaluran_student_id` (index), `penyaluran_sanggar_id` (index); `student_id`/`olimpiade_id`/`user_id`/`mentor_id` via FK, `students` retains `SoftDeletes` + indexes `province_id,regency_id,school_name,is_binaan,[mentor_id,created_at]` and `unique(nik,deleted_at)` — **do not add `deleted_at` to `participants`** (hard delete).
- **Soft-delete-aware unique constraints**: a trashed row still occupies its unique value (e.g. `students.nik` `unique(nik,deleted_at)`). If the same NIK must be re-registerable after soft-delete, use composite unique on `(nik, deleted_at)` (as `students` does). `participants` is **hard delete** (no `deleted_at`, no `SoftDeletes`) — `registration_number` remains plain `unique` and `penyaluran_student_nik`/`nik` are nullable non-unique; re-registering same binaan is blocked by application logic `whereIn(status,[submitted,verified])` not DB unique (see `TeacherService::getFormOptionsFromApi` + `StoreTeacherParticipantRequest`).
- **LIKE searches**: `LIKE '%term%'` (used by `globalSearch`) is a full scan. Prefix `LIKE 'term%'` can use an index; at scale switch to full-text search.
- **Pagination, always**: never `->get()` on an unbounded result set. `getData()` must default to a bounded `perPage` (no `get()` fallback) and cap it (current cap = 100). For very large tables prefer `cursorPaginate`.
- **Batch jobs**: use `chunkById`/`cursor()`/`lazy()` for any batch processing (sync, export, backup) — never `->get()` everything.
- **Delete semantics**: deleting a child record (e.g. Participant) must never delete parent master data (Student) or its media files just because it references them. Wrap multi-step writes in `DB::transaction` and keep sequence generation under `lockForUpdate` (see `generateRegistrationNumber()` — uses `max()` + `lockForUpdate`, no `deleted_at` — run `migrate:fresh --seed` after hardness change or DB GUI shows 1054).
- **Activity logging**: `LogsActivity` fires per model event; keep `logOnlyDirty()`, avoid row-by-row logging inside bulk operations.

## Testing

- Pest v4, tests in `tests/Feature/` and `tests/Unit/`.
- PHPUnit config uses SQLite in-memory. Tests must not rely on external services.
- `RefreshDatabase` is **not** applied by default in `Pest.php` — apply per-testcase when needed.
- Factories live in `database/factories/` under PSR-4 `Database\Factories\`.

## Other Instruction Sources

- `CLAUDE.md` holds the Laravel Boost guidelines (MCP tools, `search-docs` before changes, PHP/Inertia/Pest coding rules) — follow it too. `.claude/skills/` folder is currently missing; skills are referenced inside `CLAUDE.md` only.
