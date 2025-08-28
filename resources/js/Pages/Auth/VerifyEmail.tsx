import GuestLayout from "@/Layouts/GuestLayout";
// import PrimaryButton from '@/Components/PrimaryButton';
import { Button } from "flowbite-react";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, could you verify your email address by clicking on the
                link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                {/* Terima kasih telah mendaftar. Sebelum mulai, anda perlu
                memverifikasi email anda dengan cara mengklik tautan yang kami
                telah kirim ke alamat email anda. Jika anda tidak mendapatkan
                tautannya, anda bisa periksa folder spam/junk anda terlebih
                dahulu, lalu anda bisa klik "Kirim ulang tautan verifikasi"
                untuk mendapatkannya lagi. */}
            </div>

            {status === "verification-link-sent" && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {/* Tautan verifikasi telah dikirim ke email yang anda gunakan
                    untuk pendaftaran. */}
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <Button type="submit" disabled={processing}>
                        Resend Verification Link
                    </Button>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Log out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
