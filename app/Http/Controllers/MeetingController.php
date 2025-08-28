<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Meeting;

use App\Notifications\UserMeetingScheduled;
use App\Notifications\ClientMeetingScheduled;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;
use Hamcrest\Core\IsNot;

use function PHPUnit\Framework\isNull;

class MeetingController extends Controller
{
    public function index()
    {
        $users = User::all();
        $clients = Client::all();

        // echo date_default_timezone_get();

        return Inertia::render('Homepage', [
            'users' => $users,
            'clients' => $clients
        ]);
    }

    public function viewlistmeetings(Request $request)
    {
        if ($request->user()->admin == 0) {
            return redirect('/');
        }

        return Inertia::render('ListMeetings');
    }

    public function viewmymeetings() {
        return Inertia::render('MyMeetings');
    }

    public function getmeetings($date)
    {
        $selected_date = Carbon::parse($date)->setTimezone(env('APP_TIMEZONE'))->format("Y-m-d");

        $schedule = User::select('id', 'name')
            ->with(['meetings' => function ($query) use ($selected_date) {
                $query->select('id', 'user_id', 'meeting_start', 'meeting_end', 'meeting_location')
                    ->whereBetween('meeting_start', ["$selected_date 00:00:00", "$selected_date 23:59:59"])
                    ->where('cancelled', '=', 0)
                    ->orderBy('meeting_start');
            }])
            ->get();

        return response()->json($schedule);
    }

    public function searchmeeting(Request $request)
    {
        $meeting_code = $request->query('code');

        if (empty(trim($meeting_code))) {
            return response()->json([
                'success' => '0',
                'message' => 'Meeting code must consist of 6 alphanumeric characters.'
            ]);
        }

        $today = Carbon::today()->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d');

        $meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->where('meeting_start', '>=', "$today 00:00:00")
            ->where('meeting_code', '=', $meeting_code)
            ->first();

        if (is_null($meeting)) {
            // return redirect()->back()->withErrors([
            //     'message' => 'Meeting tidak dapat ditemukan. Silahkan periksa kode yang anda masukkan.'
            // ]);
            return response()->json([
                'success' => '0',
                'message' => 'Meeting cannot be found, double check for any typos in the code you entered'
            ]);
        } else {
            // return redirect("meeting/" . $meeting->id);
            return response()->json([
                'success' => '1',
                'meeting' => $meeting
            ]);
        }
    }

