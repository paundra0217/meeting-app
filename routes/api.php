<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ClientController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\MeetingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route::middleware('auth:api')->group(function () {
//     Route::get('/get-users', [UsersController::class, 'getusers'])->name('users.index');
//     Route::get('/user/{id}', [UsersController::class, 'show'])->name('users.get');

//     Route::get('/get-clients', [ClientController::class, 'getclients'])->name('clients.index');
//     Route::get('/client/{id}', [ClientController::class, 'show'])->name('clients.get');

//     Route::get('/get-meetings/{date}', [MeetingController::class, 'getmeetings'])->name('meetings.get');
//     Route::post('/cancel-meeting', [MeetingController::class, 'cancel'])->name('meeting.cancel');
//     Route::get('/list-meetings', [MeetingController::class, 'listmeetings'])->name('meetings.list');
//     Route::get('/past-meetings', [MeetingController::class, 'pastmeetings'])->name('meetings.past');
//     Route::get('/cancelled-meetings', [MeetingController::class, 'cancelledmeetings'])->name('meetings.cancelled');
//     Route::get('/my-meetings', [MeetingController::class, 'mymeetings'])->name('meetings.mymeetings');
// });

// Route::get('/client/{id}', [ClientController::class, 'show'])->name('clients.get');
