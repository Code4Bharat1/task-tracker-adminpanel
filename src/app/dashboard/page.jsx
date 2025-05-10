'use client';

import React, { useState } from "react";
import { RiSurveyLine, RiTaskLine, RiProgress6Line, RiGalleryView } from 'react-icons/ri';

import Sidebar from "@/components/layout/sidebar";
import NavBar from "@/components/layout/navbar";
import WelcomeBanner from "@/components/dashboard/Welcomebanner";
import OngoingProjects from "@/components/dashboard/OngoingProject";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import ProjectStatusCard from "@/components/dashboard/ProjectStatusCard";

function Page() {
    const [selected, setSelected] = useState("This Year");

    return (
        <div className="min-h-screen md:flex bg-white">
            {/* Sidebar */}
            <div className="md:w-1/6">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
                <NavBar />

                <WelcomeBanner />

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
                            total={3}
                            percentage={30}
                            chartColors={['#FF8400', '#F2F2F2']}
                        />

                        <ProjectStatusCard
                            title="Complete Projects"
                            Icon={RiTaskLine}
                            iconBgColor="bg-[#A7BBFF]"
                            iconColor="text-[#2659FF]"
                            total={5}
                            percentage={50}
                            chartColors={['#1E40FF', '#F2F2F2']}
                        />

                        <ProjectStatusCard
                            title="Inprogress Projects"
                            Icon={RiProgress6Line}
                            iconBgColor="bg-green-100"
                            iconColor="text-[#09CB61]"
                            total={2}
                            percentage={20}
                            chartColors={['#10B981', '#E5E7EB']}
                        />

                        <ProjectStatusCard
                            title="Total Projects"
                            Icon={RiGalleryView}
                            iconBgColor="bg-yellow-100"
                            iconColor="text-[#FFCC00]"
                            total={10}
                            percentage={100}
                            chartColors={['#FACC15', '#E5E7EB']}
                        />

                        <OngoingProjects />
                        <CalendarWidget />
                    </div>
                </div>

                {/* Mobile View Placeholder */}
                <main className="block md:hidden"></main>
            </div>
        </div>
    );
}

export default Page;
