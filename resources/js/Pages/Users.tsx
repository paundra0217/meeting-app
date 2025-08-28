import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import { useState, useEffect, FormEventHandler } from "react";
import {
    HiOutlineExclamationCircle,
    HiCheck,
    HiMiniXMark,
} from "react-icons/hi2";
import {
    TextInput,
    Button,
    Modal,
    Label,
    Checkbox,
    Pagination,
    Spinner,
} from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function Dashboard({ users, auth }: PageProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [upsertMode, setUpsertMode] = useState<number>(0);

    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [listUsers, setListUsers] = useState<any>();

    const [searchName, setSearchName] = useState<string>("");
    const [searchInput, setSearchInput] = useState<string>("");

    const onPageChange = (page: number) => setCurrentPage(page);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        reset,
        errors,
        processing,
        recentlySuccessful,
        clearErrors,
    } = useForm({
        id: "",
        name: "",
        email: "",
        phone: "",
        admin: 0,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            setEditModal(false);
            setDeleteModal(false);
            setSuccessModal(true);
            setCurrentPage(1);
        }
    }, [recentlySuccessful]);

    useEffect(() => {
        function FetchUserList() {
            setIsLoading(true);
    
            fetch("/api/get-users?name=" + searchName + "&page=" + currentPage)
                .then((response) => response.json())
                .then((d) => {
                    setTotalPages(d.last_page);
                    setListUsers(d.data);
                    setIsLoading(false);
                });
        }
        FetchUserList();
        // console.log(listUsers);
    }, [currentPage, recentlySuccessful, searchName]);

    function CreateUser() {
        setData((prevData) => ({
            ...prevData,
            id: "",
            name: "",
            email: "",
            phone: "",
            admin: 0,
        }));

        setUpsertMode(0);
        setEditModal(true);
    }

    function FetchUser(id: number, mode: number) {
        fetch("/api/user/" + id)
            .then((response) => response.json())
            .then((d) => {
                // setClientName(d.client_name)
                // setRepName(d.rep_name)
                // setRepEmail(d.rep_email)
                // setRepPhone(d.rep_phone)
                // setClientAddress(d.client_address)

                console.log(d);

                setData((prevData) => ({
                    ...prevData,
                    id: d.id,
                    name: d.name,
                    email: d.email,
                    phone: d.phone,
                    admin: d.admin,
                }));

                // setUpdateForm(true);
                // setUpdateForm(false);
            })
            .finally(() => {
                if (mode == 1) {
                    setUpsertMode(1);
                    setEditModal(true);
                } else {
                    setDeleteModal(true);
                }
            });

        console.log(data);
    }

    function EditUser(id: number) {
        FetchUser(id, 1);
    }

    function DeleteUser(id: number) {
        FetchUser(id, 0);
    }

    function CloseModal() {
        clearErrors();
        setEditModal(false);
        setDeleteModal(false);
        setSuccessModal(false);
    }

    function confirmDelete() {
        console.log(data);

        destroy(route("users.delete"), {
            onFinish: () => reset(),
        });
    }

    function cancelSearch() {
        setCurrentPage(1);
        setSearchInput("");
        setSearchName("");
    }

    const submitForm: FormEventHandler = (e) => {
        e.preventDefault();

        if (upsertMode == 1) {
            patch(route("users.edit"), {
                onSuccess: () => reset(),
            });
        } else {
            post(route("users.create"), {
                onSuccess: () => reset(),
            });
        }

        console.log(errors);
    };

    const search: FormEventHandler = (e) => {
        e.preventDefault();

        if (searchInput === "") return;

        setCurrentPage(1);
        setSearchName(searchInput);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Users
                </h2>
            }
        >
            <Head title="Users" />

            <Modal
                show={successModal}
                size="md"
                onClose={() => CloseModal()}
                popup
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiCheck className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Operasi berhasil dilakukan.{" "}
                            {upsertMode == 0 &&
                                "Password dari pengguna tersebut akan dikirimkan melalui email ke email pengguna."}
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => setSuccessModal(false)}>
                                OK
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                show={deleteModal}
                size="md"
                onClose={() => CloseModal()}
                popup
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            After deleting, this user will not able to access this application and cannot be reverted. Are you sure?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button
                                color="failure"
                                onClick={() => confirmDelete()}
                                disabled={processing}
                            >
                                {"Yes"}
                            </Button>
                            <Button
                                color="gray"
                                onClick={() => CloseModal()}
                                disabled={processing}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={editModal} onClose={() => CloseModal()}>
                <Modal.Header>
                    {upsertMode == 1 ? "Edit" : "Add"} User
                    {upsertMode == 1 && (
                        <p className="text-sm mt-1">
                            For security reasons, password can only be changed by that user.
                        </p>
                    )}
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={submitForm}>
                        <div className="space-y-6">
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="name"
                                        value="Name"
                                    />
                                </div>
                                <TextInput
                                    id="name"
                                    placeholder="Alice"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    value={data.name}
                                />
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.name}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="email" value="Email" />
                                </div>
                                <TextInput
                                    id="email"
                                    placeholder="Alice@example.com"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    value={data.email}
                                />
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.email}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="phone"
                                        value="Phone Number"
                                    />
                                </div>
                                <TextInput
                                    id="phone"
                                    type="number"
                                    placeholder="081234567890"
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    value={data.phone}
                                />
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.phone}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="admin"
                                    checked={data.admin === 1}
                                    onChange={(e) =>
                                        setData(
                                            "admin",
                                            e.target.checked === true ? 1 : 0
                                        )
                                    }
                                />
                                <Label htmlFor="admin" className="flex">
                                    Admin
                                </Label>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button disabled={processing} type="submit">
                                {upsertMode == 1 ? "Edit" : "Add"}
                            </Button>
                            <Button
                                disabled={processing}
                                color="gray"
                                onClick={() => CloseModal()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <form onSubmit={search} className="flex gap-2">
                            <div className="flex items-center gap-4">
                                <div className="w-64">
                                    <TextInput placeholder="Search users..." disabled={isLoading} id="name" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                                </div>
                            </div>
                            <Button disabled={isLoading} type="submit">Search</Button>
                            {
                                searchName !== "" && (
                                    <Button disabled={isLoading} color="failure" onClick={cancelSearch}>Cancel</Button>
                                )
                            }
                        </form>
                        <Button disabled={isLoading} onClick={() => CreateUser()}>
                            Add User
                        </Button>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4">
                        {isLoading ? (
                            <div className="flex justify-center my-4">
                                <Spinner className="w-16 h-16" />
                            </div>
                        ) : 
                            listUsers.length > 0 ? (
                            <table className="w-full rounded-lg">
                                <tr className="h-8 border-2">
                                    <th className="border-r-2">Name</th>
                                    <th className="w-32 border-r-2">Role</th>
                                    <th className="w-44">Actions</th>
                                </tr>
                                {listUsers.map((user: any) => {
                                    return (
                                        <tr className="h-16 border-2">
                                            <td className="p-2 border-r-2">
                                                {user.name +
                                                    " (" +
                                                    user.email +
                                                    ")"}
                                            </td>
                                            <td className="p-2 border-r-2">
                                                {user.admin == 1
                                                    ? "Admin"
                                                    : "User"}
                                            </td>
                                            <td className="p-2 border-r-2">
                                                {user.id == auth.user.id ? (
                                                    "This is yourself"
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() =>
                                                                EditUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            color="failure"
                                                            onClick={() =>
                                                                DeleteUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </table>
                        ) : (
                            <div className="flex justify-center my-4">
                                <p className="italic">Users are not available</p>
                            </div>
                        )}
                    </div>
                    <div>
                        {!isLoading && (
                            <div className="flex overflow-x-auto sm:justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={onPageChange}
                                    nextLabel=" "
                                    previousLabel=" "
                                    showIcons
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
