<?php

namespace App\Http\Controllers;

use App\Models\User;

use App\Notifications\UserInvite;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index(Request $request) {
        $users = User::all();
        
        if ($request->user()->admin == 1) {
            return Inertia::render('Users', [
                'users' => $users
            ]);
        } else {
            return redirect('/');
        }
    }

    public function getusers(Request $request) {
        $name = $request->query('name');

        if (empty(trim($name))) {
            $users = User::paginate(50);
        } else {
            $users = User::where('name', 'like', "%{$name}%")->paginate(50);
        }

        return response()->json($users);
    }

    public function show($id) {
        $user = User::find($id);

        return response()->json($user);
    }

    public function create(Request $request): RedirectResponse {
        Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|email',
            'phone'=> 'required|numeric|digits_between:10,13',
        ], [
            'name.required' => 'Name is required',
            'name.max' => 'Name cannot be more than 255 characters',
            'email.required' => 'Email is required',
            'email.email' => 'Email is invalid',
            'phone.required' => 'Phone number is required',
            'phone.digits_between' => 'Phone number must have between 10 to 13 digits',
            'phone.numeric' => 'Phone number can only contain numbers',
        ])->validate();

        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]\\{}|;\':\",.?,./`~';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < 24; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }

        $new_password = $randomString;

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'admin' => $request->admin,
            'password' => Hash::make($new_password)
        ]);

        $new_user = User::latest()->first();

        // $mail_data = [
        //     'user_name' => $request->name,
        //     'user_pass' => $new_password
        // ];

        // Mail::to($request->email)->send(new UserInvites($mail_data));
        // Notification::send($new_user, new UserInvite($request->name, $new_password));
        $new_user->notify(new UserInvite($request->name, $new_password));

        return Redirect::route('users');
    }

    public function update(Request $request): RedirectResponse {
        Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|email',
            'phone'=> 'required|numeric|digits_between:10,13',
        ], [
            'name.required' => 'Name is required',
            'name.max' => 'Name cannot be more than 255 characters',
            'email.required' => 'Email is required',
            'email.email' => 'Email is invalid',
            'phone.required' => 'Phone number is required',
            'phone.digits_between' => 'Phone number must have between 10 to 13 digits',
            'phone.numeric' => 'Phone number can only contain numbers',
        ])->validate();

        $user = User::find($request->id);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'admin' => $request->admin,
        ]);

        return Redirect::route("users");
    }

    public function delete(Request $request): RedirectResponse {
        $user = User::find($request->id);

        $user->delete();

        return Redirect::route('users');
    }
}
