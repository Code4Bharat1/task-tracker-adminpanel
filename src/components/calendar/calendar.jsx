"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryColors = {
  "Daily Task": "bg-blue-600",
  Meeting: "bg-red-500",
  Reminder: "bg-green-500",
  Deadline: "bg-purple-600",
  Leaves: "bg-yellow-400",
  Other: "bg-orange-400",
};

const eventDates = {
  "2025-05-01": ["Daily Task"],
  "2025-05-03": ["Daily Task", "Meeting"],
  "2025-05-05": ["Deadline"],
};

export default function CalendarPage() {
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;

  return (
    <div className="max-w-6xl mx-auto p-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl font-bold underline underline-offset-8 decoration-4 decoration-red-500 font-[Poppins,sans-serif]">
          My Calendar
        </h1>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="px-5 py-2 rounded-lg border border-[#877575] bg-white text-black font-medium transition duration-200 ease-in-out hover:bg-gray-100 hover:shadow ml-auto"
          >
            Month
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow z-10 w-40">
              {[
                { label: "Day", href: "/day-view" },
                { label: "Month", href: "/month-view" },
                { label: "Year", href: "/year-view" },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-gray-700">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-xl font-bold text-gray-800 mb-4 text-center">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </div>

        <div className="py-6">
          <div className="h-2 w-full rounded-md mb-4 bg-[#D9D9D9]"></div>
          <div className="grid grid-cols-7 text-center font-semibold text-lg">
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mt-3">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`start-${i}`} className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = eventDates[dateKey] || [];
            const weekday = (firstDay + day - 1) % 7;
            const isSunday = weekday === 0;
            const isToday = dateKey === todayKey;

            let bgClass = "bg-[#f2f4ff] text-black";
            if (isSunday) bgClass = "bg-sky-400 text-white";
            if (isToday) bgClass = "bg-black text-white";

            return (
              <Link key={day} href={`/day-view?date=${dateKey}`}>
                <div className={`h-20 rounded-xl flex flex-col justify-center items-center text-sm font-medium shadow-sm cursor-pointer hover:bg-sky-400 transition ${bgClass}`}>
                  <span>{day}</span>
                  <div className="flex gap-1 mt-1">
                    {events.map((event, idx) => (
                      <span key={idx} className={`w-4 h-4 rounded-sm ${categoryColors[event] || ""} hover:opacity-75`}></span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}

          {Array.from({ length: endOffset }).map((_, i) => (
            <div key={`end-${i}`} className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories + Create Button */}
      <div className="flex flex-col md:flex-row items-start justify-between bg-white p-4 rounded-xl shadow-md mt-6 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Categories</h2>
          <div className="flex gap-10 text-sm font-medium">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-600 rounded-sm"></span> Daily Task
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-sm"></span> Meeting
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-sm"></span> Reminder
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-600 rounded-sm"></span> Deadline
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-400 rounded-sm"></span> Leaves
              </div>
            </div>
          </div>
        </div>

        <Link href="/TaskForm">
          <button className="flex items-center gap-2 bg-[#058CBF] text-white font-bold px-5 py-2 rounded-lg drop-shadow-lg hover:bg-[#0b7bab] transition">
            <TbCalendarPlus className="h-5 w-5 text-black" />
            CREATE
          </button>
        </Link>
      </div>
    </div>
  );
}
