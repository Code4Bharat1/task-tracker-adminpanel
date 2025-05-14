'use client';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export default function Performanceboard() {
    const underlineRef = useRef(null);

    const [selectedWeek, setSelectedWeek] = useState('Week 1');
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        if (underlineRef.current) {
            gsap.fromTo(
                underlineRef.current,
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    // Data for different weeks
    const allPerformanceData = {
        'Week 1': [
            { rank: 1, name: "Chinmay Gawade", points: "9.5" },
            { rank: 2, name: "Harsh Singh", points: "8.8" },
            { rank: 3, name: "Tamim Tolkar", points: "8.3" },
        ],
        'Week 2': [
            { rank: 1, name: "Harsh Singh", points: "9.3" },
            { rank: 2, name: "Tamim Tolkar", points: "9.1" },
            { rank: 3, name: "Chinmay Gawade", points: "8.9" },
        ],
        'Week 3': [
            { rank: 1, name: "Tamim Tolkar", points: "9.7" },
            { rank: 2, name: "Chinmay Gawade", points: "9.0" },
            { rank: 3, name: "Harsh Singh", points: "8.5" },
        ],
        'Week 4': [
            { rank: 1, name: "Chinmay Gawade", points: "9.8" },
            { rank: 2, name: "Tamim Tolkar", points: "9.6" },
            { rank: 3, name: "Harsh Singh", points: "9.0" },
        ],
    };

    const performanceData = allPerformanceData[selectedWeek];

    return (
        <div className="p-6">
            {/* Title */}
            <div className="relative ml-4 mt-4 mb-4 w-max">
                <h2 className="text-2xl font-bold text-black">Performance Board</h2>
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
                ></span>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-6 justify-between items-center px-4 mb-6">
                {/* Week Dropdown */}
                <div className="flex items-center gap-3">
                    <label htmlFor="timeRange" className="text-black font-medium text-lg">Week :</label>
                    <select
                        id="timeRange"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray]"
                    >
                        <option>Week 1</option>
                        <option>Week 2</option>
                        <option>Week 3</option>
                        <option>Week 4</option>
                    </select>
                </div>

                {/* Month Picker */}
                <div className="flex items-center gap-3">
                    <label htmlFor="month" className="text-black font-medium text-lg">Month :</label>
                    <input
                        type="month"
                        id="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl shadow-lg -ml-1 mr-auto">
                <table className="min-w-full border-collapse table-auto text-sm">
                    <thead>
                        <tr className="bg-[#018ABE] text-white">
                            <th className="px-4 py-2 border border-gray-100 w-[5%] text-center">Rank</th>
                            <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Name</th>
                            <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Points (out of 10)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {performanceData.map((entry) => (
                            <tr key={entry.rank}>
                                <td className="px-4 py-2 custom-border font-medium text-center">{entry.rank}.</td>
                                <td className="px-4 py-2 custom-m,.border font-medium text-center">{entry.name}</td>
                                <td className="px-4 py-2 custom-border font-medium text-center">{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
