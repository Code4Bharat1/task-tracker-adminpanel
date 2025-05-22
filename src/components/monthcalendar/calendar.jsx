"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";
import TaskForm from "./task";
import EventPage from "./event";
import SchedulePage from "./schedule";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryColors = {
  "Daily Task": "bg-blue-600",
  "Meeting": "bg-red-500",
  "Reminder": "bg-green-500",
  "Deadline": "bg-purple-600",
  "Leaves": "bg-yellow-400",
  "Other": "bg-orange-400",
};

export default function CalendarPage() {
  const router = useRouter();
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("Task");
  const [eventsData, setEventsData] = useState({});
  const dropdownRef = useRef(null);

  // Dropdown menu items with their respective routes
  const dropdownItems = [
    { label: "Personal calendar", route: "/personalcalendar" },
    { label: "Month Calendar", route: "/monthcalendar" },
    { label: "Year Calendar", route: "/yearcalendar" },
   
  ];

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayKey(key);
    loadEventsData();
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

  const loadEventsData = () => {
    // Fixed the localStorage parsing issue
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const meetings = JSON.parse(localStorage.getItem("meetings") || "[]");

    const allEvents = [...tasks, ...events, ...meetings];
    const organizedData = {};
    
    allEvents.forEach(event => {
      const dateKey = event.date;
      if (!organizedData[dateKey]) {
        organizedData[dateKey] = [];
      }
      
      let category = "Other";
      if (event.type === "Task") category = "Daily Task";
      else if (event.type === "Event") category = event.category || "Other";
      else if (event.type === "Meeting") category = "Meeting";
      
      organizedData[dateKey].push({
        title: event.title,
        category,
        description: event.description,
        time: event.time,
        participants: event.participants || [],
        type: event.type
      });
    });
    
    setEventsData(organizedData);
  };

  const handleMonthChange = (direction) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction)
    );
  };

  const handleDateClick = (day, month, year) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events = eventsData[dateKey] || [];
    
    setSelectedDate({ day, month, year });
    setSelectedDateEvents(events);
    setShowEventModal(true);
  };

  const handleDropdownItemClick = (route) => {
    setShowDropdown(false);
    router.push(route);
  };

  const formatDateString = (day, month, year) => {
    const date = new Date(year, month, day);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  return (
    <div className="max-w-6xl mx-auto p-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl font-bold underline underline-offset-8 decoration-4 decoration-[#058CBF] font-[Poppins,sans-serif]">
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
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-20 w-48 border border-gray-200">
              {dropdownItems.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleDropdownItemClick(item.route)}
                  className="px-4 py-3 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors duration-150 flex items-center justify-between group"
                >
                  <span>{item.label}</span>
                  <svg 
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-gray-800 text-left">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
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
            <div
              key={`start-${i}`}
              className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = eventsData[dateKey] || [];
            const categories = [...new Set(events.map(event => event.category))];
            const weekday = (firstDay + day - 1) % 7;
            const isSunday = weekday === 0;
            const isToday = dateKey === todayKey;

            let bgClass = "bg-[#f2f4ff] text-black";
            if (isSunday) bgClass = "bg-sky-400 text-white";
            if (isToday) bgClass = "bg-black text-white";

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day, month, year)}
                className={`h-20 rounded-xl flex flex-col justify-center items-center text-sm font-medium shadow-sm cursor-pointer hover:shadow-md transition-shadow ${bgClass}`}
              >
                <span className="text-base">{day}</span>
                <div className="flex gap-1 mt-1">
                  {categories.map((category, idx) => (
                    <span
                      key={idx}
                      className={`w-4 h-4 rounded-sm ${
                        categoryColors[category] || "bg-orange-400"
                      }`}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}

          {Array.from({ length: endOffset }).map((_, i) => (
            <div
              key={`end-${i}`}
              className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-0 w-full max-w-lg relative">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 rounded-t-xl border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {formatDateString(selectedDate.day, selectedDate.month, selectedDate.year)}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No events scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <span className={`w-4 h-4 mt-1 rounded-sm flex-shrink-0 ${
                        categoryColors[event.category] || "bg-orange-400"
                      }`}></span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">{event.title}</h4>
                        {event.description && (
                          <p className="text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
                            categoryColors[event.category] || "bg-orange-400"
                          }`}>
                            {event.category}
                          </span>
                          {event.time && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.time}
                            </span>
                          )}
                        </div>
                        {event.participants && event.participants.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Participants:</p>
                            <div className="flex flex-wrap gap-1">
                              {event.participants.map((email, i) => (
                                <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t flex justify-between items-center">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories + Create Button */}
      <div className="flex flex-col md:flex-row items-start justify-between bg-white p-4 rounded-xl shadow-md mt-6 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Categories</h2>
          <div className="flex gap-10 text-sm font-medium">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-600 rounded-sm"></span> Daily
                Task
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-sm"></span> Meeting
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-sm"></span>{" "}
                Reminder
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-600 rounded-sm"></span>{" "}
                Deadline
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-400 rounded-sm"></span>{" "}
                Leaves
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
              >
                ✕
              </button>

              <div className="flex justify-around mb-4 border-b">
                {["Task", "Event", "Schedule Meeting"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-4 font-medium text-sm ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                {activeTab === "Task" && <TaskForm onClose={() => {
                  setShowCreateModal(false);
                  loadEventsData();
                }} />}
                {activeTab === "Event" && <EventPage onClose={() => {
                  setShowCreateModal(false);
                  loadEventsData();
                }} />}
                {activeTab === "Schedule Meeting" && <SchedulePage onClose={() => {
                  setShowCreateModal(false);
                  loadEventsData();
                }} />}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#058CBF] text-white font-bold px-5 py-2 rounded-lg drop-shadow-lg hover:bg-[#0b7bab] transition"
        >
          <TbCalendarPlus className="h-5 w-5 text-black" />
          CREATE
        </button>
      </div>
    </div>
  );
}