import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import { useState, useEffect, FormEventHandler } from "react";
import { HiOutlineExclamationCircle, HiCheck } from "react-icons/hi2";
import {
    TextInput,
    Button,
    Modal,
    Label,
    Pagination,
    Spinner,
} from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { PageProps, Client } from "@/types";

export default function Clients({ auth, clients }: PageProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [upsertMode, setUpsertMode] = useState<number>(0);

    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [listClients, setListClients] = useState<any>();

    const [searchName, setSearchName] = useState<string>("");
    const [searchInput, setSearchInput] = useState<string>("");

    const onPageChange = (page: number) => setCurrentPage(page);

    // const [clientName, setClientName] = useState<string>();
    // const [repName, setRepName] = useState<string>();
    // const [repEmail, setRepEmail] = useState<string>();
    // const [repPhone, setRepPhone] = useState<string>();
    // const [clientAddress, setClientAddress] = useState<string>();

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
        client_name: "",
        rep_name: "",
        rep_email: "",
        rep_phone: "",
        client_address: "",
    });

    useEffect(() => {
        if (recentlySuccessful) {
            setEditModal(false);
            setDeleteModal(false);
            setSuccessModal(true);
        }
    }, [recentlySuccessful]);

    useEffect(() => {
        function FetchClientList() {
            setIsLoading(true);
            fetch("/api/get-clients?name=" + searchName + "&page=" + currentPage)
                .then((response) => response.json())
                .then((d) => {
                    setTotalPages(d.last_page);
                    setListClients(d.data);
                    setIsLoading(false);
                });
        }
        FetchClientList();
        // console.log(listClients);
    }, [currentPage, recentlySuccessful, searchName]);

    function FetchClient(id: number, mode: number) {
        fetch("/api/client/" + id)
            .then((response) => response.json())
            .then((d) => {
                // setClientName(d.client_name)
                // setRepName(d.rep_name)
                // setRepEmail(d.rep_email)
                // setRepPhone(d.rep_phone)
                // setClientAddress(d.client_address)

                setData((prevData) => ({
                    ...prevData,
                    id: d.id,
                    client_name: d.client_name,
                    rep_name: d.rep_name,
                    rep_email: d.rep_email,
                    rep_phone: d.rep_phone,
                    client_address: d.client_address,
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

    function EditClient(id: number) {
        FetchClient(id, 1);
    }

    function DeleteClient(id: number) {
        FetchClient(id, 0);
    }

    function CloseModal() {
        clearErrors();
        setEditModal(false);
        setDeleteModal(false);
        setSuccessModal(false);
    }

    function CreateClient() {
        setData((prevData) => ({
            ...prevData,
            id: "",
            client_name: "",
            rep_name: "",
            rep_email: "",
            rep_phone: "",
            client_address: "",
        }));

        setUpsertMode(0);
        setEditModal(true);
    }

    // function validateForm() {
    //     // const newData = {
    //     //     client_name: clientName!,
    //     //     rep_name: repName!,
    //     //     rep_email: repEmail!,
    //     //     rep_phone: repPhone!,
    //     //     client_address: clientAddress!
    //     // }

    //     // setData({
    //     //     client_name: clientName!,
    //     //     rep_name: repName!,
    //     //     rep_email: repEmail!,
    //     //     rep_phone: repPhone!,
    //     //     client_address: clientAddress!
    //     // });

    //     submitForm();
    // }

    const submitForm: FormEventHandler = (e) => {
        console.log(data);
        e.preventDefault();

        if (upsertMode == 1) {
            patch(route("clients.edit"), {
                onSuccess: () => reset(),
            });
        } else {
            post(route("clients.create"), {
                onSuccess: () => reset(),
            });
        }

        console.log(errors);
    };

    function confirmDelete() {
        console.log(data);

        destroy(route("clients.delete"), {
            onFinish: () => reset(),
        });
    }

    function cancelSearch() {
        setCurrentPage(1);
        setSearchInput("");
        setSearchName("");
    }

    const search: FormEventHandler = (e) => {
        e.preventDefault();

        if (searchInput === "") return;

        setCurrentPage(1);
        setSearchName(searchInput);
    }

    // console.log(clients);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Client
                </h2>
            }
        >
            <Head title="Client" />

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
                            Operation succeded.
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => CloseModal()}>OK</Button>
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
                            Delete this client?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button
                                disabled={processing}
                                color="failure"
                                onClick={() => confirmDelete()}
                            >
                                {"Yes"}
                            </Button>
                            <Button
                                disabled={processing}
                                color="gray"
                                onClick={() => setDeleteModal(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={editModal} onClose={() => CloseModal()}>
                <Modal.Header>
                    {upsertMode == 1 ? "Edit" : "Add"} Client
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                        If the client is an individual, use the same name for the representative
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={submitForm}>
                        <div className="space-y-6">
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="name" value="Client Name" />
                                </div>
                                <TextInput
                                    id="name"
                                    placeholder="John Doe Company"
                                    value={data.client_name}
                                    onChange={(e) =>
                                        setData("client_name", e.target.value)
                                    }
                                />
                                {/* {errors.rep_name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        Nama Klien wajib diisi.
                                    </p>
                                )} */}
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.client_name}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="representative"
                                        value="Client Representative"
                                    />
                                </div>
                                <TextInput
                                    id="representative"
                                    placeholder="John Doe"
                                    value={data.rep_name}
                                    onChange={(e) =>
                                        setData("rep_name", e.target.value)
                                    }
                                />
                                {/* {errors.rep_name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        Nama Perwakilan wajib diisi.
                                    </p>
                                )} */}
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.rep_name}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="email"
                                        value="Client Representative Email"
                                    />
                                </div>
                                <TextInput
                                    id="email"
                                    placeholder="john@johndoeco.com"
                                    value={data.rep_email}
                                    onChange={(e) =>
                                        setData("rep_email", e.target.value)
                                    }
                                />
                                {/* {errors.rep_email && (
                                    <p className="text-sm text-red-500 mt-1">
                                        Email harus wajib diisi dan sesuai
                                        dengan format email.
                                    </p>
                                )} */}
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.rep_email}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="email"
                                        value="Client Representative Phone Number"
                                    />
                                </div>
                                <TextInput
                                    id="email"
                                    type="number"
                                    placeholder="08123456789012"
                                    value={data.rep_phone}
                                    onChange={(e) =>
                                        setData("rep_phone", e.target.value)
                                    }
                                />
                                {/* {errors.rep_phone && (
                                    <p className="text-sm text-red-500 mt-1">
                                        Nomor Telepon Klien wajib diisi dan
                                        hanya berisi angka.
                                    </p>
                                )} */}
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.rep_phone}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="address" value="Client Address" />
                                </div>
                                <TextInput
                                    id="address"
                                    placeholder="Smith Street"
                                    value={data.client_address}
                                    onChange={(e) =>
                                        setData(
                                            "client_address",
                                            e.target.value
                                        )
                                    }
                                />
                                {/* {errors.rep_name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        Alamat Klien wajib diisi.
                                    </p>
                                )} */}
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.client_address}
                                </p>
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
                                    <TextInput
                                        placeholder="Search clients..."
                                        disabled={isLoading}
                                        id="name"
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <Button disabled={isLoading} type="submit">
                                Search
                            </Button>
                            {searchName !== "" && (
                                <Button
                                    disabled={isLoading}
                                    color="failure"
                                    onClick={cancelSearch}
                                >
                                    Cancel
                                </Button>
                            )}
                        </form>
                        <Button onClick={() => CreateClient()}>
                            Add Client
                        </Button>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4">
                        {isLoading ? (
                            <div className="flex justify-center my-4">
                                <Spinner className="w-16 h-16" />
                            </div>
                        ) :
                        listClients.length > 0 ? (
                            <table className="w-full rounded-lg">
                                <tr className="h-8 border-2">
                                    {/* <th className="px-2 border-r-2">No</th> */}
                                    <th className="border-r-2">Client</th>
                                    <th className="border-r-2">
                                        Client Representative
                                    </th>
                                    <th className="border-r-2">Client Address</th>
                                    <th className="w-44 border-r-2">
                                        Actions
                                    </th>
                                </tr>
                                {listClients.map((client: any) => {
                                    return (
                                        <tr className="h-16 border-2">
                                            {/* <th className="p-2 border-r-2">{i}</th> */}
                                            <td className="p-2 border-r-2">
                                                {client.client_name}
                                            </td>
                                            <td className="p-2 border-r-2">
                                                {client.rep_name +
                                                    " (" +
                                                    client.rep_email +
                                                    " - " +
                                                    client.rep_phone +
                                                    ")"}
                                            </td>
                                            <td className="p-2 border-r-2">
                                                {client.client_address}
                                            </td>
                                            <td className="p-2 border-r-2">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            EditClient(
                                                                client.id
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            DeleteClient(
                                                                client.id
                                                            )
                                                        }
                                                        color="failure"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </table>
                        ) : (
                            <div className="flex justify-center my-4">
                                <p className="italic">No clients available. {
                                    searchName === "" && (
                                        <>
                                            Add client by clicking "Add Client".
                                        </> 
                                    )
                                } </p>
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
