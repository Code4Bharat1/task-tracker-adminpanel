"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiCalendar } from "react-icons/fi";

export default function ViewTimesheet() {
  const dummyTimesheetData = [
    {
      date: "2025-05-11",
      entries: [
        {
          bucket: "Project",
          task: "Make timesheet page ,Make timesheet page,Make timesheet page,Make timesheet page,Make timesheet page ",
          time: "09:00 AM to 10:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Design UI ,Design U ,Design U , Design U , Design U ,Design U",
          time: "10:00 AM to 11:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Write components",
          time: "11:00 AM to 12:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "API integration",
          time: "12:00 PM to 01:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Meeting",
          task: "Team meeting",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Fix bugs",
          time: "02:00 PM to 03:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Miscellaneous",
          task: "Code cleanup",
          time: "03:00 PM to 04:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Write documentation",
          time: "04:00 PM to 05:00 PM",
          duration: "01:00",
        },
      ],
    },
    {
      date: "2025-05-12",
      entries: [
        {
          bucket: "Project",
          task: "Dashboard setup",
          time: "09:00 AM to 10:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Form validation",
          time: "10:00 AM to 11:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Meeting",
          task: "Call with Prashant",
          time: "11:00 AM to 12:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Handle routing",
          time: "12:00 PM to 01:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Miscellaneous",
          task: "Testing",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Deploy to staging",
          time: "02:00 PM to 03:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Backend sync",
          time: "03:00 PM to 04:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Git commits",
          time: "04:00 PM to 05:00 PM",
          duration: "01:00",
        },
      ],
    },
    {
      date: "2025-05-13",
      entries: [
        {
          bucket: "Project",
          task: "Login UI design",
          time: "09:00 AM to 10:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Auth logic",
          time: "10:00 AM to 11:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Meeting",
          task: "Daily standup",
          time: "11:00 AM to 12:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Write reducers",
          time: "12:00 PM to 01:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Miscellaneous",
          task: "Update changelog",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Integrate socket.io",
          time: "02:00 PM to 03:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Add loading states",
          time: "03:00 PM to 04:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Optimize images",
          time: "04:00 PM to 05:00 PM",
          duration: "01:00",
        },
      ],
    },
    {
      date: "2025-05-14",
      entries: [
        {
          bucket: "Project",
          task: "Fix UI bugs",
          time: "09:00 AM to 10:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Improve responsiveness",
          time: "10:00 AM to 11:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Test on mobile",
          time: "11:00 AM to 12:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Light/dark mode",
          time: "12:00 PM to 01:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Meeting",
          task: "Review session",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Miscellaneous",
          task: "Sync with backend",
          time: "02:00 PM to 03:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "User feedback fixes",
          time: "03:00 PM to 04:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Write test cases",
          time: "04:00 PM to 05:00 PM",
          duration: "01:00",
        },
      ],
    },
    {
      date: "2025-05-15",
      entries: [
        {
          bucket: "Project",
          task: "Work on charts",
          time: "09:00 AM to 10:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Add pagination",
          time: "10:00 AM to 11:00 AM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Fix typos",
          time: "11:00 AM to 12:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Meeting",
          task: "Client feedback call",
          time: "12:00 PM to 01:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Miscellaneous",
          task: "Git merge & cleanup",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Export PDF reports",
          time: "02:00 PM to 03:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Setup analytics",
          time: "03:00 PM to 04:00 PM",
          duration: "01:00",
        },
        {
          bucket: "Project",
          task: "Review pull requests",
          time: "04:00 PM to 05:00 PM",
          duration: "01:00",
        },
      ],
    },
    // Add more data for April
    {
      date: "2025-04-28",
      entries: [
        {
          bucket: "Project",
          task: "April task 1",
          time: "09:00 AM to 11:00 AM",
          duration: "02:00",
        },
        {
          bucket: "Meeting",
          task: "April meeting",
          time: "01:00 PM to 02:00 PM",
          duration: "01:00",
        },
      ],
    },
    // Add data for different years
    {
      date: "2024-05-15",
      entries: [
        {
          bucket: "Project",
          task: "Last year task",
          time: "09:00 AM to 01:00 PM",
          duration: "04:00",
        },
      ],
    },
  ];

  const [currentView, setCurrentView] = useState("day");

  const [useSingleDayFilter, setUseSingleDayFilter] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedName, setSelectedName] = useState("Chinmay Gawade");
  const [nameSearch, setNameSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [filteredTimesheetData, setFilteredTimesheetData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const nameOptions = [
    "Chinmay Gawade",
    "John Smith",
    "Sarah Johnson",
    "Alex Chen",
  ];

  const filteredNames = nameOptions.filter((name) =>
    name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const viewDropdownRef = useRef(null);
  // Generate years (from 2020 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 6 },
    (_, i) => 2020 + i
  );

  // Helper function to get the first and last day of the week for a given date
  const getWeekRange = (date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Calculate the first day (Sunday) of the week
    const firstDay = new Date(currentDate);
    firstDay.setDate(currentDate.getDate() - day);

    // Calculate the last day (Saturday) of the week
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  // Helper function to get the first and last day of the month
  const getMonthRange = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  // Helper function to get the first and last day of the year
  const getYearRange = (year) => {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(event.target)
      ) {
        setIsViewOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Update date ranges when view changes
  useEffect(() => {
    const today = new Date();
    let dateRange = {};

    if (currentView === "day") {
      // Use the selected date for day view
      setSelectedDate(today.toISOString().split("T")[0]);
      // For day view, filter to only show the selected date
      const filtered = dummyTimesheetData.filter(
        (item) => item.date === today.toISOString().split("T")[0]
      );
      setFilteredTimesheetData(filtered);
      return;
    } else if (currentView === "week") {
      // Just use the current date for week view
      setSelectedDate(today.toISOString().split("T")[0]);
      dateRange = getWeekRange(today.toISOString().split("T")[0]);
    } else if (currentView === "month") {
      // Use current month and year
      setSelectedMonth(today.getMonth() + 1);
      setSelectedYear(today.getFullYear());
      dateRange = getMonthRange(today.getFullYear(), today.getMonth() + 1);
    } else if (currentView === "year") {
      // Use current year
      setSelectedYear(today.getFullYear());
      dateRange = getYearRange(today.getFullYear());
    }

    const filtered = dummyTimesheetData.filter((item) => {
      return item.date >= dateRange.firstDay && item.date <= dateRange.lastDay;
    });

    setFilteredTimesheetData(filtered);
  }, [currentView]);

  // Update filtered data when date selections change
  useEffect(() => {
    if (currentView === "day") {
      // For day view, only show the selected date
      const filtered = dummyTimesheetData.filter(
        (item) => item.date === selectedDate
      );
      setFilteredTimesheetData(filtered);
      return;
    }

    let dateRange = {};

    if (currentView === "week") {
      dateRange = getWeekRange(selectedDate);
    } else if (currentView === "month") {
      dateRange = getMonthRange(selectedYear, selectedMonth);
    } else if (currentView === "year") {
      dateRange = getYearRange(selectedYear);
    }

    const filtered = dummyTimesheetData.filter((item) => {
      return item.date >= dateRange.firstDay && item.date <= dateRange.lastDay;
    });

    setFilteredTimesheetData(filtered);
  }, [selectedDate, selectedMonth, selectedYear, currentView]);

  // Total Duration Calculation
  function calculateTotalDuration(entries) {
    let totalMinutes = 0;
    entries.forEach((entry) => {
      const [hours, minutes] = entry.duration.split(":").map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // Calculate grand total duration
  function calculateGrandTotal() {
    let totalMinutes = 0;
    filteredTimesheetData.forEach((day) => {
      day.entries.forEach((entry) => {
        const [hours, minutes] = entry.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
      });
    });

    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        {/* Left side filters grouped here */}
        <div className="flex flex-wrap gap-14 items-center">
          <div className="flex flex-col relative" ref={viewDropdownRef}>
            <button
              onClick={() => setIsViewOpen(!isViewOpen)}
              className={`border border-gray-300 px-3 py-2 bg-white flex justify-between items-center min-w-32 ${
                isViewOpen ? "rounded-t-md" : "rounded-md"
              }`}
            >
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              <svg
                className={`ml-2 w-4 h-4 transition-transform ${
                  isViewOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {isViewOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 border-t-0 z-10">
                {["day", "week", "month", "year"].map((view) => (
                  <div
                    key={view}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setCurrentView(view);
                      setUseSingleDayFilter(view === "day");
                      setIsViewOpen(false);
                    }}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(currentView === "day" || currentView === "week") && (
            <div className="flex flex-col">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          )}

          {currentView === "month" && (
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1} className="bg-white">
                      {month}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
                >
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-white">
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {currentView === "year" && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="bg-white">
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          )}
        </div>
        {currentView === "year" && (
          <div className="flex flex-col">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right side search bar */}
        <div className="relative w-90">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Enter name"
            className="border border-gray-300 rounded-full pl-14 pr-3 py-2 w-full"
          />
          {showDropdown && filteredNames.length > 0 && (
            <ul className="absolute z-10 w-full max-h-40 overflow-auto border border-gray-300 rounded-md bg-white mt-1">
              {filteredNames.map((name) => (
                <li
                  key={name}
                  onClick={() => {
                    setSelectedName(name);
                    setNameSearch(name);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#018ABE]">
          {selectedName}'s Timesheet -{" "}
          {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
        </h2>
        {currentView === "day" && (
          <p className="text-gray-600">
            {selectedDate ? formatDate(selectedDate) : "Select a date"}
          </p>
        )}
        {currentView === "week" && (
          <p className="text-gray-600">
            Week of {getWeekRange(selectedDate).firstDay} to{" "}
            {getWeekRange(selectedDate).lastDay}
          </p>
        )}
        {currentView === "month" && (
          <p className="text-gray-600">
            {months[selectedMonth - 1]} {selectedYear}
          </p>
        )}
        {currentView === "year" && (
          <p className="text-gray-600">Year {selectedYear}</p>
        )}
      </div>

      {/* Timesheet Tables */}
      {filteredTimesheetData.length > 0 ? (
        <>
          {filteredTimesheetData.map((dayData, dayIndex) => (
            <div key={dayData.date} className="mb-6">
              {/* Date heading moved outside of the table */}
              <h3 className="bg-white p-3 font-medium rounded-t-md">
                {formatDate(dayData.date)}
              </h3>

              {/* Header row moved outside the table */}
              <div className="overflow-x-auto">
                <div className="flex w-full  bg-[#018ABE] text-white font-semibold p-2 rounded-t-md">
                  <div className="text-center  w-[12%]  ">Bucket</div>
                  <div className="text-left px-20  w-[60%] border-l border-white">
                    Task
                  </div>
                  <div className="text-center  w-[20%] border-l border-white ">
                    Time
                  </div>
                  <div className="text-center w-[8%] border-l border-white ">
                    Duration
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-b-md overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {dayData.entries.map((entry, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 w-[10%] py-3 text-center">
                            {entry.bucket}
                          </td>
                          <td className="px-4 py-3 w-[56%] pl-10 relative text-left">
                            <span className="custom-border-left"></span>{" "}
                            {entry.task}
                          </td>
                          <td className="px-4 py-3 w-[19%] relative text-center">
                            <span className="custom-border-left"></span>
                            {entry.time}
                          </td>
                          <td className="px-4 py-3 w-[8%] relative text-center">
                            <span className="custom-border-left"></span>
                            {entry.duration}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[#018ABE] text-white">
                        <td
                          colSpan={3}
                          className="py-2 text-right px-27 font-semibold"
                        >
                          Day Total
                        </td>
                        <td className="px-4 py-2 border-l border-gray-100 text-center font-semibold">
                          {calculateTotalDuration(dayData.entries)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gray-100 p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Grand Total</span>
              <span className="font-bold text-lg text-[#018ABE]">
                {calculateGrandTotal()}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCalendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No timesheet data found for the selected {currentView}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
