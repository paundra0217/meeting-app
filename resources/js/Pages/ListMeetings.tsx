import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import { useState, useEffect, useCallback } from "react";
import { Button, Spinner, Tabs, Pagination } from "flowbite-react";
import { Head, Link, useForm } from "@inertiajs/react";
import { PageProps, Locations } from "@/types";
import { DateTime } from "luxon";

export default function Dashboard({ auth }: PageProps) {
    const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
    const [selectedTab, setSelectedTab] = useState<Number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFutureLoading, setIsFutureLoading] = useState<boolean>(true);

    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [ongoingMeeting, setOngoingMeeting] = useState<any>([]);
    const [thirtyminsMeeting, setThirtyminsMeeting] = useState<any>([]);
    const [todaysMeeting, setTodaysMeeting] = useState<any>([]);
    const [futureMeeting, setFutureMeeting] = useState<any>([]);
    const [pastMeeting, setPastMeeting] = useState<any>([]);
    const [cancelledMeeting, setCancelledMeeting] = useState<any>([]);

    const locations: Locations = {
        1: "Onsite (host's location)",
        2: "Onsite (client's location)",
        3: "Virtual",
    };

    const onPageChange = (page: number) => setCurrentPage(page);

    const refreshClock = useCallback(() => {
        setCurrentTime(DateTime.now());
    }, [setCurrentTime]);

    useEffect(() => {
        const timerID = setInterval(refreshClock, 100);
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [refreshClock]);

    useEffect(() => {
        setCurrentPage(1);
        setTotalPages(1);
    }, [selectedTab]);

    useEffect(() => {
        setIsLoading(true);

        let url = "";

        switch (selectedTab) {
            case 0:
                url = "/api/list-meetings";
                break;
            case 1:
                url = "/api/list-meetings?page=" + currentPage;
                break;
            case 2:
                url = "/api/past-meetings?page=" + currentPage;
                break;
            case 3:
                url = "/api/cancelled-meetings?page=" + currentPage;
                break;
        }

        fetch(url)
            .then((response) => response.json())
            .then((d) => {
                switch (selectedTab) {
                    case 0:
                        setOngoingMeeting(d.ongoing_meeting);
                        setThirtyminsMeeting(d.thirtymins_meeting);
                        setTodaysMeeting(d.todays_meeting);
                        break;
                    case 1:
                        setTotalPages(d.future_meeting.last_page);
                        setFutureMeeting(d.future_meeting.data);
                        break;
                    case 2:
                        setTotalPages(d.last_page);
                        setPastMeeting(d.data);
                        break;
                    case 3:
                        setTotalPages(d.last_page);
                        setCancelledMeeting(d.data);
                        break;
                }
            })
            .then(() => setIsLoading(false));
    }, [selectedTab, currentPage]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Meeting List
                </h2>
            }
        >
            <Head title="Meeting List" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-4 sm:p-8 space-y-6">
                        <div className="flex flex-col items-center mb-4">
                            <div className="text-4xl">
                                {currentTime?.toLocaleString(
                                    DateTime.TIME_24_WITH_SECONDS
                                )}
                            </div>
                            <div className="text-sm">
                                {currentTime?.toLocaleString(
                                    DateTime.DATE_HUGE
                                )}
                            </div>
                        </div>
                        <Tabs.Group
                            aria-label="Default tabs"
                            style="default"
                            onActiveTabChange={(tab) => setSelectedTab(tab)}
                        >
                            <Tabs.Item
                                active
                                title="Today's Meeting"
                                disabled={isLoading}
                            >
                                {!isLoading ? (
                                    <div className="flex flex-col gap-8">
                                        <div className="w-full">
                                            <div className="font-bold mb-2">
                                                Currently Ongoing Meeting
                                            </div>
                                            <div className="flex flex-col items-center">
                                                {ongoingMeeting.length > 0 ? (
                                                    <table className="w-full mt-2">
                                                        {ongoingMeeting.map(
                                                            (m: any) => {
                                                                return (
                                                                    <tr className="border-2">
                                                                        <td className="w-36 p-2 border-r-2 text-center">
                                                                            <div className="text-xl">
                                                                                {DateTime.fromJSDate(
                                                                                    new Date(
                                                                                        m.meeting_start
                                                                                    )
                                                                                ).toLocaleString(
                                                                                    DateTime.TIME_24_SIMPLE
                                                                                )}
                                                                                {
                                                                                    " - "
                                                                                }
                                                                                {DateTime.fromJSDate(
                                                                                    new Date(
                                                                                        m.meeting_end
                                                                                    )
                                                                                ).toLocaleString(
                                                                                    DateTime.TIME_24_SIMPLE
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-2 border-r-2">
                                                                            <div>
                                                                                Client:{" "}
                                                                                {
                                                                                    m
                                                                                        .client
                                                                                        .client_name
                                                                                }{" "}
                                                                                (
                                                                                {
                                                                                    m
                                                                                        .client
                                                                                        .rep_name
                                                                                }

                                                                                )
                                                                            </div>
                                                                            <div>
                                                                                Host:{" "}
                                                                                {
                                                                                    m
                                                                                        .user
                                                                                        .name
                                                                                }
                                                                                {
                                                                                    " - "
                                                                                }
                                                                                Location:{" "}
                                                                                {
                                                                                    locations[
                                                                                        m
                                                                                            .meeting_location
                                                                                    ]
                                                                                }
                                                                            </div>
                                                                            <div>
                                                                                Topic:{" "}
                                                                                {
                                                                                    m.meeting_topic
                                                                                }
                                                                            </div>
                                                                        </td>
                                                                        <td className="w-36 p-2 border-r-2">
                                                                            <a
                                                                                href={
                                                                                    "/meeting/" +
                                                                                    m.id
                                                                                }
                                                                                target="_blank"
                                                                            >
                                                                                <Button>
                                                                                    Meeting Details
                                                                                </Button>
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </table>
                                                ) : (
                                                    <div className="flex flex-col items-center h-16 my-4">
                                                        <p className="italic">
                                                            No meetings available
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div className="font-bold">
                                                Meeting in 30 minutes Time
                                            </div>
                                            <div className="flex flex-col items-center">
                                                {thirtyminsMeeting.length >
                                                0 ? (
                                                    <table className="w-full mt-2">
                                                        {thirtyminsMeeting.map(
                                                            (m: any) => {
                                                                return (
                                                                    <tr className="border-2">
                                                                        <td className="w-36 p-2 border-r-2 text-center">
                                                                            <div className="text-xl">
                                                                                {DateTime.fromJSDate(
                                                                                    new Date(
                                                                                        m.meeting_start
                                                                                    )
                                                                                ).toLocaleString(
                                                                                    DateTime.TIME_24_SIMPLE
                                                                                )}
                                                                                {
                                                                                    " - "
                                                                                }
                                                                                {DateTime.fromJSDate(
                                                                                    new Date(
                                                                                        m.meeting_end
                                                                                    )
                                                                                ).toLocaleString(
                                                                                    DateTime.TIME_24_SIMPLE
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-2 border-r-2">
                                                                            <div>
                                                                                Client:{" "}
                                                                                {
                                                                                    m
                                                                                        .client
                                                                                        .client_name
                                                                                }{" "}
                                                                                (
                                                                                {
                                                                                    m
                                                                                        .client
                                                                                        .rep_name
                                                                                }

                                                                                )
                                                                            </div>
                                                                            <div>
                                                                                Host:{" "}
                                                                                {
                                                                                    m
                                                                                        .user
                                                                                        .name
                                                                                }
                                                                                {
                                                                                    " - "
                                                                                }
                                                                                Location:{" "}
                                                                                {
                                                                                    locations[
                                                                                        m
                                                                                            .meeting_location
                                                                                    ]
                                                                                }
                                                                            </div>
                                                                            <div>
                                                                                Topic:{" "}
                                                                                {
                                                                                    m.meeting_topic
                                                                                }
                                                                            </div>
                                                                        </td>
                                                                        <td className="w-36 p-2 border-r-2">
                                                                            <a
                                                                                href={
                                                                                    "/meeting/" +
                                                                                    m.id
                                                                                }
                                                                                target="_blank"
                                                                            >
                                                                                <Button>
                                                                                    Details
                                                                                </Button>
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </table>
                                                ) : (
                                                    <div className="flex flex-col items-center h-16 my-4">
                                                        <p className="italic">
                                                            No meetings available
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div className="font-bold">
                                                Today's Meeting (
                                                {DateTime.fromJSDate(
                                                    new Date()
                                                ).toLocaleString(
                                                    DateTime.DATE_HUGE
                                                )}
                                                )
                                            </div>
                                            {todaysMeeting.length > 0 ? (
                                                <table className="w-full mt-2">
                                                    {todaysMeeting.map(
                                                        (m: any) => {
                                                            return (
                                                                <tr className="border-2">
                                                                    <td className="w-36 p-2 border-r-2 text-center">
                                                                        <div className="text-xl">
                                                                            {DateTime.fromJSDate(
                                                                                new Date(
                                                                                    m.meeting_start
                                                                                )
                                                                            ).toLocaleString(
                                                                                DateTime.TIME_24_SIMPLE
                                                                            )}
                                                                            {
                                                                                " - "
                                                                            }
                                                                            {DateTime.fromJSDate(
                                                                                new Date(
                                                                                    m.meeting_end
                                                                                )
                                                                            ).toLocaleString(
                                                                                DateTime.TIME_24_SIMPLE
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 border-r-2">
                                                                        <div>
                                                                            Client:{" "}
                                                                            {
                                                                                m
                                                                                    .client
                                                                                    .client_name
                                                                            }{" "}
                                                                            (
                                                                            {
                                                                                m
                                                                                    .client
                                                                                    .rep_name
                                                                            }
                                                                            )
                                                                        </div>
                                                                        <div>
                                                                            Host:{" "}
                                                                            {
                                                                                m
                                                                                    .user
                                                                                    .name
                                                                            }
                                                                            {
                                                                                " - "
                                                                            }
                                                                            Location:{" "}
                                                                            {
                                                                                locations[
                                                                                    m
                                                                                        .meeting_location
                                                                                ]
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            Topic:{" "}
                                                                            {
                                                                                m.meeting_topic
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td className="w-36 p-2 border-r-2">
                                                                        <a
                                                                            href={
                                                                                "/meeting/" +
                                                                                m.id
                                                                            }
                                                                            target="_blank"
                                                                        >
                                                                            <Button>
                                                                                Details
                                                                            </Button>
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </table>
                                            ) : (
                                                <div className="flex flex-col items-center h-16 my-4">
                                                    <p className="italic">
                                                        No meetings available
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center">
                                        <Spinner className="h-16 w-16" />
                                    </div>
                                )}
                            </Tabs.Item>
                            <Tabs.Item
                                title="Future Meetings"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex justify-center my-4">
                                        <Spinner className="w-16 h-16" />
                                    </div>
                                ) : futureMeeting.length > 0 ? (
                                    <>
                                        <table className="w-full mt-2">
                                            {futureMeeting.map((m: any) => {
                                                return (
                                                    <tr className="border-2">
                                                        <td className="w-36 p-2 border-r-2 text-center">
                                                            <div className="text-xl">
                                                                {DateTime.fromJSDate(
                                                                    new Date(
                                                                        m.meeting_start
                                                                    )
                                                                ).toLocaleString(
                                                                    DateTime.TIME_24_SIMPLE
                                                                )}
                                                                {" - "}
                                                                {DateTime.fromJSDate(
                                                                    new Date(
                                                                        m.meeting_end
                                                                    )
                                                                ).toLocaleString(
                                                                    DateTime.TIME_24_SIMPLE
                                                                )}
                                                            </div>
                                                            <div className="text-sm">
                                                                {DateTime.fromJSDate(
                                                                    new Date(
                                                                        m.meeting_start
                                                                    )
                                                                ).toLocaleString(
                                                                    DateTime.DATE_MED_WITH_WEEKDAY
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 border-r-2">
                                                            <div>
                                                                Client:{" "}
                                                                {
                                                                    m.client
                                                                        .client_name
                                                                }{" "}
                                                                (
                                                                {
                                                                    m.client
                                                                        .rep_name
                                                                }
                                                                )
                                                            </div>
                                                            <div>
                                                                Host:{" "}
                                                                {m.user.name}
                                                                {" - "}
                                                                Location:{" "}
                                                                {
                                                                    locations[
                                                                        m
                                                                            .meeting_location
                                                                    ]
                                                                }
                                                            </div>
                                                            <div>
                                                                Topic:{" "}
                                                                {
                                                                    m.meeting_topic
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="w-36 p-2 border-r-2">
                                                            <a
                                                                href={
                                                                    "/meeting/" +
                                                                    m.id
                                                                }
                                                                target="_blank"
                                                            >
                                                                <Button>
                                                                    Details
                                                                </Button>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </table>
                                        <div className="mt-4 flex overflow-x-auto sm:justify-center">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={onPageChange}
                                                nextLabel=" "
                                                previousLabel=" "
                                                showIcons
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center h-16 my-4">
                                        <p className="italic">No meetings available</p>
                                    </div>
                                )}
                            </Tabs.Item>
                            <Tabs.Item
                                title="Past Meetings"
                                disabled={isLoading}
                            >
                                {!isLoading ? (
                                    pastMeeting.length > 0 ? (
                                        <>
                                            <table className="w-full mt-2">
                                                {pastMeeting.map((m: any) => {
                                                    return (
                                                        <tr className="border-2">
                                                            <td className="w-36 p-2 border-r-2 text-center">
                                                                <div className="text-xl">
                                                                    {DateTime.fromJSDate(
                                                                        new Date(
                                                                            m.meeting_start
                                                                        )
                                                                    ).toLocaleString(
                                                                        DateTime.TIME_24_SIMPLE
                                                                    )}
                                                                    {" - "}
                                                                    {DateTime.fromJSDate(
                                                                        new Date(
                                                                            m.meeting_end
                                                                        )
                                                                    ).toLocaleString(
                                                                        DateTime.TIME_24_SIMPLE
                                                                    )}
                                                                </div>
                                                                <div className="text-sm">
                                                                    {DateTime.fromJSDate(
                                                                        new Date(
                                                                            m.meeting_start
                                                                        )
                                                                    ).toLocaleString(
                                                                        DateTime.DATE_MED_WITH_WEEKDAY
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-2 border-r-2">
                                                                <div>
                                                                    Client:{" "}
                                                                    {
                                                                        m.client
                                                                            .client_name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        m.client
                                                                            .rep_name
                                                                    }
                                                                    )
                                                                </div>
                                                                <div>
                                                                    Host:{" "}
                                                                    {
                                                                        m.user
                                                                            .name
                                                                    }
                                                                    {" - "}
                                                                    Location:{" "}
                                                                    {
                                                                        locations[
                                                                            m
                                                                                .meeting_location
                                                                        ]
                                                                    }
                                                                </div>
                                                                <div>
                                                                    Topic:{" "}
                                                                    {
                                                                        m.meeting_topic
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="w-36 p-2 border-r-2">
                                                                <a
                                                                    href={
                                                                        "/meeting/" +
                                                                        m.id
                                                                    }
                                                                    target="_blank"
                                                                >
                                                                    <Button>
                                                                        Details
                                                                    </Button>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </table>
                                            <div className="mt-4 flex overflow-x-auto sm:justify-center">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={onPageChange}
                                                    nextLabel=" "
                                                    previousLabel=" "
                                                    showIcons
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center h-16 my-4">
                                            <p className="italic">No meetings available</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center">
                                        <Spinner className="h-16 w-16" />
                                    </div>
                                )}
                            </Tabs.Item>
                            <Tabs.Item
                                title="Cancelled Meetings"
                                disabled={isLoading}
                            >
                                {!isLoading ? (
                                    cancelledMeeting.length > 0 ? (
                                        <>
                                            <table className="w-full mt-2">
                                                {cancelledMeeting.map(
                                                    (m: any) => {
                                                        return (
                                                            <tr className="border-2">
                                                                <td className="w-36 p-2 border-r-2 text-center">
                                                                    <div className="text-xl line-through">
                                                                        {DateTime.fromJSDate(
                                                                            new Date(
                                                                                m.meeting_start
                                                                            )
                                                                        ).toLocaleString(
                                                                            DateTime.TIME_24_SIMPLE
                                                                        )}
                                                                        {" - "}
                                                                        {DateTime.fromJSDate(
                                                                            new Date(
                                                                                m.meeting_end
                                                                            )
                                                                        ).toLocaleString(
                                                                            DateTime.TIME_24_SIMPLE
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm line-through">
                                                                        {DateTime.fromJSDate(
                                                                            new Date(
                                                                                m.meeting_start
                                                                            )
                                                                        ).toLocaleString(
                                                                            DateTime.DATE_MED_WITH_WEEKDAY
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-2 border-r-2">
                                                                    <div>
                                                                        Client:{" "}
                                                                        {
                                                                            m
                                                                                .client
                                                                                .client_name
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            m
                                                                                .client
                                                                                .rep_name
                                                                        }
                                                                        )
                                                                    </div>
                                                                    <div>
                                                                        Host:{" "}
                                                                        {
                                                                            m
                                                                                .user
                                                                                .name
                                                                        }
                                                                        {" - "}
                                                                        Location:{" "}
                                                                        {
                                                                            locations[
                                                                                m
                                                                                    .meeting_location
                                                                            ]
                                                                        }
                                                                    </div>
                                                                    <div>
                                                                        Topic:{" "}
                                                                        {
                                                                            m.meeting_topic
                                                                        }
                                                                    </div>
                                                                    <div className="text-red-500">
                                                                        Cancelled Date:{" "}
                                                                        {DateTime.fromJSDate(
                                                                            new Date(
                                                                                m.cancelled_date
                                                                            )
                                                                        ).toLocaleString(
                                                                            DateTime.DATE_MED_WITH_WEEKDAY
                                                                        )}
                                                                    </div>
                                                                    <div className="text-red-500">
                                                                        Reason:{" "}
                                                                        {
                                                                            m.cancelled_reason
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="w-36 p-2 border-r-2">
                                                                    <a
                                                                        href={
                                                                            "/meeting/" +
                                                                            m.id
                                                                        }
                                                                        target="_blank"
                                                                    >
                                                                        <Button>
                                                                            No meetings available
                                                                        </Button>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </table>
                                            <div className="mt-4 flex overflow-x-auto sm:justify-center">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={onPageChange}
                                                    nextLabel=" "
                                                    previousLabel=" "
                                                    showIcons
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center h-16 my-4">
                                            <p className="italic">No Meetings Available</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center">
                                        <Spinner className="h-16 w-16" />
                                    </div>
                                )}
                            </Tabs.Item>
                        </Tabs.Group>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