    public function show($id)
    {
        if (empty(trim($id))) {
            return Redirect::route('homepage');
        }

        $meeting = Meeting::with(['user' => function ($query) {
            $query->select('id', 'name');
        }, 'client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name', 'rep_email', 'rep_phone');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic', 'meeting_code', 'cancelled', 'cancelled_date', 'cancelled_reason')
            ->find($id);

        if (is_null($meeting)) {
            return Inertia::render('Meeting', [
                'isFound' => false,
            ]);
        } else {
            $users = User::all();
            $clients = Client::all();

            return Inertia::render('Meeting', [
                'isFound' => true,
                'meeting' => $meeting,
                'users' => $users,
                'clients' => $clients
            ]);
        }
    }

    public function listmeetings(Request $request)
    {
        if ($request->user()->admin == 0) {
            return redirect('/');
        }

        $todays_time = Carbon::now()->setTimezone(env('APP_TIMEZONE'));
        $current_date = $todays_time->format('Y-m-d');
        $current_time = $todays_time->format('Y-m-d H:i:s');
        $tomorrow_date = Carbon::now()->setTimezone(env('APP_TIMEZONE'))->addDays(1)->format('Y-m-d');
        $thirty_mins = Carbon::now()->setTimezone(env('APP_TIMEZONE'))->addMinutes(30)->format('Y-m-d H:i:s');

        // info($current_time);
        // info($thirty_mins);

        $ongoing_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->where('meeting_start', '<=', $current_time)
            ->where('meeting_end', '>=', $current_time)
            ->where('cancelled', '=', 0)
            ->get();

        $thirtymins_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->whereBetween('meeting_start', [$current_time, $thirty_mins])
            ->where('cancelled', '=', 0)
            ->get();

        $todays_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->whereBetween('meeting_start', [$thirty_mins, "$current_date 23:59:59"])
            ->where('cancelled', '=', 0)
            ->orderBy('meeting_start')
            ->get();

        $future_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->where('meeting_start', '>', "$tomorrow_date 00:00:00")
            ->where('cancelled', '=', 0)
            ->orderBy('meeting_start')
            ->paginate(50);

        return response()->json([
            'ongoing_meeting' => $ongoing_meeting,
            'thirtymins_meeting' => $thirtymins_meeting,
            'todays_meeting' => $todays_meeting,
            'future_meeting' => $future_meeting
        ]);
    }

    public function pastmeetings(Request $request)
    {
        if ($request->user()->admin == 0) {
            return redirect('/');
        }

        $todays_time = Carbon::now()->setTimezone(env('APP_TIMEZONE'));
        $current_time = $todays_time->format('Y-m-d H:i:s');

        $past_meetings = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic')
            ->where('meeting_end', '<', $current_time)
            ->where('cancelled', '=', 0)
            ->orderBy('meeting_start', 'DESC')
            ->paginate(50);

        return response()->json($past_meetings);
    }

    public function cancelledmeetings(Request $request)
    {
        if ($request->user()->admin == 0) {
            return redirect('/');
        }

        $past_meetings = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }, 'user' => function ($query) {
            $query->select('id', 'name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'user_id', 'client_id', 'meeting_location', 'meeting_topic', 'cancelled_date', 'cancelled_reason')
            ->where('cancelled', '=', 1)
            ->orderBy('meeting_start', 'DESC')
            ->paginate(30);

        return response()->json($past_meetings);
    }

    public function mymeetings(Request $request)
    {
        $user_id = $request->user()->id;
        // $user_id = 4;
        $todays_time = Carbon::now()->setTimezone(env('APP_TIMEZONE'));
        $current_date = $todays_time->format('Y-m-d');
        $current_time = $todays_time->format('Y-m-d H:i:s');
        $tomorrow_date = Carbon::now()->setTimezone(env('APP_TIMEZONE'))->addDays(1)->format('Y-m-d');
        $thirty_mins = Carbon::now()->setTimezone(env('APP_TIMEZONE'))->addMinutes(30)->format('Y-m-d H:i:s');

        // info($current_time);
        // info($thirty_mins);

        $ongoing_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'client_id', 'meeting_location', 'meeting_topic')
            ->where('meeting_start', '<=', $current_time)
            ->where('meeting_end', '>=', $current_time)
            ->where('user_id', '=', $user_id)
            ->where('cancelled', '=', 0)
            ->get();

        $thirtymins_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'client_id', 'meeting_location', 'meeting_topic')
            ->whereBetween('meeting_start', [$current_time, $thirty_mins])
            ->where('user_id', '=', $user_id)
            ->where('cancelled', '=', 0)
            ->get();

        $todays_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'client_id', 'meeting_location', 'meeting_topic')
            ->whereBetween('meeting_start', [$thirty_mins, "$current_date 23:59:59"])
            ->where('user_id', '=', $user_id)
            ->where('cancelled', '=', 0)
            ->orderBy('meeting_start')
            ->get();

        $tomorrows_meeting = Meeting::with(['client' => function ($query) {
            $query->select('id', 'client_name', 'rep_name');
        }])
            ->select('id', 'meeting_start', 'meeting_end', 'client_id', 'meeting_location', 'meeting_topic')
            ->whereBetween('meeting_start', ["$tomorrow_date 00:00:00", "$tomorrow_date 23:59:59"])
            ->where('user_id', '=', $user_id)
            ->where('cancelled', '=', 0)
            ->orderBy('meeting_start')
            ->get();

