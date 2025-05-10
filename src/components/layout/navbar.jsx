'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegBell, FaVideo, FaUserPlus, FaSearch } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const notifications = [];

  const router = useRouter();

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
  };

  return (
    <div className="flex items-center justify-between bg-cyan-300 px-4 py-2 h-20 shadow-md relative">
      {/* Logo */}
      <div className="flex items-center gap-2 h-full overflow-hidden">
        <div className="scale-125 ml-4">
          <Image
            src="/signup/tasklogo.png"
            alt="Logo"
            width={100}
            height={60}
            className="object-contain"
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 w-1/2">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by Team Member Name"
          className="w-full outline-none bg-transparent"
        />
      </div>

      {/* Icons Section */}
      <div className="ml-auto flex items-center gap-10 mr-10">

        {/* Add Team Member */}
        <Link href="/addteammember" title="Add Team Member">
          <FaUserPlus className="w-6 h-7 text-white cursor-pointer" />
        </Link>

        {/* Video Call */}
        <button title="Video Call" onClick={toggleMeetingPopup}>
          <FaVideo className="w-6 h-7 text-gray-50 cursor-pointer" />
        </button>

      

        {/* Notifications */}
        <div className="relative">
          <FaRegBell
            className="cursor-pointer text-gray-50 w-10 h-6"
            onClick={() => setShowNotifications(prev => !prev)}
          />
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg z-20">
              <div
                className="p-4 font-semibold border-b cursor-pointer"
                onClick={() => router.push('/notification')}
              >
                Notifications
              </div>
              <div className="p-4 text-gray-600 text-sm max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div>No new notifications</div>
                ) : (
                  notifications.map((note, idx) => (
                    <div key={idx} className="mb-2">{note}</div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Popup */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 backdrop-blur-[1px]"
          onClick={() => setShowMeetingPopup(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-black inline-block">
              SCHEDULE MEETING
            </h2>

            <form className="space-y-2">
              <input type="text" placeholder="Meeting Title" required className="w-full p-2 border border-black rounded placeholder-black" />
              <textarea placeholder="Description" required className="w-full p-2 border border-black rounded placeholder-black" />
              <select required className="w-full p-2 border border-black rounded">
                <option value="">Select Team Members</option>
                <option>Member 1</option><option>Member 2</option><option>Member 3</option>
              </select>

              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full p-2 border border-black rounded bg-white text-black" />
                </div>
                <div className="relative w-1/2">
                  <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border border-black rounded bg-white text-black" />
                </div>
              </div>

              <select required className="w-full p-2 border border-black rounded">
                <option value="">Select Duration</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-gray-800">Link</label>
                <input type="url" id="meetingLink" required className="flex-1 p-2 border border-black rounded" />
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('meetingLink');
                    if (input && input.value) {
                      navigator.clipboard.writeText(input.value);
                    }
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Copy Link
                </button>
              </div>

              <div className="mt-7 flex justify-center">
  <button
    type="submit"
    className="bg-[#018ABE] rounded-xl text-white px-8 py-2 text-xl"
  >
    Create
  </button>
</div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
