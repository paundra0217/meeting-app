import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import { useState, useEffect, useCallback } from "react";
import { Button, Spinner } from "flowbite-react";
import { Head, Link } from "@inertiajs/react";
import { PageProps, Locations } from "@/types";
import { DateTime } from "luxon";

export default function Dashboard({ auth }: PageProps) {
    const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [ongoingMeeting, setOngoingMeeting] = useState<any>();
    const [thirtyminsMeeting, setThirtyminsMeeting] = useState<any>();
    const [todaysMeeting, setTodaysMeeting] = useState<any>();
    const [tomorrowsMeeting, setTomorrowsMeeting] = useState<any>();

    const locations: Locations = {
        1: "Onsite (host's location)",
        2: "Onsite (client's location",
        3: "Virtual",
    };

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
        fetch("/api/my-meetings/")
            .then((response) => response.json())
            .then((d) => {
                setOngoingMeeting(d.ongoing_meeting);
                setThirtyminsMeeting(d.thirtymins_meeting);
                setTodaysMeeting(d.todays_meeting);
                setTomorrowsMeeting(d.tomorrows_meeting);
            })
            .then(() => setIsLoading(false))
            .then(() => console.log(tomorrowsMeeting));
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    My Meetings
                </h2>
            }
        >
            <Head title="My Meetings" />

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
                        <div className="flex flex-col gap-8">
                            <div className="w-full">
                                <div className="font-bold mb-2">
                                    Ongoing Meeting
                                </div>
                                <div className="flex flex-col items-center">
                                    {isLoading ? (
                                        <div className="flex justify-center my-4">
                                            <Spinner className="w-16 h-16" />
                                        </div>
                                    ) : ongoingMeeting.length > 0 ? (
                                        <>
                                            <div className="text-2xl">
                                                {DateTime.fromJSDate(
                                                    new Date(
                                                        ongoingMeeting[0].meeting_start
                                                    )
                                                ).toLocaleString(
                                                    DateTime.TIME_24_SIMPLE
                                                )}
                                                {" - "}
                                                {DateTime.fromJSDate(
                                                    new Date(
                                                        ongoingMeeting[0].meeting_end
                                                    )
                                                ).toLocaleString(
                                                    DateTime.TIME_24_SIMPLE
                                                )}
                                            </div>
                                            <div>
                                                Client:{" "}
                                                {
                                                    ongoingMeeting[0].client
                                                        .client_name
                                                }{" "}
                                                (
                                                {
                                                    ongoingMeeting[0].client
                                                        .rep_name
                                                }
                                                )
                                            </div>
                                            <div>
                                                Location:{" "}
                                                {
                                                    locations[
                                                        ongoingMeeting[0]
                                                            .meeting_location
                                                    ]
                                                }
                                            </div>
                                            <div>
                                                Topic:{" "}
                                                {
                                                    ongoingMeeting[0]
                                                        .meeting_topic
                                                }
                                            </div>
                                            <a
                                                href={
                                                    "/meeting/" +
                                                    ongoingMeeting[0].id
                                                }
                                                target="_blank"
                                            >
                                                <Button className="mt-2">
                                                    Details
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center h-16 my-4">
                                            <p className="italic">No meeting available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="font-bold">
                                    Next Meeting in 30 minutes Time
                                </div>
                                <div className="flex flex-col items-center">
                                    {isLoading ? (
                                        <div className="flex justify-center my-4">
                                            <Spinner className="w-16 h-16" />
                                        </div>
                                    ) : thirtyminsMeeting.length > 0 ? (
                                        <>
                                            <div className="text-2xl">
                                                {DateTime.fromJSDate(
                                                    new Date(
                                                        thirtyminsMeeting[0].meeting_start
                                                    )
                                                ).toLocaleString(
                                                    DateTime.TIME_24_SIMPLE
                                                )}
                                                {" - "}
                                                {DateTime.fromJSDate(
                                                    new Date(
                                                        thirtyminsMeeting[0].meeting_end
                                                    )
                                                ).toLocaleString(
                                                    DateTime.TIME_24_SIMPLE
                                                )}
                                            </div>
                                            <div>
                                                Client:{" "}
                                                {
                                                    thirtyminsMeeting[0].client
                                                        .client_name
                                                }{" "}
                                                (
                                                {
                                                    thirtyminsMeeting[0].client
                                                        .rep_name
                                                }
                                                )
                                            </div>
                                            <div>
                                                Location:{" "}
                                                {
                                                    locations[
                                                        thirtyminsMeeting[0]
                                                            .meeting_location
                                                    ]
                                                }
                                            </div>
                                            <div>
                                                Topic:{" "}
                                                {
                                                    thirtyminsMeeting[0]
                                                        .meeting_topic
                                                }
                                            </div>
                                            <a
                                                href={
                                                    "/meeting/" +
                                                    thirtyminsMeeting[0].id
                                                }
                                                target="_blank"
                                            >
                                                <Button className="mt-2">
                                                    Details
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center h-16 my-4">
                                            <p className="italic">No meeting available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="font-bold">
                                    Today's Meetings (
                                    {DateTime.fromJSDate(
                                        new Date()
                                    ).toLocaleString(DateTime.DATE_HUGE)}
                                    )
                                </div>
                                {isLoading ? (
                                    <div className="flex justify-center my-4">
                                        <Spinner className="w-16 h-16" />
                                    </div>
                                ) : todaysMeeting.length > 0 ? (
                                    <table className="w-full mt-2">
                                        {todaysMeeting.map((m: any) => {
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
                                                    </td>
                                                    <td className="p-2 border-r-2">
                                                        <div>
                                                            Client:{" "}
                                                            {
                                                                m.client
                                                                    .client_name
                                                            }{" "}
                                                            ({m.client.rep_name}
                                                            )
                                                        </div>
                                                        <div>
                                                            Location:{" "}
                                                            {
                                                                locations[
                                                                    m
                                                                        .meeting_location
                                                                ]
                                                            }
                                                            {" - "}
                                                            Topic:{" "}
                                                            {m.meeting_topic}
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
                                ) : (
                                    <div className="flex flex-col items-center h-16 my-4">
                                        <p className="italic">No meetings available</p>
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <div className="font-bold">
                                    Tomorrow's Meeting (
                                    {DateTime.fromJSDate(new Date())
                                        .plus({ day: 1 })
                                        .toLocaleString(DateTime.DATE_HUGE)}
                                    )
                                </div>
                                {isLoading ? (
                                    <div className="flex justify-center my-4">
                                        <Spinner className="w-16 h-16" />
                                    </div>
                                ) : tomorrowsMeeting.length > 0 ? (
                                    <table className="w-full mt-2">
                                        {tomorrowsMeeting.map((m: any) => {
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
                                                    </td>
                                                    <td className="p-2 border-r-2">
                                                        <div>
                                                            Client:{" "}
                                                            {
                                                                m.client
                                                                    .client_name
                                                            }{" "}
                                                            ({m.client.rep_name}
                                                            )
                                                        </div>
                                                        <div>
                                                            Location:{" "}
                                                            {
                                                                locations[
                                                                    m
                                                                        .meeting_location
                                                                ]
                                                            }
                                                            {" - "}
                                                            Topic:{" "}
                                                            {m.meeting_topic}
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
                                ) : (
                                    <div className="flex flex-col items-center h-16 my-4">
                                        <p className="italic">No meetings available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
