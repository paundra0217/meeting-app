export interface User {
    id: number;
    name: string;
    username: string;
    admin: number;
    email: string;
    email_verified_at: string;
}

export interface Client {
    id: number;
    client_name: string;
    rep_name: string;
    rep_email: string;
    rep_phone: string;
    client_address: string;
}

export interface Meeting {
    id: number;
    meeting_start: Date;
    meeting_end: Date;
    user: User;
    client: Client;
    meeting_location: string;
    meeting_topic: string;
    meeting_code: string;
    cancelled: number;
    cancelled_date: Date;
    cancelled_reason: string;
}

export interface Locations{
    [key: number]: string;
}

export interface selectOptions {

}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    users: User[];
    clients: Client[];
    meeting: Meeting;
    isFound: boolean;
};
