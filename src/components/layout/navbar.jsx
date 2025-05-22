'use client';
import React, { useState, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoVideocamOutline } from "react-icons/io5";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaRegBell, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa";
import { MdSend } from "react-icons/md"; // Post Upload icon
import axios from "axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    photoUrl: "" // Added photoUrl to state
  });
  const notifications = [];

  const router = useRouter();

  const toggleMeetingPopup = () => setShowMeetingPopup(!showMeetingPopup);

  const handleLogout = () => {
    toast.success("Logged out");
    router.push("/");
  };

  // Function to get profile image with fallback
  const getProfileImage = () => {
    return userData.photoUrl || "/profile.png";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/profile/getProfileAdmin`,
          { withCredentials: true }
        );
        setUserData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          photoUrl: response.data.photoUrl || "" // Include photoUrl in state
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to fetch user data.");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full px-8 py-4 flex flex-col sm:flex-row justify-end items-center bg-gradient-to-r from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] gap-4 sm:gap-0 relative">
      {/* Search Bar */}
      {/* <div className="flex items-center bg-white rounded-full px-4 py-2 w-full sm:w-[550px]">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by Team Member Name"
          className="w-full outline-none bg-transparent text-sm"
        />
      </div> */}

      {/* Icons */}
      <div className="flex items-center gap-x-10 relative">
        {/* Post Upload Icon */}
        <MdSend
          className="w-6 h-7 text-black cursor-pointer"
          onClick={() => router.push("/postupload")}
          title="Post Upload"
        />

        <Link href="/addemployees">
          <LuUserRoundPlus className="w-6 h-7 text-black cursor-pointer" />
        </Link>

        <IoVideocamOutline
          className="w-7 h-8 text-black cursor-pointer"
          onClick={toggleMeetingPopup}
        />

        {/* Notifications */}
        <div className="relative">
          <FaRegBell
            className="w-7 h-7 text-black cursor-pointer"
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

        {/* Profile Menu */}
        <div className="relative">
          {/* Use regular img tag for Cloudinary images */}
          <img
            src={getProfileImage()}
            alt="Profile"
            className="w-10 h-10 object-cover cursor-pointer rounded-full border-2 border-white"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-30">
              <div className="p-4 flex items-center gap-3">
                {/* Profile image in dropdown menu */}
                <img
                  src={getProfileImage()}
                  alt="Profile picture"
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div>
                  <div className="font-semibold">
                    {userData.fullName || "Admin"}
                  </div>
                  <div className="text-sm text-gray-500">{userData.email}</div>
                </div>
              </div>
              <div className="py-2">
                <Link href="/profile">
                  <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100 cursor-pointer">
                    <FaUser className="text-gray-600" />
                    <span>View Profile</span>
                  </div>
                </Link><div className="my-1">
                </div>
                <Link href="/setting">
                  <div
                    onClick={() => handleProfileAction()}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <FiSettings className="text-gray-600" />
                    <span>Settings</span>
                  </div>
                </Link>


                <div className="my-1"></div>
                
                <div
                  onClick={handleLogout}
                  className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100 text-red-500 cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Popup */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={toggleMeetingPopup}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md text-center w-[90%] sm:w-[500px]"
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
              </select>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full sm:w-1/2 p-2 border border-black rounded bg-white text-black"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full sm:w-1/2 p-2 border border-black rounded bg-white text-black"
                />
              </div>
              <select required className="w-full p-2 border border-black rounded">
                <option value="">Select Duration</option>
                <option>30 minutes</option>
                <option>1 hour</option>
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
                    if (input && input.value)
                      navigator.clipboard.writeText(input.value);
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