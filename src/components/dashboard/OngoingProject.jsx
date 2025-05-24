'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function OngoingProject() {
    const [projectData, setProjectData] = useState([]);

    useEffect(() => {
        const fetchOngoingProjects = async () => {
            try {
                const response = await axios.get('http://localhost:4110/api/tasks/getOngoingProjects', {
                    withCredentials: true,
                });
                setProjectData(response.data.data || []);
            } catch (error) {
                console.error('Error fetching ongoing projects:', error);
            }
        };

        fetchOngoingProjects();
    }, []);

    const isScrollable = projectData.length > 5;

    return (
        <div className="bg-white relative h-full p-6 w-full rounded-xl shadow-[0px_3px_4px_rgba(0,0,0,0.4)] max-w-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ongoing Projects</h2>
            </div>

            {projectData.length === 0 ? (
                <p className="text-gray-500">No ongoing projects found.</p>
            ) : (
                <div
                    className={`flex flex-col gap-4 pr-2 ${isScrollable ? 'max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100' : ''}`}
                >
                    {projectData.map((project, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-white p-4 rounded-r-lg shadow-[0px_3px_2px_rgba(0,0,0,0.6)] border-l-8 border-orange-500"
                        >
                            <div className="relative w-10 h-10">
                                <Image
                                    src={project.photoUrl || "/profile.png"}
                                    alt="Profile"
                                    fill
                                    className="object-cover rounded-full border-2 border-white"
                                    sizes="40px"
                                    priority
                                />
                            </div>
                            <div>
                                <p>
                                    Assigned the project&nbsp;
                                    <span className="text-gray-700 font-medium">
                                        “{project.bucketName}”
                                    </span>&nbsp;to&nbsp;
                                    <span className="font-semibold text-blue-600">
                                        {project.assignedToName}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
