<?php

use App\Http\Controllers\Admin\Company\FaqCompanyController;
use App\Http\Controllers\Admin\Company\OlimpiadeController;
use App\Http\Controllers\Admin\Company\OlimpiadeGalleryController;
use App\Http\Controllers\Admin\Company\OlimpiadeObjectiveController;
use App\Http\Controllers\Admin\Company\OlimpiadeScheduleController;
use App\Http\Controllers\Admin\Company\OlimpiadeVideoController;
use App\Http\Controllers\Admin\Company\ParticipantController;
use App\Http\Controllers\Admin\Company\ReviewController;
use App\Http\Controllers\Admin\Company\SliderController;
use App\Http\Controllers\Admin\Company\TeacherController;
use App\Http\Controllers\Admin\Company\TestimonialController;
use App\Http\Controllers\Admin\Core\PermissionController;
use App\Http\Controllers\Admin\Core\Region\DistrictController;
use App\Http\Controllers\Admin\Core\Region\ProvinceController;
use App\Http\Controllers\Admin\Core\Region\RegencyController;
use App\Http\Controllers\Admin\Core\Region\VillageController;
use App\Http\Controllers\Admin\Core\RoleController;
use App\Http\Controllers\Admin\Core\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\Settings\LogActivityController;
use App\Http\Controllers\Admin\Settings\SiteSettingsController;
use App\Http\Controllers\Admin\Teacher\AbsensiController;
use App\Http\Controllers\Admin\Teacher\MasterBinaanController;
use App\Http\Controllers\Admin\Teacher\MasterSanggarController;
use App\Http\Controllers\Admin\Teacher\TeacherStudentController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->as('admin.')->middleware(['auth', 'verified', 'auth.admin'])->group(function () {
    Route::redirect('/', '/admin/dashboard')->name('index');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('settings')->as('settings.')->group(function () {
        Route::get('site', [SiteSettingsController::class, 'edit'])->name('site.edit');
        Route::put('site', [SiteSettingsController::class, 'update'])->name('site.update');
        Route::put('profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    });

    Route::prefix('logs')->as('logs.')->group(function () {
        Route::get('activities/data', [LogActivityController::class, 'getData'])->name('activities.data');
        Route::get('activities', [LogActivityController::class, 'index'])->name('activities.index');
    });

    Route::prefix('companies')->as('companies.')->group(function () {
        Route::put('olimpiades/{olimpiade}/recommended', [OlimpiadeController::class, 'recommended'])->name('olimpiades.recommended');
        Route::put('olimpiades/{olimpiade}/status', [OlimpiadeController::class, 'status'])->name('olimpiades.status');
        Route::get('olimpiades/data', [OlimpiadeController::class, 'getData'])->name('olimpiades.data');
        Route::resource('olimpiades', OlimpiadeController::class);

        Route::put('olimpiade-objectives/{olimpiadeObjective}/status', [OlimpiadeObjectiveController::class, 'status'])->name('olimpiade-objectives.status');
        Route::get('olimpiade-objectives/data', [OlimpiadeObjectiveController::class, 'getData'])->name('olimpiade-objectives.data');
        Route::resource('olimpiade-objectives', OlimpiadeObjectiveController::class);

        Route::put('olimpiade-galleries/{olimpiadeGallery}/status', [OlimpiadeGalleryController::class, 'status'])->name('olimpiade-galleries.status');
        Route::get('olimpiade-galleries/data', [OlimpiadeGalleryController::class, 'getData'])->name('olimpiade-galleries.data');
        Route::resource('olimpiade-galleries', OlimpiadeGalleryController::class);

        Route::put('olimpiade-videos/{olimpiadeVideo}/status', [OlimpiadeVideoController::class, 'status'])->name('olimpiade-videos.status');
        Route::get('olimpiade-videos/data', [OlimpiadeVideoController::class, 'getData'])->name('olimpiade-videos.data');
        Route::resource('olimpiade-videos', OlimpiadeVideoController::class);

        Route::put('olimpiade-schedules/{olimpiadeSchedule}/status', [OlimpiadeScheduleController::class, 'status'])->name('olimpiade-schedules.status');
        Route::get('olimpiade-schedules/data', [OlimpiadeScheduleController::class, 'getData'])->name('olimpiade-schedules.data');
        Route::resource('olimpiade-schedules', OlimpiadeScheduleController::class)
            ->parameters(['olimpiade-schedules' => 'olimpiadeSchedule']);

        Route::put('participants/{participant}/status', [ParticipantController::class, 'status'])->name('participants.status');
        Route::get('participants/data', [ParticipantController::class, 'getData'])->name('participants.data');
        Route::resource('participants', ParticipantController::class)->except(['create', 'store']);

        Route::put('testimonials/{testimonial}/status', [TestimonialController::class, 'status'])->name('testimonials.status');
        Route::get('testimonials/data', [TestimonialController::class, 'getData'])->name('testimonials.data');
        Route::resource('testimonials', TestimonialController::class);

        Route::put('reviews/{review}/status', [ReviewController::class, 'status'])->name('reviews.status');
        Route::get('reviews/data', [ReviewController::class, 'getData'])->name('reviews.data');
        Route::resource('reviews', ReviewController::class);

        Route::put('sliders/{slider}/status', [SliderController::class, 'status'])->name('sliders.status');
        Route::get('sliders/data', [SliderController::class, 'getData'])->name('sliders.data');
        Route::resource('sliders', SliderController::class);

        Route::put('faq-companies/{faqCompany}/status', [FaqCompanyController::class, 'status'])->name('faq-companies.status');
        Route::get('faq-companies/data', [FaqCompanyController::class, 'getData'])->name('faq-companies.data');
        Route::resource('faq-companies', FaqCompanyController::class);

        Route::get('teachers/data', [TeacherController::class, 'getData'])->name('teachers.data');
        Route::put('teachers/{teacher}/reset-password', [TeacherController::class, 'resetPassword'])->name('teachers.reset-password');
        Route::resource('teachers', TeacherController::class)->parameters(['teachers' => 'teacher'])->only(['index', 'show']);
    });

    Route::prefix('teacher')->as('teacher.')->group(function () {
        Route::get('students/data', [TeacherStudentController::class, 'getData'])->name('students.data');
        Route::resource('students', TeacherStudentController::class)
            ->parameters(['students' => 'participant'])
            ->only(['index', 'create', 'store', 'show']);

        Route::prefix('master')->as('master.')->group(function () {
            Route::get('binaan/data', [MasterBinaanController::class, 'getData'])->name('binaan.data');
            Route::get('binaan/{binaan}', [MasterBinaanController::class, 'show'])->name('binaan.show');
            Route::get('binaan', [MasterBinaanController::class, 'index'])->name('binaan.index');

            Route::get('sanggar/data', [MasterSanggarController::class, 'getData'])->name('sanggar.data');
            Route::get('sanggar/{sanggar}', [MasterSanggarController::class, 'show'])->name('sanggar.show');
            Route::get('sanggar', [MasterSanggarController::class, 'index'])->name('sanggar.index');
        });

        Route::get('absensi', [AbsensiController::class, 'index'])->name('absensi.index');
    });

    Route::prefix('core')->as('core.')->group(function () {
        Route::get('permissions/data', [PermissionController::class, 'getData'])->name('permissions.data');
        Route::resource('permissions', PermissionController::class);

        Route::get('roles/data', [RoleController::class, 'getData'])->name('roles.data');
        Route::resource('roles', RoleController::class);

        Route::post('users/bulk-action', [UserController::class, 'bulkAction'])->name('users.bulk-action');
        Route::put('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
        Route::get('users/data', [UserController::class, 'getData'])->name('users.data');
        Route::resource('users', UserController::class);

        Route::prefix('regions')->as('regions.')->group(function () {
            Route::get('provinces/data', [ProvinceController::class, 'getData'])->name('provinces.data');
            Route::resource('provinces', ProvinceController::class);

            Route::get('regencies/data', [RegencyController::class, 'getData'])->name('regencies.data');
            Route::resource('regencies', RegencyController::class);

            Route::get('districts/data', [DistrictController::class, 'getData'])->name('districts.data');
            Route::resource('districts', DistrictController::class);

            Route::get('villages/data', [VillageController::class, 'getData'])->name('villages.data');
            Route::resource('villages', VillageController::class);
        });
    });
});
