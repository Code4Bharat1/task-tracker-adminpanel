'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoVideocamOutline } from "react-icons/io5";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaRegBell, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const router = useRouter();

  // Simulated user data
  const userData = {
    firstName: "Paras",
    email: "paras@example.com",
  };

  const notifications = [];

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
  };

  const handleProfileAction = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    // Add logout logic
    console.log("Logged out");
  };

  return (
    <div className="w-full px-8 py-4 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] gap-4 sm:gap-0 relative">
      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 w-full sm:w-[550px]">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by Team Member Name"
          className="w-full outline-none bg-transparent text-sm"
        />
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-x-10 flex-wrap justify-center sm:justify-end relative">
        {/* Add Team Member */}
        <Link href="/addteammember">
          <LuUserRoundPlus className="w-6 h-7 text-black cursor-pointer" />
        </Link>

        {/* Video Call */}
        <button onClick={toggleMeetingPopup}>
          <IoVideocamOutline className="w-7 h-8 text-black cursor-pointer" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <FaRegBell
            className="cursor-pointer text-black w-7 h-7"
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {showNotifications && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-lg shadow-lg z-20">
              <div
                className="p-4 font-semibold border-b cursor-pointer"
                onClick={() => router.push("/notification")}
              >
                Notifications
              </div>
              <div className="p-4 text-gray-600 text-sm max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div>No new notifications</div>
                ) : (
                  notifications.map((note, idx) => (
                    <div key={idx} className="mb-2">
                      {note}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative">
          <Image
            src="/layout/profile.png"
            alt="Profile"
            width={40}
            height={40}
            className="object-contain cursor-pointer rounded-full"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-30">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/layout/profile.png"
                      width={500}
                      height={500}
                      alt="Profile picture"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{userData.firstName || 'Guest'}</div>
                    <div className="text-sm text-gray-500">{userData.email}</div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Link href="/profile">
                  <div
                    onClick={handleProfileAction}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <FaUser className="text-gray-600" />
                    <span>View Profile</span>
                  </div>
                </Link>

                <div className="border-t my-1"></div>

                <Link href="/">
                  <div
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 text-red-500 cursor-pointer"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Popup */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm"
          onClick={() => setShowMeetingPopup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md text-center w-[90%] sm:w-[500px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-black inline-block">
              SCHEDULE MEETING
            </h2>

            <form className="space-y-3 mt-2 text-left">
              <input
                type="text"
                placeholder="Meeting Title"
                required
                className="w-full p-2 border border-black rounded placeholder-black"
              />
              <textarea
                placeholder="Description"
                required
                className="w-full p-2 border border-black rounded placeholder-black"
              />
              <select required className="w-full p-2 border border-black rounded">
                <option value="">Select Team Members</option>
                <option>Member 1</option>
                <option>Member 2</option>
                <option>Member 3</option>
              </select>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full sm:w-1/2 p-2 border border-black rounded bg-white text-black"
                />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full sm:w-1/2 p-2 border border-black rounded bg-white text-black"
                />
              </div>

              <select required className="w-full p-2 border border-black rounded">
                <option value="">Select Duration</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-gray-800">Link</label>
                <input
                  type="url"
                  id="meetingLink"
                  required
                  className="flex-1 p-2 border border-black rounded"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("meetingLink");
                    if (input && input.value) {
                      navigator.clipboard.writeText(input.value);
                    }
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Copy Link
                </button>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-[#018ABE] rounded-xl text-white px-6 py-2 text-lg"
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
