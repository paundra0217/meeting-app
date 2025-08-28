import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect, FormEventHandler } from "react";
import { HiOutlineExclamationCircle, HiCheck } from "react-icons/hi2";
import {
    Button,
    Modal,
    Label,
    TextInput,
    Textarea,
    Select,
    Datepicker,
    Radio,
} from "flowbite-react";
import { Head, Link, useForm } from "@inertiajs/react";
import { PageProps, Locations } from "@/types";
import { DateTime } from "luxon";

export default function Dashboard({
    auth,
    users,
    clients,
    meeting,
    isFound,
}: PageProps) {
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [cancelMeeting, setCancelMeeting] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);

    const [selectedDate, setSelectedDate] = useState<Date>(
        meeting ? new Date(meeting.meeting_start) : new Date()
    );
    const [startTime, setStartTime] = useState<string>(
        DateTime.fromISO(
            meeting ? new Date(meeting.meeting_start).toISOString() : ""
        )
            .setZone("local")
            .setLocale('id-ID')
            .toLocaleString(DateTime.TIME_24_SIMPLE)
    );
    const [endTime, setEndTime] = useState<string>(
        DateTime.fromISO(
            meeting ? new Date(meeting.meeting_end).toISOString() : ""
        )
            .setZone("local")
            .setLocale('id-ID')
            .toLocaleString(DateTime.TIME_24_SIMPLE)
    );

    console.log(startTime)
    console.log(endTime)

    const [timeError, setTimeError] = useState<string>("");
    const [topicError, setTopicError] = useState<string>("");
    const [reasonError, setReasonError] = useState<string>("");

    const {
        data,
        setData,
        post,
        errors,
        reset,
        clearErrors,
        processing,
        recentlySuccessful,
    } = useForm({
        id: meeting ? meeting.id : 0,
        meeting_start: meeting ? meeting.meeting_start : new Date(),
        meeting_end: meeting ? meeting.meeting_end : new Date(),
        user_id: meeting ? meeting.user.id.toString() : "0",
        client_id: meeting ? meeting.client.id.toString() : "0",
        meeting_location: meeting ? meeting.meeting_location.toString() : "",
        meeting_topic: meeting ? meeting.meeting_topic : "",
        cancelled_reason: "",
    });

    const locations: Locations = {
        1: "Onsite (host's location)",
        2: "Onsite (client's location)",
        3: "Virtual",
    };

    let currentDate = DateTime.now();
    // currentDate = currentDate.plus({ day: 1 });
    const timeStart = DateTime.fromISO(
        meeting ? new Date(meeting.meeting_start).toISOString() : ""
    );


    useEffect(() => {
        if (recentlySuccessful) {
            setEditModal(false);
            setDeleteModal(false);
            setCancelMeeting(false);
            setSuccessModal(true);
        }
    }, [recentlySuccessful]);

    useEffect(() => {
        let [startHr, startMin] = startTime.split(".").map(Number);
        let [endHr, endMin] = endTime.split(".").map(Number);

        console.log(startHr + " " + startMin + " " + endHr + " " + endMin)

        let meetingStart = new Date(selectedDate);
        meetingStart.setHours(startHr);
        meetingStart.setMinutes(startMin);
        meetingStart.setSeconds(0);
        meetingStart.setMilliseconds(0);

        let meetingEnd = new Date(selectedDate);
        meetingEnd.setHours(endHr);
        meetingEnd.setMinutes(endMin);
        meetingEnd.setSeconds(0);
        meetingEnd.setMilliseconds(0);

        // console.log(meetingStart);

        setData((prevData) => ({
            ...prevData,
            meeting_start: meetingStart,
            meeting_end: meetingEnd,
            user_id: data.user_id,
            client_id: data.client_id,
            meeting_location: data.meeting_location,
            meeting_topic: data.meeting_topic,
        }));

        // console.log(data.meeting_start.getHours() + ' ' + data.meeting_end.getHours());

    }, [startTime, endTime, selectedDate, editModal]);

    function CloseModal() {
        reset();
        setReasonError("");
        setEditModal(false);
        setDeleteModal(false);
        setCancelMeeting(false);
        setSuccessModal(false);
    }

    function validateCancel() {
        setReasonError("");

        if (
            !data.cancelled_reason ||
            data.cancelled_reason.trim().length === 0
        ) {
            setReasonError("Cancellation reason is required.");
            return;
        }

        setCancelMeeting(false);
        setDeleteModal(true);
    }

    const submitForm: FormEventHandler = (e) => {
        // console.log(data);
        e.preventDefault();

        setTimeError("");
        setTopicError("");

        if (
            data.meeting_start.getHours() === data.meeting_end.getHours() &&
            data.meeting_start.getMinutes() === data.meeting_end.getMinutes()
        ) {
            setTimeError("Start and End Time cannot be the same.");
            return;
        }

        let minutesHigher =
            data.meeting_start.getHours() === data.meeting_end.getHours() &&
            data.meeting_start.getMinutes() > data.meeting_end.getMinutes();

        if (
            data.meeting_start.getHours() > data.meeting_end.getHours() ||
            minutesHigher
        ) {
            setTimeError(
                "Start Time must be earlier than End Time."
            );
            return;
        }

        if (!data.meeting_topic || data.meeting_topic.trim().length === 0) {
            setTopicError("Meeting topic is required.");
            return;
        }

        post(route("meeting.edit"), {
            onError: (err) => {
                setTimeError(err.time_error);
            },
            onFinish: () => { 
                reset();
                console.log(data.meeting_topic);
            }
        });
    };

    function confirmCancel() {
        post(route("meeting.cancel"));
    }

    const closeTab = () => {
        window.opener = null;
        window.open("", "_self");
        window.close();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Meeting Details
                </h2>
            }
        >
            <Head title="Meeting Details" />

            <Modal
                show={successModal}
                size="md"
                onClose={() => window.location.reload()}
                popup
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiCheck className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Operation succeeded.
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => window.location.reload()}>OK</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                show={deleteModal}
                size="md"
                onClose={() => {
                    setDeleteModal(false);
                    setCancelMeeting(true);
                }}
                popup
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            After cancelling, this meeting will not appear in the schedule and cannot be reverted. Are you sure?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button
                                color="failure"
                                onClick={() => confirmCancel()}
                                disabled={processing}
                            >
                                {"Yes"}
                            </Button>
                            <Button
                                color="gray"
                                onClick={() => {
                                    setDeleteModal(false);
                                    setCancelMeeting(true);
                                }}
                                disabled={processing}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={cancelMeeting} size="md" onClose={() => CloseModal()}>
                <Modal.Header>Cancel Meeting</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="cancelreason"
                                    value="Reason"
                                />
                            </div>
                            <Textarea
                                id="cancelreason"
                                onChange={(e) =>
                                    setData("cancelled_reason", e.target.value)
                                }
                                value={data.cancelled_reason}
                                required
                            />
                            <p className="mt-1 text-sm text-red-500">
                                {reasonError}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <Button
                            color="failure"
                            disabled={processing}
                            onClick={() => {
                                validateCancel();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing}
                            color="gray"
                            onClick={() => CloseModal()}
                        >
                            Return
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {isFound && (
                <Modal show={editModal} onClose={() => CloseModal()}>
                    <Modal.Header>Edit Meeting Schedule</Modal.Header>
                    <Modal.Body>
                        <form onSubmit={submitForm}>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex gap-4">
                                        <div className="w-full">
                                            <div className="mb-2 block">
                                                <Label
                                                    htmlFor="date"
                                                    value="Meeting Date"
                                                />
                                            </div>
                                            <Datepicker
                                                id="date"
                                                language="en-US"
                                                labelTodayButton="Today"
                                                labelClearButton="Clear"
                                                minDate={minDate}
                                                value={selectedDate.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        dateStyle: "long",
                                                    }
                                                )}
                                                onSelectedDateChanged={(e) => {
                                                    setSelectedDate(e);
                                                }}
                                            />
                                        </div>
                                        <div className="w-36">
                                            <div className="mb-2 block">
                                                <Label value="Start Time" />
                                            </div>
                                            <Select
                                                id="starttime"
                                                value={startTime}
                                                onChange={(e) =>
                                                    setStartTime(e.target.value)
                                                }
                                                required
                                            >
                                                <option value="09.00">
                                                    09.00
                                                </option>
                                                <option value="09.30">
                                                    09.30
                                                </option>
                                                <option value="10.00">
                                                    10.00
                                                </option>
                                                <option value="10.30">
                                                    10.30
                                                </option>
                                                <option value="11.00">
                                                    11.00
                                                </option>
                                                <option value="11.30">
                                                    11.30
                                                </option>
                                                <option value="12.00">
                                                    12.00
                                                </option>
                                                <option value="12.30">
                                                    12.30
                                                </option>
                                                <option value="13.00">
                                                    13.00
                                                </option>
                                                <option value="13.30">
                                                    13.30
                                                </option>
                                                <option value="14.00">
                                                    14.00
                                                </option>
                                                <option value="14.30">
                                                    14.30
                                                </option>
                                                <option value="15.00">
                                                    15.00
                                                </option>
                                                <option value="15.30">
                                                    15.30
                                                </option>
                                                <option value="16.00">
                                                    16.00
                                                </option>
                                                <option value="16.30">
                                                    16.30
                                                </option>
                                                <option value="17.00">
                                                    17.00
                                                </option>
                                                <option value="17.30">
                                                    17.30
                                                </option>
                                            </Select>
                                        </div>
                                        <div className="w-36">
                                            <div className="mb-2 block">
                                                <Label value="End Time" />
                                            </div>
                                            <div className="flex gap-4">
                                                <Select
                                                    id="endtime"
                                                    value={endTime}
                                                    onChange={(e) =>
                                                        setEndTime(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="09.30">
                                                        09.30
                                                    </option>
                                                    <option value="10.00">
                                                        10.00
                                                    </option>
                                                    <option value="10.30">
                                                        10.30
                                                    </option>
                                                    <option value="11.00">
                                                        11.00
                                                    </option>
                                                    <option value="11.30">
                                                        11.30
                                                    </option>
                                                    <option value="12.00">
                                                        12.00
                                                    </option>
                                                    <option value="12.30">
                                                        12.30
                                                    </option>
                                                    <option value="13.00">
                                                        13.00
                                                    </option>
                                                    <option value="13.30">
                                                        13.30
                                                    </option>
                                                    <option value="14.00">
                                                        14.00
                                                    </option>
                                                    <option value="14.30">
                                                        14.30
                                                    </option>
                                                    <option value="15.00">
                                                        15.00
                                                    </option>
                                                    <option value="15.30">
                                                        15.30
                                                    </option>
                                                    <option value="16.00">
                                                        16.00
                                                    </option>
                                                    <option value="16.30">
                                                        16.30
                                                    </option>
                                                    <option value="17.00">
                                                        17.00
                                                    </option>
                                                    <option value="17.30">
                                                        17.30
                                                    </option>
                                                    <option value="18.00">
                                                        18.00
                                                    </option>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-red-500 mt-1">
                                        {timeError}
                                    </p>
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label
                                            htmlFor="host"
                                            value="Host"
                                        />
                                    </div>
                                    <Select
                                        id="host"
                                        value={data.user_id}
                                        onChange={(e) =>
                                            setData("user_id", e.target.value)
                                        }
                                        required
                                    >
                                        {users.map((user) => {
                                            return (
                                                <option value={user.id}>
                                                    {user.name}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="client" value="Client" />
                                    </div>
                                    <Select
                                        id="client"
                                        value={data.client_id}
                                        onChange={(e) =>
                                            setData("client_id", e.target.value)
                                        }
                                        required
                                    >
                                        {clients.map((client) => {
                                            return (
                                                <option value={client.id}>
                                                    {client.client_name}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </div>
                                <div>
                                    <legend className="mb-2">
                                        Location
                                    </legend>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Radio
                                                id="office"
                                                name="location"
                                                checked={
                                                    data.meeting_location ===
                                                    "1"
                                                }
                                                onChange={(e) => {
                                                    e.target.checked === true &&
                                                        setData(
                                                            "meeting_location",
                                                            "1"
                                                        );
                                                }}
                                                defaultChecked
                                            />
                                            <Label htmlFor="office">
                                                Onsite (host's location)
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Radio
                                                id="onsite"
                                                name="location"
                                                checked={
                                                    data.meeting_location ===
                                                    "2"
                                                }
                                                onChange={(e) => {
                                                    e.target.checked === true &&
                                                        setData(
                                                            "meeting_location",
                                                            "2"
                                                        );
                                                }}
                                            />
                                            <Label htmlFor="onsite">
                                                Onsite (client's location)
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Radio
                                                id="virtual"
                                                name="location"
                                                checked={
                                                    data.meeting_location ===
                                                    "3"
                                                }
                                                onChange={(e) => {
                                                    e.target.checked === true &&
                                                        setData(
                                                            "meeting_location",
                                                            "3"
                                                        );
                                                }}
                                            />
                                            <Label htmlFor="virtual">
                                                Virtual (Zoom, Teams, Meet,
                                                etc.)
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label
                                            htmlFor="topic"
                                            value="Topic"
                                        />
                                    </div>
                                    <Textarea
                                        id="topic"
                                        placeholder="Monthly Meeting"
                                        onChange={(e) =>
                                            setData(
                                                "meeting_topic",
                                                e.target.value
                                            )
                                        }
                                        value={data.meeting_topic}
                                        required
                                    />
                                    <p className="text-sm text-red-500 mt-1">
                                        {topicError}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Button disabled={processing} type="submit">
                                    Schedule
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
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4">
                        {isFound ? (
                            <>
                                <div className="flex flex-col items-center gap-1 mb-4">
                                    {meeting.cancelled === 1 && (
                                        <div className="text-3xl text-red-500 font-bold mb-1">
                                            Meeting Cancelled
                                        </div>
                                    )}
                                    <div
                                        className={
                                            "text-3xl " +
                                            (meeting.cancelled === 1 &&
                                                "line-through")
                                        }
                                    >
                                        {DateTime.fromISO(
                                            new Date(
                                                meeting.meeting_start
                                            ).toISOString()
                                        )
                                            .setZone("local")
                                            .toLocaleString(
                                                DateTime.TIME_24_SIMPLE
                                            )}{" "}
                                        -{" "}
                                        {DateTime.fromISO(
                                            new Date(
                                                meeting.meeting_end
                                            ).toISOString()
                                        )
                                            .setZone("local")
                                            .toLocaleString(
                                                DateTime.TIME_24_SIMPLE
                                            )}
                                    </div>
                                    <div
                                        className={
                                            meeting.cancelled === 1
                                                ? "line-through"
                                                : ""
                                        }
                                    >
                                        {DateTime.fromISO(
                                            new Date(
                                                meeting.meeting_start
                                            ).toISOString()
                                        ).toLocaleString(DateTime.DATE_HUGE)}
                                    </div>
                                </div>
                                <table className="w-full">
                                    <tr
                                        className={
                                            "h-12 " +
                                            (meeting.cancelled === 1 &&
                                                "line-through")
                                        }
                                    >
                                        <th className="w-48">Meeting Code</th>
                                        <td>{meeting.meeting_code}</td>
                                    </tr>
                                    <tr className="h-12">
                                        <th>Host</th>
                                        <td>{meeting.user.name}</td>
                                    </tr>
                                    <tr className="h-12">
                                        <th>Client</th>
                                        <td>{meeting.client.client_name}</td>
                                    </tr>
                                    <tr className="h-12">
                                        <th>Representative</th>
                                        <td>
                                            {meeting.client.rep_name} (
                                            {meeting.client.rep_email} -{" "}
                                            {meeting.client.rep_phone})
                                        </td>
                                    </tr>
                                    <tr className="h-12">
                                        <th>Location</th>
                                        <td>
                                            {
                                                locations[
                                                    parseInt(
                                                        meeting.meeting_location
                                                    )
                                                ]
                                            }
                                        </td>
                                    </tr>
                                    <tr className="h-12">
                                        <th>Topic</th>
                                        <td>{meeting.meeting_topic}</td>
                                    </tr>
                                    {meeting.cancelled === 1 && (
                                        <>
                                            <tr className="h-12">
                                                <th className="text-red-500">
                                                    Cancelled Date
                                                </th>
                                                <td className="text-red-500">
                                                    {DateTime.fromISO(
                                                        new Date(
                                                            meeting.cancelled_date
                                                        ).toISOString()
                                                    ).toLocaleString(
                                                        DateTime.DATE_HUGE
                                                    )}
                                                </td>
                                            </tr>
                                            <tr className="h-12">
                                                <th className="text-red-500">
                                                    Reason
                                                </th>
                                                <td className="text-red-500">
                                                    {meeting.cancelled_reason}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </table>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <HiOutlineExclamationCircle className="mx-auto mb-2 h-16 w-16 text-gray-400 dark:text-gray-200" />
                                <div className="text-lg font-medium text-gray-900">
                                    Meeting cannot be found
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        {/* <Link href={route("dashboard")}>
                            
                        </Link> */}
                        <Button onClick={closeTab} color="light">
                            Return to Meeting Schedule
                        </Button>
                        {isFound &&
                            timeStart.diff(currentDate, "days").days > 0.5 &&
                            meeting.cancelled === 0 &&
                            auth.user.admin === 1 && (
                                <>
                                    <Button onClick={() => setEditModal(true)}>
                                        Edit Meeting Schedule
                                    </Button>
                                    <Button
                                        color="failure"
                                        onClick={() => setCancelMeeting(true)}
                                    >
                                        Cancel Meeting
                                    </Button>
                                </>
                            )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