        return response()->json([
            'ongoing_meeting' => $ongoing_meeting,
            'thirtymins_meeting' => $thirtymins_meeting,
            'todays_meeting' => $todays_meeting,
            'tomorrows_meeting' => $tomorrows_meeting
        ]);
    }

    public function store(Request $request)
    {
        $validator = $request->validate([
            'meeting_start' => 'required',
            'meeting_end' => 'required',
            'user_id' => 'required',
            'client_id' => 'required',
            'meeting_topic' => 'required',
        ]);

        $meeting_start = Carbon::parse($request->meeting_start)->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d H:i:s');
        $meeting_end = Carbon::parse($request->meeting_end)->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d H:i:s');

        $clashes = Meeting::where('user_id', $request->user_id)
            ->where('cancelled', '=', 0)
            ->where(function ($query) use ($meeting_start, $meeting_end) {
                $query->whereBetween('meeting_end', [$meeting_start, $meeting_end])
                    ->where('meeting_end', '<>', $meeting_start)
                    ->orWhere(function ($query) use ($meeting_start, $meeting_end) {
                        $query->whereBetween('meeting_start', [$meeting_start, $meeting_end])
                            ->where('meeting_start', '<>', $meeting_end);
                    })
                    ->orWhere(function ($query) use ($meeting_start, $meeting_end) {
                        $query->where('meeting_start', '<', $meeting_start)
                            ->where('meeting_end', '>', $meeting_end);
                    })
                    ->orWhere(function ($query) use ($meeting_start, $meeting_end) {
                        $query->where('meeting_start', '>', $meeting_start)
                            ->where('meeting_end', '<', $meeting_end);
                    });
            })
            ->get();

        if ($clashes->isEmpty()) {
            $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $charactersLength = strlen($characters);
            $randomString = '';
            for ($i = 0; $i < 6; $i++) {
                $randomString .= $characters[random_int(0, $charactersLength - 1)];
            }

            $new_code = $randomString;

            Meeting::create([
                'meeting_start' => $meeting_start,
                'meeting_end' => $meeting_end,
                'user_id' => $request->user_id,
                'client_id' => $request->client_id,
                'meeting_location' => $request->meeting_location,
                'meeting_topic' => $request->meeting_topic,
                'meeting_code' => $new_code,
            ]);

            $host = User::find($request->user_id);
            $client = Client::find($request->client_id);

            $host->notify(new UserMeetingScheduled($meeting_start, $meeting_end, $client->client_name, $client->rep_name, $host->name, $request->meeting_topic, $new_code));
            $client->notify(new ClientMeetingScheduled($meeting_start, $meeting_end, $client->rep_name, $host->name, $request->meeting_topic, $new_code));

            return Redirect::route("homepage");
        } else {
            return redirect()->back()->withErrors([
                'time_error' => 'This meething schedule is clashes with other meeting schedule. Please change the schedule to an empty schedule.'
            ]);
        }
    }

    public function update(Request $request)
    {
        $meeting_start = Carbon::parse($request->meeting_start)->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d H:i:s');
        $meeting_end = Carbon::parse($request->meeting_end)->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d H:i:s');

        $clashes = Meeting::where('user_id', $request->user_id)
            ->where('cancelled', '=', 0)
            ->where('id', '<>', $request->id)
            ->where(function ($query) use ($meeting_start, $meeting_end) {
                $query->whereBetween('meeting_end', [$meeting_start, $meeting_end])
                    ->where('meeting_end', '<>', $meeting_start)
                    ->orWhere(function ($query) use ($meeting_start, $meeting_end) {
                        $query->whereBetween('meeting_start', [$meeting_start, $meeting_end])
                            ->where('meeting_start', '<>', $meeting_end);
                    })
                    ->orWhere(function ($query) use ($meeting_start, $meeting_end) {
                        $query->where('meeting_start', '<', $meeting_start)
                            ->where('meeting_end', '>', $meeting_end);
                    });
            })
            ->get();

        if ($clashes->isEmpty()) {
            $meeting = Meeting::find($request->id);

            $meeting->update([
                'meeting_start' => $meeting_start,
                'meeting_end' => $meeting_end,
                'user_id' => $request->user_id,
                'client_id' => $request->client_id,
                'meeting_location' => $request->meeting_location,
                'meeting_topic' => $request->meeting_topic,
            ]);

            return Redirect::route('meeting', [
                'id' => $request->id
            ]);
        } else {
            return redirect()->back()->withErrors([
                'time_error' => 'This meething schedule is clashes with other meeting schedule. Please change the schedule to an empty schedule.'
            ]);
        }
    }

    public function cancel(Request $request)
    {
        $meeting = Meeting::find($request->id);

        $cancelled_date = Carbon::now()->setTimezone(env('APP_TIMEZONE'))->format('Y-m-d H:i:s');

        $meeting->update([
            'cancelled' => 1,
            'cancelled_date' => $cancelled_date,
            'cancelled_reason' => $request->cancelled_reason
        ]);

        return Redirect::route('meeting', [
            'id' => $request->id
        ]);
    }
}
