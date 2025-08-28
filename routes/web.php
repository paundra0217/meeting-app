<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\MeetingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', [MeetingController::class, 'index'])->middleware(['auth', 'verified'])->name('homepage');

Route::middleware('auth')->group(function () {
    // Web Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/', [MeetingController::class, 'store'])->name('meetings.create');

    Route::get('/meeting/{id}', [MeetingController::class, 'show'])->name('meeting');
    Route::post('/meeting', [MeetingController::class, 'update'])->name('meeting.edit');
    Route::get('/list-meetings', [MeetingController::class, 'viewlistmeetings'])->name('listmeetings');
    Route::get('/my-meetings', [MeetingController::class, 'viewmymeetings'])->name('mymeetings');

    Route::get('/users', [UsersController::class, 'index'])->name('users');
    Route::post('/users', [UsersController::class, 'create'])->name('users.create');
    Route::patch('/users', [UsersController::class, 'update'])->name('users.edit');
    Route::delete('/users', [UsersController::class, 'delete'])->name('users.delete');

    Route::get('/clients', [ClientController::class, 'index'])->name('clients');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.create');
    Route::patch('/clients', [ClientController::class, 'update'])->name('clients.edit');
    Route::delete('/clients', [ClientController::class, 'destroy'])->name('clients.delete');

    // API Routes
    Route::get('/api/get-users', [UsersController::class, 'getusers'])->name('users.index');
    Route::get('/api/user/{id}', [UsersController::class, 'show'])->name('users.get');

    Route::get('/api/get-clients', [ClientController::class, 'getclients'])->name('clients.index');
    Route::get('/api/client/{id}', [ClientController::class, 'show'])->name('clients.get');

    Route::get('/api/get-meetings/{date}', [MeetingController::class, 'getmeetings'])->name('meetings.get');
    Route::get('/api/search-meeting',[MeetingController::class, 'searchmeeting'])->name('meetings.search');
    Route::post('/api/cancel-meeting', [MeetingController::class, 'cancel'])->name('meeting.cancel');
    Route::get('/api/list-meetings', [MeetingController::class, 'listmeetings'])->name('meetings.list');
    Route::get('/api/past-meetings', [MeetingController::class, 'pastmeetings'])->name('meetings.past');
    Route::get('/api/cancelled-meetings', [MeetingController::class, 'cancelledmeetings'])->name('meetings.cancelled');
    Route::get('/api/my-meetings', [MeetingController::class, 'mymeetings'])->name('meetings.mymeetings');
});

require __DIR__ . '/auth.php';
