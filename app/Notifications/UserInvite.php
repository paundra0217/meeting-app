<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvite extends Notification
{
    use Queueable;

    public $user_name;
    public $user_pass;
    public $app_link;

    /**
     * Create a new notification instance.
     */
    public function __construct($user_name, $user_pass)
    {
        $this->user_name = $user_name;
        $this->user_pass = $user_pass;
        $this->app_link = env('APP_URL');
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
                    ->subject('Meeting Appointment System Invitation')
                    ->greeting("Dear {$this->user_name},")
                    ->line("You are invited to use Meeting Appointment System. Here is the password: **{$this->user_pass}**.")
                    ->line('Steps to use the application:')
                    ->line("1. Open {$this->app_link} using your desired browser")
                    ->line("2. Login with the email that is used to receive this email, and password that was given from this email")
                    ->line("3. Immediately change the current password to your password that's memorable.")
                    ->line('For a time being, this application can be only accessed through PC only, either desktop or laptop. Please **do not share your password with anyone else, and keep it secret**')
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
