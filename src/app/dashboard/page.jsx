'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { RiSurveyLine, RiTaskLine, RiProgress6Line, RiGalleryView } from 'react-icons/ri';

import Sidebar from "@/components/layout/sidebar";
import NavBar from "@/components/layout/navbar";
import WelcomeBanner from "@/components/dashboard/Welcomebanner";
import OngoingProjects from "@/components/dashboard/OngoingProject";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import ProjectStatusCard from "@/components/dashboard/ProjectStatusCard";

function Page() {
    const [statusCounts, setStatusCounts] = useState({
        Open: 0,
        Complete: 0,
        'In Progress': 0,
        Total: 0
    });

    useEffect(() => {
        async function fetchTasks() {
            try {
                const response = await axios.get("http://localhost:4110/api/tasks/getTasks",
                    {
                        withCredentials: true
                    }
                );
                const tasks = response.data.data;

                const counts = {
                    Open: 0,
                    Complete: 0,
                    'In Progress': 0,
                    Total: tasks.length,
                };

                tasks.forEach(task => {
                    if (task.status === 'Open') counts.Open += 1;
                    else if (task.status === 'Completed') counts.Complete += 1;
                    else if (task.status === 'In Progress') counts['In Progress'] += 1;
                });

                setStatusCounts(counts);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        }

        fetchTasks();
    }, []);

    return (
        <div className="min-h-screen md:flex bg-white">
            <div className="md:w-1/6">
                <Sidebar />
            </div>

            <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
                <NavBar />
                <WelcomeBanner total={statusCounts.Total} />

                <div className="flex flex-col w-full mt-3">
                    <div>
                        <h1 className="text-3xl font-bold pl-9">
                            <span className="underline decoration-[#FFCC5D] decoration-3 underline-offset-6">
                                Dashbo
                            </span>ard
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 p-4 items-center justify-items-center w-full gap-y-8">
                        <ProjectStatusCard
                            title="Open Projects"
                            Icon={RiSurveyLine}
                            iconBgColor="bg-orange-100"
                            iconColor="text-[#FF8400]"
                            total={statusCounts.Open}
                            percentage={Math.round((statusCounts.Open / (statusCounts.Total || 1)) * 100)}
                            chartColors={['#FF8400', '#F2F2F2']}
                        />

                        <ProjectStatusCard
                            title="Complete Projects"
                            Icon={RiTaskLine}
                            iconBgColor="bg-[#A7BBFF]"
                            iconColor="text-[#2659FF]"
                            total={statusCounts.Complete}
                            percentage={Math.round((statusCounts.Complete / (statusCounts.Total || 1)) * 100)}
                            chartColors={['#1E40FF', '#F2F2F2']}
                        />

                        <ProjectStatusCard
                            title="In Progress Projects"
                            Icon={RiProgress6Line}
                            iconBgColor="bg-green-100"
                            iconColor="text-[#09CB61]"
                            total={statusCounts['In Progress']}
                            percentage={Math.round((statusCounts['In Progress'] / (statusCounts.Total || 1)) * 100)}
                            chartColors={['#10B981', '#E5E7EB']}
                        />

                        <ProjectStatusCard
                            title="Total Projects"
                            Icon={RiGalleryView}
                            iconBgColor="bg-yellow-100"
                            iconColor="text-[#FFCC00]"
                            total={statusCounts.Total}
                            percentage={100}
                            chartColors={['#FACC15', '#E5E7EB']}
                        />

                        <OngoingProjects />
                        <CalendarWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
