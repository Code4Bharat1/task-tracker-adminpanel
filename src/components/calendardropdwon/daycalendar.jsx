'use client'
import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const router = useRouter();
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");

  const underlineRef = useRef(null);

  useGSAP(() => {
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { width: "0%" },
        { width: "100%", duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  const handleDateClick = (dateKey) => {
    alert(`Clicked date: ${dateKey}`);
    // Or navigate: router.push(`/calendar/${dateKey}`)
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;

  return (
    <div className="w-[700px] mx-auto p-3">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold mb-1 relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 top-10 h-[4px] bg-[#ee0b13] w-full"
          ></span>
          My Calendar
        </h2>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-2 md:p-4">
        {/* Month header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg md:text-xl font-bold text-gray-800">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of the week */}
        <div className="py-2">
          <div className="h-1 w-full rounded-md mb-3 bg-[#D9D9D9]"></div>
          <div className="grid grid-cols-7 text-center font-semibold text-xs sm:text-sm">
            {days.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
          {/* Start offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`start-${i}`}
              className="h-12 sm:h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}

          {/* Month days */}
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
              <div
                key={day}
                onClick={() => handleDateClick(dateKey)}
                className={`h-12 sm:h-16 rounded-lg flex flex-col items-center justify-between py-1 sm:py-2 shadow-sm cursor-pointer hover:bg-sky-400 transition ${bgClass}`}
              >
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold">{day}</span>
                </div>
                <div className="flex gap-1">
                  {events.map((event, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${categoryColors[event] || ""}`}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* End offset */}
          {Array.from({ length: endOffset }).map((_, i) => (
            <div
              key={`end-${i}`}
              className="h-12 sm:h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
