<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class ClientMeetingScheduled extends Notification
{
    use Queueable;

    public $meeting_date;
    public $meeting_start;
    public $meeting_end;
    public $client_name;
    public $host_name;
    // public $meeting_location;
    public $meeting_topic;
    public $meeting_code;

    /**
     * Create a new notification instance.
     */
    public function __construct($meeting_start, $meeting_end, $client_name, $host_name, $meeting_topic, $meeting_code)
    {
        $this->meeting_date = Carbon::parse($meeting_start)->translatedFormat('l, d F Y');
        $this->meeting_start = Carbon::parse($meeting_start)->translatedFormat('H:i');
        $this->meeting_end = Carbon::parse($meeting_end)->translatedFormat('H:i');
        $this->client_name = $client_name;
        $this->host_name = $host_name;
        $this->meeting_code = $meeting_code;
        $this->meeting_topic = $meeting_topic;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->from('donotreply@company.com', 'Company Name')
                    ->subject('Notifikasi Penjadwalan Meeting')
                    ->greeting("Dear {$this->client_name}")
                    ->line('Your meeting schedule is as follows:')
                    ->line("- Meeting date: {$this->meeting_date}")
                    ->line("- Meeting time: {$this->meeting_start} - {$this->meeting_end}")
                    ->line("- Host: {$this->host_name}")
                    ->line("- Topic: {$this->meeting_topic}")
                    ->line("If our staff requires verification of this meeting and they need the meeting code, give them this: **{$this->meeting_code}**")
                    ->line('If you have any questions, or need to reschedule the meeting, please contact us.')
                    ->line('Thank you.')
                    ->salutation(config('app.company_name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
