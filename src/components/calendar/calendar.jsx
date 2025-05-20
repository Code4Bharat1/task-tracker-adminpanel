"use client";
import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiClock, FiCalendar, FiUsers } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";
import { LuCalendarClock } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useRouter} from "next/navigation";
// Calendar constants
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Category definitions with colors and priorities
const categoryColors = {
  "Daily Task": "bg-blue-600",
  "Meeting": "bg-red-500",
  "Reminder": "bg-green-500",
  "Deadline": "bg-purple-600",
  "Leaves": "bg-yellow-400",
  "Other": "bg-orange-400",
};

const priorityOrder = [
  "Daily Task",
  "Meeting",
  "Reminder",
  "Deadline",
  "Leaves",
  "Other",
];

export default function CalendarPage() {
  const router = useRouter();
  const initialDate = new Date(); // Current month
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("Task");
  const [eventDates, setEventDates] = useState({});
  const [hoverDay, setHoverDay] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(new Date());
  const [taskTime, setTaskTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Daily Task");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participant, setParticipant] = useState("");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [remindBefore, setRemindBefore] = useState(15);

  // Refs
  const dropdownRef = useRef(null);
  const dayModalRef = useRef(null);

  // Generate times array
  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const ampm = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  });

  // Set today's date on component mount
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = formatDateKey(today);
    setTodayKey(key);
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Close time dropdowns when clicking outside
      if (!event.target.closest(".time-dropdown")) {
        setIsTimeDropdownOpen(false);
        setIsStartTimeOpen(false);
        setIsEndTimeOpen(false);
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch calendar data whenever the current date changes
  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  // Helper function to format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  // Fetch calendar data from the API
  const fetchCalendarData = async () => {
    // Mock data for demonstration
    const mockData = [
      {
        id: 1,
        title: "Team Meeting",
        description: "Weekly team sync",
        date: "2025-05-15",
        type: "Meeting",
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        participants: ["alice@example.com", "bob@example.com"]
      },
      {
        id: 2,
        title: "Project Deadline",
        description: "Complete the frontend implementation",
        date: "2025-05-18",
        type: "Deadline",
        time: "5:00 PM"
      },
      {
        id: 3,
        title: "Doctor's Appointment",
        description: "Annual checkup",
        date: "2025-05-20",
        type: "Reminder",
        time: "2:30 PM"
      },
      {
        id: 4,
        title: "Code Review",
        description: "Review PR #42",
        date: "2025-05-20",
        type: "Daily Task",
        time: "11:00 AM"
      },
      {
        id: 5,
        title: "Vacation",
        description: "Family trip",
        date: "2025-05-25",
        type: "Leaves",
        time: "All day"
      },
      {
        id: 6,
        title: "Budget Planning",
        description: "Q2 budget review",
        date: "2025-05-19",
        type: "Meeting",
        startTime: "2:00 PM",
        endTime: "4:00 PM",
        participants: ["finance@example.com", "ceo@example.com"]
      },
      {
        id: 7,
        title: "Gym Session",
        description: "Weekly workout",
        date: "2025-05-19",
        type: "Daily Task",
        time: "6:30 PM"
      }
    ];

    try {
      // In a real application, you would fetch from the API:
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/admin/calendar/user`, {
      //   credentials: "include",
      //   method: "GET",
      // });
      // const data = await res.json();

      // Using mock data for now
      const data = mockData;

      const groupedEvents = data.reduce((acc, item) => {
        const eventDate = new Date(item.date);
        const dateKey = formatDateKey(eventDate);

        const eventData = {
          id: item.id,
          title: item.title,
          description: item.description,
          participants: item.participants || [],
          time: item.time || null,
          startTime: item.startTime || null,
          endTime: item.endTime || null,
          category: item.category || item.type // Support both category and type fields
        };

        return {
          ...acc,
          [dateKey]: [...(acc[dateKey] || []), eventData]
        };
      }, {});

      setEventDates(groupedEvents);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      toast.error("Failed to load calendar data");
    }
  };

  // Handle changing the month
  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Handle date click - show events for the day
  const handleDateClick = (dateKey, events, event) => {
    setSelectedDate(dateKey);
    setSelectedDateEvents(events);
    setShowDayModal(true);

    // Calculate position for day modal (for better user experience)
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      // Position the modal near the clicked day but ensure it's visible
      setModalPosition({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
      });
    }
  };

  // Handle day hover
  const handleDayHover = (dateKey) => {
    setHoverDay(dateKey);
  };

  // Format date for display
  const formatDateForDisplay = (dateKey) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle task creation
  const handleTaskCreate = async () => {
    if (!taskTitle.trim() || !taskTime) {
      toast.error("Please fill all required fields!");
      return;
    }

    const taskData = {
      type: "Task",
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      time: taskTime,
      category: "Daily Task"
    };

    try {
      // In a real application, you would post to the API:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/admin/calendar`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(taskData),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create task');
      // }

      // Simulate successful creation
      toast.success("Task created successfully!");

      // Update local state for immediate feedback
      const dateKey = formatDateKey(taskDate);
      const newEvent = {
        id: Date.now(), // Temporary ID
        title: taskTitle,
        description: taskDescription,
        time: taskTime,
        category: "Daily Task"
      };

      setEventDates(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent]
      }));

      // Reset form and close modal
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    }
  };

  // Handle event creation
  const handleEventCreate = async () => {
    if (!taskTitle.trim() || !startTime) {
      toast.error("Please fill all required fields!");
      return;
    }

    const eventData = {
      type: "Event",
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      time: startTime,
      category: selectedCategory,
      reminder: true,
      remindBefore: parseInt(remindBefore, 10)
    };

    try {
      // Simulate successful creation
      toast.success("Event created successfully!");

      // Update local state for immediate feedback
      const dateKey = formatDateKey(taskDate);
      const newEvent = {
        id: Date.now(), // Temporary ID
        title: taskTitle,
        description: taskDescription,
        time: startTime,
        category: selectedCategory
      };

      setEventDates(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent]
      }));

      // Reset form and close modal
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Failed to create event");
    }
  };

  // Handle meeting creation
  const handleMeetingCreate = async () => {
    if (!taskTitle.trim() || !startTime || !endTime || !participant) {
      toast.error("Please fill all required fields!");
      return;
    }

    const meetingData = {
      type: "Meeting",
      category: "Meeting",
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      startTime,
      endTime,
      participants: [participant]
    };

    try {
      // Simulate successful creation
      toast.success("Meeting scheduled successfully!");

      // Update local state for immediate feedback
      const dateKey = formatDateKey(taskDate);
      const newEvent = {
        id: Date.now(), // Temporary ID
        title: taskTitle,
        description: taskDescription,
        startTime,
        endTime,
        participants: [participant],
        category: "Meeting"
      };

      setEventDates(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent]
      }));

      // Reset form and close modal
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error("Failed to schedule meeting");
    }
  };

  // Reset all form fields
  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDate(new Date());
    setTaskTime("");
    setSelectedCategory("Daily Task");
    setStartTime("");
    setEndTime("");
    setParticipant("");
    setRemindBefore(15);
  };

  // Calculate calendar grid parameters
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;

  return (
    <div className="max-w-6xl mx-auto p-3">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl font-bold underline underline-offset-8 decoration-4 decoration-red-500 font-[Poppins,sans-serif]">
          My Calendar
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="px-5 py-2 rounded-lg border border-[#877575] bg-white text-black font-medium transition duration-200 ease-in-out hover:bg-gray-100 hover:shadow"
            >
              Month
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-10 w-40">
                {[
                  { label: "Day", href: "/daycalendar" },
                  { label: "Month", href: "/calendar" },
                  { label: "Year", href: "/yearcalendar" },
                ].map((item) => (
                  <div key={item.label} onClick={() => {
                    setShowDropdown(false);
                    router.push(item.href); // Add this line
                  }}>
                    <div className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-gray-700">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#058CBF] text-white font-bold px-5 py-2 rounded-lg drop-shadow-lg hover:bg-[#0b7bab] transition"
          >
            <TbCalendarPlus className="h-5 w-5" />
            CREATE
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-gray-800">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Previous month"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Next month"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="py-4">
          <div className="h-2 w-full rounded-md mb-4 bg-[#D9D9D9]"></div>
          <div className="grid grid-cols-7 text-center font-semibold text-lg">
            {days.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mt-3">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-24 rounded-xl bg-[#f8f9ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = eventDates[dateKey] || [];
            const weekday = (firstDay + day - 1) % 7;
            const isSunday = weekday === 0;
            const isToday = dateKey === todayKey;
            const isHovered = dateKey === hoverDay;

            // Group events by category
            const groupedEvents = events.reduce((acc, event) => {
              acc[event.category] = (acc[event.category] || 0) + 1;
              return acc;
            }, {});

            // Sort by priority
            const sortedEvents = Object.entries(groupedEvents)
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.category);
                const bIndex = priorityOrder.indexOf(b.category);
                const aPriority = aIndex === -1 ? Infinity : aIndex;
                const bPriority = bIndex === -1 ? Infinity : bIndex;
                return aPriority - bPriority;
              });

            const displayedEvents = sortedEvents.slice(0, 3);
            const remainingTypes = sortedEvents.length - 3;

            let bgClass = "bg-[#f8f9ff] text-black";
            if (isSunday) bgClass = "bg-sky-50 text-black";
            if (isToday) bgClass = "bg-blue-50 border-2 border-blue-400 text-black";
            if (isHovered) bgClass = "bg-sky-100 text-black";

            return (
              <div
                key={`day-${day}`}
                onClick={(e) => handleDateClick(dateKey, events, e)}
                onMouseEnter={() => handleDayHover(dateKey)}
                onMouseLeave={() => handleDayHover(null)}
                className={`group relative h-24 rounded-xl flex flex-col justify-start items-start p-2 text-sm font-medium shadow-sm cursor-pointer hover:bg-sky-100 hover:shadow-md transition-all duration-200 ${bgClass}`}
              >
                <span className={`text-lg font-bold ${isToday ? "bg-blue-400 text-white w-7 h-7 rounded-full flex items-center justify-center" : ""}`}>
                  {day}
                </span>

                {/* Event indicators */}
                <div className="w-full mt-1 space-y-1">
                  {events.slice(0, 3).map((event, idx) => (
                    <div
                      key={`event-${idx}`}
                      className={`w-full px-1 py-0.5 rounded text-xs text-white font-medium truncate ${categoryColors[event.category] || "bg-gray-400"}`}
                      title={event.title}
                    >
                      {event.time && <span className="inline-block mr-1 opacity-80">⌚</span>}
                      {event.title}
                    </div>
                  ))}

                  {events.length > 3 && (
                    <div className="text-xs font-medium text-blue-500 pl-1">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {events.length > 0 && isHovered && (
                  <div className="absolute z-50 -translate-y-2 -translate-x-1/2 left-1/2 bottom-full w-64 bg-white text-gray-700 text-sm shadow-xl rounded-lg p-3 transition-opacity duration-200 pointer-events-none border border-gray-200">
                    <div className="text-lg font-bold mb-2 text-gray-800">
                      {`${months[month]} ${day}, ${year}`}
                    </div>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {events.map((event, index) => (
                        <li key={index} className="border-b pb-2 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-3 h-3 rounded-sm ${categoryColors[event.category] || ""}`}></span>
                            <span className="font-semibold truncate">{event.title}</span>
                          </div>
                          {event.startTime && event.endTime ? (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <FiClock className="inline-block" />
                              {event.startTime} - {event.endTime}
                            </div>
                          ) : event.time && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <FiClock className="inline-block" />
                              {event.time}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: endOffset }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-24 rounded-xl bg-[#f8f9ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-4 rounded-xl shadow-md mt-6">
        <h2 className="text-xl font-bold mb-3">Categories</h2>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          {Object.entries(categoryColors).map(([category, colorClass]) => (
            <div key={category} className="flex items-center gap-2">
              <span className={`w-4 h-4 ${colorClass} rounded-sm`}></span> {category}
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <FiX size={20} className="text-gray-500" />
            </button>

            {/* Tabs */}
            <div className="flex justify-around mb-6 border-b">
              {["Task", "Event", "Meeting"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 font-medium transition-all ${activeTab === tab
                    ? "border-b-4 border-[#018ABE] text-[#018ABE]"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {tab === "Meeting" ? "Schedule Meeting" : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Common Fields */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={`Add Title${activeTab === "Meeting" ? ", e.g., Project Stand-up Meeting" : ""}`}
                  className="w-full border-b border-gray-900 focus:outline-none py-2 text-gray-800 placeholder:text-gray-500 text-lg"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              {/* Date Picker - Common to all tabs */}
              <div className="mb-4 flex items-center gap-2 border-b border-gray-300 pb-3">
                <FiCalendar className="text-gray-600 text-xl" />
                <input
                  type="date"
                  value={taskDate.toISOString().split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTaskDate(new Date(e.target.value))}
                  className="flex-1 focus:outline-none text-gray-700"
                />
              </div>

              {/* Task Tab Content */}
              {activeTab === "Task" && (
                <>
                  <div className="mb-4 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className="w-full px-3 py-2 bg-[#F1F2F8] rounded-md text-left flex items-center justify-between"
                      >
                        <span>{taskTime || "Select time"}</span>
                        <IoMdArrowDropdown />
                      </button>

                      {isTimeDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {times.map((time, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTaskTime(time);
                                setIsTimeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1 hover:bg-blue-50 ${taskTime === time ? "bg-blue-100 text-blue-700" : ""
                                }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Add Description"
                      className="w-full bg-[#F1F8FB] px-4 py-2 rounded-lg shadow text-gray-700 placeholder:text-gray-500 border border-gray-300"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-2 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTaskCreate}
                      className="px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#046d93] transition font-medium"
                    >
                      Create
                    </button>
                  </div>
                </>
              )}

              {/* Event Tab Content */}
              {activeTab === "Event" && (
                <>
                  <div className="mb-4 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Category:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full px-3 py-2 bg-[#F1F2F8] rounded-md text-left flex items-center justify-between"
                      >
                        <span>{selectedCategory}</span>
                        <IoMdArrowDropdown />
                      </button>

                      {isCategoryOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {priorityOrder.filter(category => category !== "Meeting").map((category, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1 hover:bg-blue-50 ${selectedCategory === category ? "bg-blue-100 text-blue-700" : ""
                                }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
                        className="w-full px-3 py-2 bg-[#F1F2F8] rounded-md text-left flex items-center justify-between"
                      >
                        <span>{startTime || "Select time"}</span>
                        <IoMdArrowDropdown />
                      </button>

                      {isStartTimeOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {times.map((time, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setStartTime(time);
                                setIsStartTimeOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1 hover:bg-blue-50 ${startTime === time ? "bg-blue-100 text-blue-700" : ""
                                }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Add Description"
                      className="w-full bg-[#F1F8FB] px-4 py-2 rounded-lg shadow text-gray-700 placeholder:text-gray-500 border border-gray-300"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Remind Before (minutes):</label>
                    <input
                      type="number"
                      value={remindBefore}
                      onChange={(e) => setRemindBefore(e.target.value)}
                      className="w-20 px-2 py-1 border rounded"
                      min="1"
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-2 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEventCreate}
                      className="px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#046d93] transition font-medium"
                    >
                      Create
                    </button>
                  </div>
                </>
              )}

              {/* Meeting Tab Content */}
              {activeTab === "Meeting" && (
                <>
                  <div className="mb-4 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="flex items-center gap-2">
                      {/* Start Time */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
                          className="w-full px-3 py-2 bg-[#F1F2F8] rounded-md text-left flex items-center justify-between"
                        >
                          <span>{startTime || "Start"}</span>
                          <IoMdArrowDropdown />
                        </button>

                        {isStartTimeOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {times.map((time, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setStartTime(time);
                                  setIsStartTimeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1 hover:bg-blue-50 ${startTime === time ? "bg-blue-100 text-blue-700" : ""
                                  }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-gray-500">to</span>

                      {/* End Time */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}
                          className="w-full px-3 py-2 bg-[#F1F2F8] rounded-md text-left flex items-center justify-between"
                        >
                          <span>{endTime || "End"}</span>
                          <IoMdArrowDropdown />
                        </button>

                        {isEndTimeOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {times.map((time, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setEndTime(time);
                                  setIsEndTimeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1 hover:bg-blue-50 ${endTime === time ? "bg-blue-100 text-blue-700" : ""
                                  }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Add Participant:</label>
                    <div className="relative">
                      <select
                        value={participant}
                        onChange={(e) => setParticipant(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-[#F8FDFF] appearance-none"
                      >
                        <option value="" disabled>Select Email Address</option>
                        <option value="alice@example.com">alice@example.com</option>
                        <option value="bob@example.com">bob@example.com</option>
                        <option value="user1@example.com">user1@example.com</option>
                        <option value="user2@example.com">user2@example.com</option>
                      </select>
                      <IoMdArrowDropdown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Meeting Description"
                      className="w-full bg-[#F1F8FB] px-4 py-2 rounded-lg shadow text-gray-700 placeholder:text-gray-500 border border-gray-300"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-2 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMeetingCreate}
                      className="px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#046d93] transition font-medium"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDayModal(false)}
        >
          <div
            ref={dayModalRef}
            className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${Math.min(Math.max(0, modalPosition.left - 400), window.innerWidth - 500)}px, ${Math.min(Math.max(0, modalPosition.top - 200), window.innerHeight - 400)}px)`,
              transition: 'all 0.2s ease-out'
            }}
          >
            <button
              onClick={() => setShowDayModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <FiX size={20} className="text-gray-500" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {formatDateForDisplay(selectedDate)}
              </h2>
              <p className="text-gray-600">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">No events scheduled</div>
                <p className="text-gray-500">This day is free from any scheduled events.</p>
                <button
                  onClick={() => {
                    setShowDayModal(false);
                    setSelectedDate(selectedDate);
                    const date = new Date(selectedDate);
                    setTaskDate(date);
                    setShowModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#046d93] transition"
                >
                  Add Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((event, index) => (
                  <div
                    key={`event-detail-${index}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`inline-block w-4 h-4 rounded-sm mt-1 ${categoryColors[event.category] || "bg-gray-400"}`}></span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-gray-600 mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Category:</span>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${categoryColors[event.category] || "bg-gray-400"}`}>
                              {event.category}
                            </span>
                          </div>

                          {event.category === "Meeting" ? (
                            <>
                              {event.startTime && event.endTime && (
                                <div className="flex items-center gap-1">
                                  <FiClock className="text-gray-400" />
                                  <span>{event.startTime} - {event.endTime}</span>
                                </div>
                              )}
                              {event.participants?.length > 0 && (
                                <div className="w-full mt-2">
                                  <span className="flex items-center gap-1 font-medium text-gray-700 mb-1">
                                    <FiUsers className="text-gray-400" />
                                    Participants:
                                  </span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {event.participants.map((participant, pIdx) => (
                                      <span
                                        key={`participant-${pIdx}`}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                      >
                                        {participant}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            event.time && (
                              <div className="flex items-center gap-1">
                                <FiClock className="text-gray-400" />
                                <span>{event.time}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDayModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDayModal(false);
                  setSelectedDate(selectedDate);
                  const date = new Date(selectedDate);
                  setTaskDate(date);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#046d93] transition"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}