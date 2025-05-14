'use client'
import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import AttendanceComponent from '@/components/attendancesheet/attendancesheet';
import AttendanceTable from '@/components/attendancesheet/table';

export default function Home() {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [dateFilter, setDateFilter] = useState(''); // Empty means show all for current month
    const [remarkFilter, setRemarkFilter] = useState('');

    return (
        <div className="h-screen overflow-hidden">
            {/* Sidebar - Fixed */}
            <div className="w-1/6 fixed top-0 bottom-0 left-0 bg-gray-100">
                <Sidebar />
            </div>

            {/* Navbar - Fixed */}
            <div className="fixed top-0 right-0 w-5/6 ml-[16.6667%] z-10">
                <Navbar />
            </div>

            {/* Scrollable Content below Navbar */}
            <div className="mt-[60px] ml-[16.6667%] h-[calc(100vh-60px)] overflow-y-auto p-4 bg-white">
                <AttendanceComponent
                    onDateChange={setDateFilter}
                    onRemarkChange={setRemarkFilter}
                    initialDate={currentDate}
                />
                <AttendanceTable
                    selectedDate={dateFilter}
                    selectedRemark={remarkFilter}
                />
            </div>
        </div>
    );
}

