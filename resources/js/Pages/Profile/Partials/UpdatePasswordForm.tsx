import { useRef, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput, Label, Button } from 'flowbite-react';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '' }: { className?: string }) {
    const passwordInput = useRef<HTMLInputElement>();
    const currentPasswordInput = useRef<HTMLInputElement>();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // const updatePassword: FormEventHandler = (e) => {
    //     e.preventDefault();

    //     put(route('password.update'), {
    //         preserveScroll: true,
    //         onSuccess: () => reset(),
    //         onError: (errors) => {
    //             if (errors.password) {
    //                 reset('password', 'password_confirmation');
    //                 passwordInput.current?.focus();
    //             }

    //             if (errors.current_password) {
    //                 reset('current_password');
    //                 currentPasswordInput.current?.focus();
    //             }
    //         },
    //     });
    // };

    function submitForm() {
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Perbarui Password</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Pastikan menggunakan password yang panjang dan acak agar tetap terlindungi.
                </p>
            </header>

            <form className="mt-6 space-y-6"> {/* onSubmit={updatePassword} */}
                <div>
                    <Label htmlFor="current_password" value="Password sekarang" />

                    <TextInput
                        id="current_password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />

                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password" value="Password baru" />

                    <TextInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password_confirmation" value="Konfirmasi password" />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={submitForm} disabled={processing}>Simpan</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Password diperbarui.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
