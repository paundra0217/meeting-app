<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class UserMeetingScheduled extends Notification
{
    use Queueable;

    public $meeting_date;
    public $meeting_start;
    public $meeting_end;
    public $host_name;
    public $client_name;
    public $rep_name;
    // public $meeting_location;
    public $meeting_code;
    public $meeting_topic;

    /**
     * Create a new notification instance.
     */
    public function __construct($meeting_start, $meeting_end, $client_name, $rep_name, $host_name, $meeting_topic, $meeting_code)
    {
        $this->meeting_date = Carbon::parse($meeting_start)->translatedFormat('l, d F Y');
        $this->meeting_start = Carbon::parse($meeting_start)->translatedFormat('H:i');
        $this->meeting_end = Carbon::parse($meeting_end)->translatedFormat('H:i');
        $this->client_name = $client_name;
        $this->rep_name = $rep_name;
        $this->host_name = $host_name;
        $this->meeting_topic = $meeting_topic;
        $this->meeting_code = $meeting_code;
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
            ->subject('Meeting Schedule Notification')
            ->greeting("Dear {$this->host_name}")
            ->line('New meeting has been scheduled with you. Following are the details:')
            ->line("- Date: {$this->meeting_date}")
            ->line("- Time: {$this->meeting_start} - {$this->meeting_end}")
            ->line("- Client: {$this->client_name} ({$this->rep_name})")
            ->line("- Topic: {$this->meeting_topic}")
            ->line("For more details, go to the application, then click \"Search by Code\", then enter this code: **{$this->meeting_code}**")
            ->line('If you have any questions or need help, please contact the administrator of this application.');
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
