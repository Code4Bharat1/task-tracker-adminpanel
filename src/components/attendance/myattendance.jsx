'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TbDoorExit, TbDoorEnter } from 'react-icons/tb';
import { LuAlarmClock } from "react-icons/lu";

// Modal Component
const EarlyLeaveModal = ({ isOpen, onClose, onSubmit, reason, setReason }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
                <h2 className="text-lg font-semibold mb-4 text-[#6B1A2C]">You are leaving early (less than 8 hours)</h2>
                <p className="mb-2 text-sm text-gray-600">Please provide a reason:</p>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your reason..."
                />
                <div className="flex justify-center gap-4">
                    <button onClick={onSubmit} className="bg-[#82334D] text-white px-4 py-2 rounded hover:bg-[#a6526b]">
                        OK
                    </button>
                    <button onClick={onClose} className="bg-pink-200 text-black px-4 py-2 rounded hover:bg-pink-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AttendancePage() {
    const [currentDate, setCurrentDate] = useState('');
    const [inTime, setInTime] = useState('');
    const [inLocation, setInLocation] = useState('');
    const [outTime, setOutTime] = useState('');
    const [outLocation, setOutLocation] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [hasPunchedIn, setHasPunchedIn] = useState(false);
    const [hasPunchedOut, setHasPunchedOut] = useState(false);
    const [punchInTimestamp, setPunchInTimestamp] = useState(null);
    const [punchOutTimestamp, setPunchOutTimestamp] = useState(null);
    const [earlyLeaveReason, setEarlyLeaveReason] = useState('');

    // Modal control
    const [showEarlyModal, setShowEarlyModal] = useState(false);
    const [tempOutLocation, setTempOutLocation] = useState('');
    const [tempOutTime, setTempOutTime] = useState('');

    const underlineRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (underlineRef.current) {
            gsap.fromTo(
                underlineRef.current,
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    useEffect(() => {
        const dateStr = new Date().toLocaleDateString('en-GB');
        setCurrentDate(dateStr);
    }, []);

    const formatTime = (date) =>
        date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

    const fetchLocation = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();
            return data.display_name || 'Unknown Location';
        } catch {
            return 'Failed to fetch location';
        }
    };

    const startElapsedTimer = () => {
        const startTime = Date.now();
        const id = setInterval(() => {
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(seconds);
        }, 1000);
        setIntervalId(id);
    };

    const stopElapsedTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };

    const handlePunchIn = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const location = await fetchLocation(latitude, longitude);
            const now = new Date();
            setPunchInTimestamp(now);
            setInTime(formatTime(now));
            setInLocation(location);
            setHasPunchedIn(true);
            startElapsedTimer();
        });
    };

    const handlePunchOut = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const location = await fetchLocation(latitude, longitude);
            const now = new Date();

            const diffInSeconds = punchInTimestamp ? Math.floor((now - punchInTimestamp) / 1000) : 0;
            setTempOutTime(formatTime(now));
            setTempOutLocation(location);

            if (diffInSeconds < 28800) {
                setShowEarlyModal(true);
            } else {
                finalizePunchOut(now, location);
            }
        });
    };

    const finalizePunchOut = (now, location) => {
        setPunchOutTimestamp(now);
        setOutTime(formatTime(now));
        setOutLocation(location);
        setHasPunchedOut(true);
        stopElapsedTimer();
    };

    const handleModalSubmit = () => {
        setEarlyLeaveReason(earlyLeaveReason || "No reason provided");
        finalizePunchOut(new Date(), tempOutLocation);
        setShowEarlyModal(false);
    };

    return (
        <>
            <div className="relative ml-10 mt-4 w-max">
                <h2 className="text-2xl font-bold text-black">Attendance</h2>
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
                ></span>
            </div>

            <div className="flex items-center justify-center min-h-screen -mt-20 bg-white p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 relative">
                    <div className="flex justify-between items-center mx-20 mb-6">
                        <button className="bg-[#F4F5FD] px-4 py-2 text-xl rounded-xl shadow-md font-semibold">{currentDate}</button>
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <div className="w-[70px] h-[70px] rounded-full overflow-hidden">
                                <Image src="/layout/profile.png" alt="avatar" width={70} height={70} />
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/punchhistory')}
                            className="ml-auto bg-[#058CBF] text-white px-4 py-2 rounded hover:bg-[#69b0c9]"
                        >
                            Punch History
                        </button>
                    </div>

                    <hr className="h-0.5 bg-gray-400 border-0" />

                    <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <strong className="w-40">Punch in Time:</strong>
                            <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md min-w-[80px]">{inTime || '--:--:--'}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <strong className="w-40">Punch in Location:</strong>
                            <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-sm min-w-[200px]">{inLocation || 'Not punched in yet'}</div>
                        </div>

                        <div className="flex ml-5 justify-around mt-8 mb-8">
                            <button
                                onClick={handlePunchIn}
                                disabled={hasPunchedIn}
                                className="flex items-center bg-[#058CBF] text-lg text-white px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400"
                            >
                                <LuAlarmClock className="mr-2" />
                                Punch In
                                <TbDoorEnter className="ml-2" />
                            </button>

                            <button
                                onClick={handlePunchOut}
                                disabled={!hasPunchedIn || hasPunchedOut}
                                className="flex items-center bg-[#058CBF] text-lg text-white px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400"
                            >
                                <LuAlarmClock className="mr-2" />
                                Punch Out
                                <TbDoorExit className="ml-2" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <strong className="w-40">Punch Out Time:</strong>
                            <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md min-w-[80px]">
                                {outTime || '--:--:--'}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <strong className="w-40">Punch Out Location:</strong>
                            <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-sm min-w-[200px]">{outLocation || 'Not punched out yet'}</div>
                        </div>

                        {earlyLeaveReason && (
                            <div className="mt-4 text-red-600 font-semibold">
                                Early Leave Reason: {earlyLeaveReason}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Early Leave Modal */}
            <EarlyLeaveModal
                isOpen={showEarlyModal}
                onClose={() => setShowEarlyModal(false)}
                onSubmit={handleModalSubmit}
                reason={earlyLeaveReason}
                setReason={setEarlyLeaveReason}
            />
        </>
    );
}
