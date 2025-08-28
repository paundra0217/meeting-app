<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create() {
        $user = User::all();

        if ($user->count() < 1) {
            return Inertia::render('Auth/Register');
        } else {
            return redirect('/');
        }
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {   
        Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255',
            'phone'=> 'required|numeric|digits_between:10,13',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.required' => 'Nama wajib diisi',
            'name.max' => 'Nama tidak bisa lebih dari 255 huruf',
            'email.required' => 'Alamat email wajib diisi',
            'email.email' => 'Alamat email harus sesuai dengan format standar email',
            'email.max' => 'Alamat email tidak bisa lebih dari 255 huruf',
            'phone.required' => 'Nomor telepon wajib diisi',
            'phone.digits_between' => 'Nomor telepon minimal 10 angka dan maksimal 13 angka',
            'phone.numeric' => 'Nomor telepon hanya bisa diisi oleh angka saja',
            'password.required' => 'Password wajib diisi',
            'password.confirmed' => 'Konfirmasi password tidak sama dengan password anda'
        ])->validate();
        
        // $request->validate([
        //     'name' => 'required|string|max:255',
        //     'email' => 'required|string|lowercase|max:255|unique:'.User::class,
        //     'password' => ['required', 'confirmed', Rules\Password::defaults()],
        // ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'admin' => 1,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }
}
