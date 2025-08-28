import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Cells from "@/Components/MeetingCells";
import { useState, useEffect, useCallback, FormEventHandler } from "react";
import { HiCheck, HiOutlineExclamationCircle } from "react-icons/hi2";
import {
    Datepicker,
    Button,
    TextInput,
    Modal,
    Label,
    Select,
    Textarea,
    Spinner,
    Radio,
} from "flowbite-react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Locations, PageProps } from "@/types";
import { DateTime } from "luxon";

export default function Dashboard({ auth, users, clients }: PageProps) {
    const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
    const [meetingDate, setMeetingDate] = useState<Date>(new Date());

    const [editModal, setEditModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [noClientsModal, setNoClientsModal] = useState<boolean>(false);
    const [searchMeetingModal, setSearchMeetingModal] =
        useState<boolean>(false);

    const [meetingCode, setMeetingCode] = useState<string>("");
    const [onSearching, setOnSearching] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<any>(undefined);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);

    const [selectedDate, setSelectedDate] = useState<Date>(minDate);
    const [startTime, setStartTime] = useState<string>("09.00");
    const [endTime, setEndTime] = useState<string>("09.30");

    const [timeError, setTimeError] = useState<string>("");
    const [topicError, setTopicError] = useState<string>("");
    const [meetings, setMeetings] = useState<any>();

    const [timeLine, setTimeLine] = useState<Number>(0);
    const [lineStats, setLineStats] = useState<string>("none");

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const {
        data,
        setData,
        post,
        reset,
        errors,
        processing,
        recentlySuccessful,
        clearErrors,
    } = useForm({
        meeting_start: new Date(),
        meeting_end: new Date(),
        client_id: clients.length > 0 ? clients[0].id.toString() : 0,
        user_id: users[0].id.toString(),
        meeting_location: "1",
        meeting_topic: "",
    });

    const locations: Locations = {
        1: "bg-cyan-600",
        2: "bg-lime-400",
        3: "bg-amber-400",
    };

    const location_name: Locations = {
        1: "Dalam Kantor",
        2: "Lokasi Klien",
        3: "Virtual",
    };

    const refreshClock = useCallback(() => {
        let time = DateTime.now();
        // time = time.minus({ hours: 8, minutes: 0});
        // let time = DateTime.fromObject({ hour: 17, minute: 30});
        setCurrentTime(time);
        updateTimeline(time);
    }, [setCurrentTime]);

    useEffect(() => {
        const timerID = setInterval(refreshClock, 100);

        return function cleanup() {
            clearInterval(timerID);
        };
    }, [refreshClock]);

    useEffect(() => {
        let [startHr, startMin] = startTime.split(".").map(Number);
        let [endHr, endMin] = endTime.split(".").map(Number);

        // console.log(startHr + " " + startMin + " " + endHr + " " + endMin)

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
    }, [startTime, endTime, selectedDate]);

    useEffect(() => {
        if (recentlySuccessful) {
            setEditModal(false);
            setSuccessModal(true);
        }
    }, [recentlySuccessful]);

    useEffect(() => {
        fetchMeetings();
    }, [meetingDate, recentlySuccessful]);

    function updateTimeline(now: DateTime) {
        const start = DateTime.fromObject({ hour: 9, minute: 0 });
        const end = DateTime.fromObject({ hour: 18, minute: 0 });

        const total = end.diff(start, "minutes").minutes;
        const elapsed = now.diff(start, "minutes").minutes;

        const percentage = elapsed / total;

        // console.log(percentage, elapsed, total, Math.floor(960 * percentage));

        const selectedDT = DateTime.fromJSDate(meetingDate);
        const isToday =
            selectedDT.hasSame(now, "day") &&
            selectedDT.hasSame(now, "month") &&
            selectedDT.hasSame(now, "year");

        // && isToday

        if (percentage > 0 && percentage < 1 && isToday) {
            setLineStats("block");
            setTimeLine(Math.ceil(960 * percentage));
        } else {
            setLineStats("none");
            setTimeLine(0);
        }
    }

    function fetchMeetings() {
        setIsLoading(true);
        setMeetings(undefined);

        fetch("/api/get-meetings/" + meetingDate.toISOString())
            .then((response) => response.json())
            .then((d) => setMeetings(d))
            .then(() => setIsLoading(false));
    }

    function FetchSingleMeeting() {
        setSearchResult(undefined);
        setOnSearching(true);

        fetch("/api/search-meeting?code=" + meetingCode)
            .then((response) => response.json())
            .then((d) => setSearchResult(d))
            .then(() => setOnSearching(false));
    }

    function ClearSearchResult() {
        setSearchResult(undefined);
        setMeetingCode("");
    }

    function CreateMeeting() {
        if (clients.length > 0) {
            setEditModal(true);
        } else {
            setNoClientsModal(true);
        }
    }

    function CloseModal() {
        clearErrors();
        setNoClientsModal(false);
        setSearchMeetingModal(false);
        setEditModal(false);
        setSuccessModal(false);
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
            setTimeError("Waktu mulai dan waktu selesai tidak bisa sama.");
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
                "Waktu mulai harus lebih awal daripada waktu selesai."
            );
            return;
        }

        if (!data.meeting_topic || data.meeting_topic.trim().length === 0) {
            setTopicError("Topik meeting wajib diisi.");
            return;
        }

        post(route("meetings.create"), {
            onError: (err) => {
                setTimeError(err.time_error);
            },
            onSuccess: () => {
                setStartTime("09.00");
                setEndTime("09.30");
                reset();
            },
        });
    };

    // console.log(meetings);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Meeting Schedule
                </h2>
            }
        >
            <Head title="Meeting Schedule" />

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
                            Operation Succeed.
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => CloseModal()}>OK</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                show={noClientsModal}
                size="md"
                onClose={() => CloseModal()}
                popup
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            {auth.user.admin === 1 ? (
                                <>
                                    No clients available. Start adding client in
                                    Client page.
                                </>
                            ) : (
                                <>
                                    No clients available. Contact your
                                    administrator to add a client.
                                </>
                            )}
                        </h3>
                        <div className="flex justify-center gap-4">
                            {auth.user.admin === 1 ? (
                                <Link href="/clients">
                                    <Button>Go</Button>
                                </Link>
                            ) : (
                                <Button onClick={() => CloseModal()}>OK</Button>
                            )}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={searchMeetingModal} onClose={() => CloseModal()}>
                <Modal.Header>Search Meeting by Code</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-sm opacity-50">
                            <span>
                                Meeting that can be search using this form are{" "}
                            </span>
                            <span className="underline font-bold">
                                today and future meetings.
                            </span>
                            <br></br>
                            <br></br>
                            {auth.user.admin === 1 && (
                                <span>
                                    For finding past or cancelled meetings,
                                    please go to{" "}
                                    <Link
                                        className="font-bold hover:underline"
                                        href="/list-meetings"
                                    >
                                        Meeting List
                                    </Link>
                                    , then go to "Past Meetings" tab or
                                    "Cancelled Meetings" tab.
                                </span>
                            )}
                        </p>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="code" value="Meeting Code" />
                            </div>
                            <TextInput
                                id="code"
                                onChange={(e) =>
                                    setMeetingCode(
                                        e.target.value.toUpperCase().trim()
                                    )
                                }
                                placeholder="ABCDEF"
                                maxLength={6}
                                value={meetingCode}
                                required
                            />
                            {searchResult && searchResult.success === "0" && (
                                <p className="mt-1 text-sm text-red-500">
                                    {searchResult.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <Button
                            disabled={onSearching}
                            onClick={() => {
                                FetchSingleMeeting();
                            }}
                        >
                            Search
                        </Button>
                        {searchResult && searchResult.success === "1" && (
                            <Button
                                color="light"
                                onClick={() => {
                                    ClearSearchResult();
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <div>
                        {searchResult && searchResult.success === "1" && (
                            <div className="flex flex-col items-center mt-8 gap-2">
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl">
                                        {DateTime.fromJSDate(
                                            new Date(
                                                searchResult.meeting.meeting_start
                                            )
                                        ).toLocaleString(
                                            DateTime.TIME_24_SIMPLE
                                        )}
                                        {" - "}
                                        {DateTime.fromJSDate(
                                            new Date(
                                                searchResult.meeting.meeting_end
                                            )
                                        ).toLocaleString(
                                            DateTime.TIME_24_SIMPLE
                                        )}
                                    </div>
                                    <div className="text-sm">
                                        {DateTime.fromJSDate(
                                            new Date(
                                                searchResult.meeting.meeting_start
                                            )
                                        ).toLocaleString(DateTime.DATE_HUGE)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div>
                                        Host: {searchResult.meeting.user.name}
                                        {" - "}
                                        Location:{" "}
                                        {
                                            location_name[
                                                searchResult.meeting
                                                    .meeting_location
                                            ]
                                        }
                                    </div>
                                    <div>
                                        Client:{" "}
                                        {
                                            searchResult.meeting.client
                                                .client_name
                                        }{" "}
                                        ({searchResult.meeting.client.rep_name})
                                    </div>
                                    <div>
                                        Topic:{" "}
                                        {searchResult.meeting.meeting_topic}
                                    </div>
                                </div>
                                <a
                                    href={"/meeting/" + searchResult.meeting.id}
                                    target="_blank"
                                >
                                    <Button className="mt-2">Details</Button>
                                </a>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={editModal} onClose={() => CloseModal()}>
                <Modal.Header>Schedule Meeting</Modal.Header>
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
                                            showTodayButton={false}
                                            showClearButton={false}
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
                                            <option value="09.00">09.00</option>
                                            <option value="09.30">09.30</option>
                                            <option value="10.00">10.00</option>
                                            <option value="10.30">10.30</option>
                                            <option value="11.00">11.00</option>
                                            <option value="11.30">11.30</option>
                                            <option value="12.00">12.00</option>
                                            <option value="12.30">12.30</option>
                                            <option value="13.00">13.00</option>
                                            <option value="13.30">13.30</option>
                                            <option value="14.00">14.00</option>
                                            <option value="14.30">14.30</option>
                                            <option value="15.00">15.00</option>
                                            <option value="15.30">15.30</option>
                                            <option value="16.00">16.00</option>
                                            <option value="16.30">16.30</option>
                                            <option value="17.00">17.00</option>
                                            <option value="17.30">17.30</option>
                                        </Select>
                                    </div>
                                    <div className="w-36">
                                        <div className="mb-2 block">
                                            <Label value="End Time" />
                                        </div>
                                        <Select
                                            id="endtime"
                                            value={endTime}
                                            onChange={(e) =>
                                                setEndTime(e.target.value)
                                            }
                                            required
                                        >
                                            <option value="09.30">09.30</option>
                                            <option value="10.00">10.00</option>
                                            <option value="10.30">10.30</option>
                                            <option value="11.00">11.00</option>
                                            <option value="11.30">11.30</option>
                                            <option value="12.00">12.00</option>
                                            <option value="12.30">12.30</option>
                                            <option value="13.00">13.00</option>
                                            <option value="13.30">13.30</option>
                                            <option value="14.00">14.00</option>
                                            <option value="14.30">14.30</option>
                                            <option value="15.00">15.00</option>
                                            <option value="15.30">15.30</option>
                                            <option value="16.00">16.00</option>
                                            <option value="16.30">16.30</option>
                                            <option value="17.00">17.00</option>
                                            <option value="17.30">17.30</option>
                                            <option value="18.00">18.00</option>
                                        </Select>
                                    </div>
                                </div>
                                <p className="text-sm text-red-500 mt-1">
                                    {timeError}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="host" value="Host" />
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
                                    {clients.length <= 0 ? (
                                        <option disabled selected>
                                            Klien tidak ada.{" "}
                                            {auth.user.admin === 1 && (
                                                <>
                                                    Tambah klien di halaman
                                                    Klien.
                                                </>
                                            )}
                                        </option>
                                    ) : (
                                        clients.map((client) => {
                                            return (
                                                <option value={client.id}>
                                                    {client.client_name}
                                                </option>
                                            );
                                        })
                                    )}
                                </Select>
                            </div>
                            <div>
                                <legend className="mb-2">Location</legend>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="office"
                                            name="location"
                                            checked={
                                                data.meeting_location === "1"
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
                                                data.meeting_location === "2"
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
                                                data.meeting_location === "3"
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
                                            Virtual (Zoom, Teams, Meet, etc.)
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="topic" value="Topic" />
                                </div>
                                <Textarea
                                    id="topic"
                                    placeholder="Monthly meeting"
                                    onChange={(e) =>
                                        setData("meeting_topic", e.target.value)
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

            <div className="py-12">
                <div className="max-w-7xl min-h-fit mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex gap-4 items-center">
                            <p>View meeting at:</p>
                            <div>
                                <Datepicker
                                    language="en-US"
                                    labelTodayButton="Today"
                                    labelClearButton="Clear"
                                    value={meetingDate.toLocaleDateString(
                                        "en-US",
                                        {
                                            dateStyle: "long",
                                        }
                                    )}
                                    onSelectedDateChanged={(e) =>
                                        setMeetingDate(e)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    const newDate = meetingDate;
                                    newDate.setDate(newDate.getDate() - 1);
                                    setMeetingDate(newDate);
                                    fetchMeetings();
                                }}
                                color="light"
                                disabled={isLoading}
                            >
                                Previous Day
                            </Button>
                            <Button
                                onClick={() => {
                                    const newDate = meetingDate;
                                    newDate.setDate(newDate.getDate() + 1);
                                    setMeetingDate(newDate);
                                    fetchMeetings();
                                }}
                                color="light"
                                disabled={isLoading}
                            >
                                Next Day
                            </Button>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-4xl">
                                {currentTime?.toLocaleString(
                                    DateTime.TIME_WITH_SECONDS
                                )}
                            </div>
                            <div className="text-sm">
                                {currentTime?.toLocaleString(
                                    DateTime.DATE_HUGE
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4">
                        {isLoading ? (
                            <div className="w-full h-32 flex items-center justify-center">
                                <Spinner className="h-16 w-16" />
                            </div>
                        ) : (
                            <table className="w-full rounded-lg">
                                <tr className="h-8 border-2">
                                    <th className="w-64">Host</th>
                                    <td className="w-0 border-r-2"></td>
                                    <th className="w-14">09.00</th>
                                    <th className="w-14">09.30</th>
                                    <th className="w-14">10.00</th>
                                    <th className="w-14">10.30</th>
                                    <th className="w-14">11.00</th>
                                    <th className="w-14">11.30</th>
                                    <th className="w-14">12.00</th>
                                    <th className="w-14">12.30</th>
                                    <th className="w-14">13.00</th>
                                    <th className="w-14">13.30</th>
                                    <th className="w-14">14.00</th>
                                    <th className="w-14">14.30</th>
                                    <th className="w-14">15.00</th>
                                    <th className="w-14">15.30</th>
                                    <th className="w-14">16.00</th>
                                    <th className="w-14">16.30</th>
                                    <th className="w-14">17.00</th>
                                    <th className="w-14">17.30</th>
                                </tr>
                                {meetings &&
                                    meetings.map((m: any) => {
                                        const isoPrevDate =
                                            meetingDate.getFullYear() +
                                            "-" +
                                            (meetingDate.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0") +
                                            "-" +
                                            meetingDate.getDate() +
                                            "T09:00:00" + 
                                            DateTime.local().toFormat("ZZ");
                                        let prevDate =
                                            DateTime.fromISO(isoPrevDate);
                                        return (
                                            <tr className="border-2">
                                                <td className="p-2 h-12">
                                                    {m.name.substring(0, 24)}{" "}
                                                    {m.name.length >= 24 &&
                                                        "..."}
                                                </td>
                                                <td className="border-r-2 w-0 p-0 m-0 h-12">
                                                    <div
                                                        style={{
                                                            left:
                                                                timeLine.toString() +
                                                                "px",
                                                            display: lineStats,
                                                        }}
                                                        className="relative w-0.5 h-full bg-rose-500"
                                                    ></div>
                                                </td>
                                                {m.meetings.map((e: any) => {
                                                    let meetingStart =
                                                        DateTime.fromISO(
                                                            e.meeting_start
                                                        ).setZone(
                                                            "local"
                                                        );
                                                    let meetingEnd =
                                                        DateTime.fromISO(
                                                            e.meeting_end
                                                        ).setZone(
                                                            "local"
                                                        );
                                                    let prevDiffs =
                                                        meetingStart.diff(
                                                            prevDate,
                                                            "hours"
                                                        ).hours * 2;
                                                    let meetingLen =
                                                        meetingEnd.diff(
                                                            meetingStart,
                                                            "hours"
                                                        ).hours * 2;
                                                    prevDate = meetingEnd;
                                                    console.log(meetingStart.toISO());
                                                    return (
                                                        <>
                                                            {prevDiffs > 0 && (
                                                                <td
                                                                    className="p-0 m-0"
                                                                    colSpan={
                                                                        prevDiffs
                                                                    }
                                                                ></td>
                                                            )}
                                                            <td
                                                                className="p-0 m-0"
                                                                colSpan={
                                                                    meetingLen
                                                                }
                                                            >
                                                                <a
                                                                    target="_blank"
                                                                    href={
                                                                        "meeting/" +
                                                                        e.id
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            "h-12 w-full rounded-xl " +
                                                                            locations[
                                                                                parseInt(
                                                                                    e.meeting_location
                                                                                )
                                                                            ]
                                                                        }
                                                                    ></div>
                                                                </a>
                                                            </td>
                                                        </>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                            </table>
                        )}
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4">
                        <p className="text-lg font-bold mb-2">Legend</p>
                        <div className="flex gap-16">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-cyan-600"></div>
                                <div>Onsite (host's location)</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-lime-400"></div>
                                <div>Onsite (client's location)</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-amber-400"></div>
                                <div>Virtual (Zoom, Teams, Meet, etc.)</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {auth.user.admin === 1 && (
                            <>
                                <Button onClick={() => CreateMeeting()}>
                                    Schedule New Meeting
                                </Button>
                            </>
                        )}
                        {/* <Link href="/search-meeting">
                            <Button color="light">Cari Berdasarkan Kode</Button>
                        </Link> */}
                        <Button
                            onClick={(e) => setSearchMeetingModal(true)}
                            color="light"
                        >
                            Search by Code
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
