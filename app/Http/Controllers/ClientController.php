<?php

namespace App\Http\Controllers;

use App\Models\Client;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $clients = Client::all();

        if ($request->user()->admin == 1) {
            return Inertia::render('Clients', [
                'clients' => $clients
            ]);
        } else {
            return redirect('/');
        }
    }

    public function getclients(Request $request)
    {
        $name = $request->query('name');

        if (empty(trim($name))) {
            $clients = Client::paginate(50);
        } else {
            $clients = Client::where('client_name', 'like', "%{$name}%")
                ->orWhere('rep_name', 'like', "%{$name}%")
                ->paginate(50);
        }

        return response()->json($clients);
    }

    public function show($id)
    {
        $client = Client::find($id);

        return response()->json($client);
    }

    public function store(Request $request): RedirectResponse
    {
        Validator::make($request->all(), [
            'client_name' => 'required|max:255',
            'rep_name' => 'required|max:255',
            'rep_email' => 'required|email',
            'rep_phone' => 'required|numeric|digits_between:10,13',
            'client_address' => 'required',
        ], [
            'client_name.required' => 'Name is required',
            'client_name.max' => 'Client name must not be more than 255 characters',
            'rep_name.required' => 'Client representative name is required',
            'rep_name.max' => 'Client representative name cannot be more than 255 characters',
            'rep_email.required' => 'Email is required',
            'rep_email.email' => 'Email is not valid',
            'rep_phone.required' => 'Phone number is required',
            'rep_phone.digits_between' => 'Phone number must be between 10 to 13 digits',
            'rep_phone.numeric' => 'Phone number can only contains numbers',
            'client_address.required' => 'Address is required',
        ])->validate();

        Client::create([
            'client_name' => $request->client_name,
            'rep_name' => $request->rep_name,
            'rep_email' => $request->rep_email,
            'rep_phone' => $request->rep_phone,
            'client_address' => $request->client_address,
        ]);

        return Redirect::route("clients");
    }

    public function update(Request $request): RedirectResponse
    {
        Validator::make($request->all(), [
            'client_name' => 'required|max:255',
            'rep_name' => 'required|max:255',
            'rep_email' => 'required|email',
            'rep_phone' => 'required|numeric|digits_between:10,13',
            'client_address' => 'required',
        ], [
            'client_name.required' => 'Name is required',
            'client_name.max' => 'Client name must not be more than 255 characters',
            'rep_name.required' => 'Client representative name is required',
            'rep_name.max' => 'Client representative name cannot be more than 255 characters',
            'rep_email.required' => 'Email is required',
            'rep_email.email' => 'Email is not valid',
            'rep_phone.required' => 'Phone number is required',
            'rep_phone.digits_between' => 'Phone number must be between 10 to 13 digits',
            'rep_phone.numeric' => 'Phone number can only contains numbers',
            'client_address.required' => 'Address is required',
        ])->validate();

        $client = Client::find($request->id);

        $client->update([
            'client_name' => $request->client_name,
            'rep_name' => $request->rep_name,
            'rep_email' => $request->rep_email,
            'rep_phone' => $request->rep_phone,
            'client_address' => $request->client_address,
        ]);

        return Redirect::route("clients");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $client = Client::find($request->id);

        $client->delete();

        return Redirect::route("clients");
    }
}
