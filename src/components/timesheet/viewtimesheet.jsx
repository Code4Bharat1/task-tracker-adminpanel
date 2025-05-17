"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronDown,
  FiSliders,
  FiUsers,
  FiClock,
  FiPlus,
  FiMinus,
  FiPieChart
} from "react-icons/fi";
import axios from "axios";

// Constants
const PAGE_SIZE = 20;
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ViewTimesheet() {
  // View state
  const [currentView, setCurrentView] = useState("day");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Employee selection states
  const [selectedName, setSelectedName] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Date and filter states
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [filterBuckets, setFilterBuckets] = useState([]);
  const [selectedBuckets, setSelectedBuckets] = useState([]);
  const [dateRange, setDateRange] = useState({ firstDay: "", lastDay: "" });

  // Data states
  const [employeeList, setEmployeeList] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [timesheetData, setTimesheetData] = useState([]);
  const [filteredTimesheetData, setFilteredTimesheetData] = useState([]);

  // Summary view states
  const [showSummaryView, setShowSummaryView] = useState(false);
  const [summaryData, setSummaryData] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [showBucketAnalysis, setShowBucketAnalysis] = useState(false);

  // Search debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  // Refs for clickaway
  const viewDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Generate years (from 2020 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 6 }, (_, i) => 2020 + i);

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

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(nameSearch);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [nameSearch]);

  // Fetch timesheet data with pagination and filtering
  const fetchTimesheets = async (page = 1) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // In a real implementation, these parameters would be sent to the backend
      // for optimized data filtering and pagination
      const params = {
        page,
        limit: PAGE_SIZE,
        employeeName: selectedName,
        dateRange: {
          startDate: dateRange.firstDay,
          endDate: dateRange.lastDay
        },
        buckets: selectedBuckets
      };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/timesheet/admin/timesheets`,
        {
          withCredentials: true,
          params // These would be used by a properly implemented backend
        }
      );

      if (response.data.success) {
        // For now, we'll do client-side pagination and filtering
        // since we're working with the existing API response
        const formattedData = formatTimesheetData(response.data.data);
        setTimesheetData(formattedData);

        // Extract unique employee names for the dropdown
        const employees = [...new Set(response.data.data.map(sheet =>
          `${sheet.userId.firstName} ${sheet.userId.lastName}`
        ))];

        setEmployeeList(employees);
        setFilteredEmployees(employees.filter(name =>
          name.toLowerCase().includes(debouncedSearch.toLowerCase())
        ).slice(0, 100)); // Limit displayed results to 100 max

        // If no employee selected yet, select the first one
        if (!selectedName && employees.length > 0) {
          setSelectedName(employees[0]);
          setNameSearch(employees[0]);
        }

        // Extract unique bucket types for filtering
        const buckets = [...new Set(
          response.data.data.flatMap(sheet =>
            sheet.items.map(item => item.bucket)
          )
        )];
        setFilterBuckets(buckets);

        // Generate summary data
        generateSummaryData(formattedData);

        // Update filtered data
        updateFilteredData(formattedData);

        // Calculate total pages
        // In a real implementation, this would come from the backend response
        const total = Math.ceil(formattedData.length / PAGE_SIZE);
        setTotalPages(total > 0 ? total : 1);
      } else {
        setErrorMessage("Failed to load timesheet data");
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load timesheet data");
    } finally {
      setIsLoading(false);
    }
  };

  // Format the API response into the structure we need
  const formatTimesheetData = (apiData) => {
    // Group entries by date
    const entriesByDate = {};

    apiData.forEach(timesheet => {
      const userName = `${timesheet.userId.firstName} ${timesheet.userId.lastName}`;

      // Only process entries for the selected user
      if (!selectedName || userName === selectedName) {
        // Use the timesheet date as the base date
        const date = timesheet.date;

        if (!entriesByDate[date]) {
          entriesByDate[date] = {
            date,
            entries: []
          };
        }

        // Process each timesheet item
        timesheet.items.forEach(item => {
          entriesByDate[date].entries.push({
            bucket: item.bucket || "Uncategorized",
            task: item.task,
            time: item.timeRange,
            duration: item.duration,
            userId: timesheet.userId._id,
            userName
          });
        });
      }
    });

    // Convert to array and sort by date
    return Object.values(entriesByDate).sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  };

  // Generate summary data for the quick view
  const generateSummaryData = (data) => {
    // Initialize summary structure
    const summary = {
      totalHours: 0,
      totalMinutes: 0,
      bucketBreakdown: {},
      dailyTotals: {}
    };

    // Process each day's data
    data.forEach(day => {
      // Initialize daily total
      if (!summary.dailyTotals[day.date]) {
        summary.dailyTotals[day.date] = { totalMinutes: 0, buckets: {} };
      }

      // Process each entry
      day.entries.forEach(entry => {
        const [hours, minutes] = entry.duration.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes;

        // Update global totals
        summary.totalMinutes += totalMinutes;

        // Update daily totals
        summary.dailyTotals[day.date].totalMinutes += totalMinutes;

        // Update bucket breakdown
        if (!summary.bucketBreakdown[entry.bucket]) {
          summary.bucketBreakdown[entry.bucket] = 0;
        }
        summary.bucketBreakdown[entry.bucket] += totalMinutes;

        // Update daily bucket breakdown
        if (!summary.dailyTotals[day.date].buckets[entry.bucket]) {
          summary.dailyTotals[day.date].buckets[entry.bucket] = 0;
        }
        summary.dailyTotals[day.date].buckets[entry.bucket] += totalMinutes;
      });
    });

    // Convert minutes to hours:minutes format
    summary.totalHours = convertToHoursMinutes(summary.totalMinutes);

    // Convert daily totals
    Object.keys(summary.dailyTotals).forEach(date => {
      summary.dailyTotals[date].totalHours =
        convertToHoursMinutes(summary.dailyTotals[date].totalMinutes);

      // Convert bucket minutes to hours
      Object.keys(summary.dailyTotals[date].buckets).forEach(bucket => {
        summary.dailyTotals[date].buckets[bucket] =
          convertToHoursMinutes(summary.dailyTotals[date].buckets[bucket]);
      });
    });

    // Convert bucket breakdown minutes to hours
    Object.keys(summary.bucketBreakdown).forEach(bucket => {
      summary.bucketBreakdown[bucket] =
        convertToHoursMinutes(summary.bucketBreakdown[bucket]);
    });

    setSummaryData(summary);
  };

  // Helper to convert minutes to hours:minutes format
  const convertToHoursMinutes = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // Update filtered data based on current view and filters
  const updateFilteredData = (data = timesheetData) => {
    let newDateRange = {};

    if (currentView === "day") {
      // For day view, only show the selected date
      newDateRange = {
        firstDay: selectedDate,
        lastDay: selectedDate
      };
    } else if (currentView === "week") {
      newDateRange = getWeekRange(selectedDate);
    } else if (currentView === "month") {
      newDateRange = getMonthRange(selectedYear, selectedMonth);
    } else if (currentView === "year") {
      newDateRange = getYearRange(selectedYear);
    }

    setDateRange(newDateRange);

    // Filter by date range and selected buckets
    const filtered = data.filter(item => {
      const dateMatch = item.date >= newDateRange.firstDay && item.date <= newDateRange.lastDay;

      // If bucket filters are applied
      if (selectedBuckets.length > 0) {
        return dateMatch && item.entries.some(entry => selectedBuckets.includes(entry.bucket));
      }

      return dateMatch;
    });

    // Apply pagination
    const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    setFilteredTimesheetData(paginatedData);

    // Update total pages
    const total = Math.ceil(filtered.length / PAGE_SIZE);
    setTotalPages(total > 0 ? total : 1);
  };

  // Toggle day expansion in summary view
  const toggleDayExpansion = (date) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Handle filter changes
  const toggleBucketFilter = (bucket) => {
    if (selectedBuckets.includes(bucket)) {
      setSelectedBuckets(selectedBuckets.filter(b => b !== bucket));
    } else {
      setSelectedBuckets([...selectedBuckets, bucket]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTimesheets();
  }, []);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target)) {
        setIsViewOpen(false);
      }

      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }

      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update filtered data when selections change
  useEffect(() => {
    updateFilteredData();
  }, [selectedDate, selectedMonth, selectedYear, currentView, selectedBuckets, selectedName, currentPage]);

  // Update filtered employees when search changes
  useEffect(() => {
    if (debouncedSearch) {
      const filtered = employeeList.filter(name =>
        name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ).slice(0, 100); // Limit to 100 results for performance
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employeeList.slice(0, 100));
    }
  }, [debouncedSearch, employeeList]);

  // When employee selection changes, refresh data and reset page
  useEffect(() => {
    if (selectedName) {
      setCurrentPage(1);
      fetchTimesheets(1);
    }
  }, [selectedName]);

  // Calculate duration for a single day
  function calculateTotalDuration(entries) {
    let totalMinutes = 0;
    entries.forEach((entry) => {
      const [hours, minutes] = entry.duration.split(":").map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    return convertToHoursMinutes(totalMinutes);
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
    return convertToHoursMinutes(totalMinutes);
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


  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Memoized summary view content
  const summaryViewContent = useMemo(() => {
    const sortedDates = Object.keys(summaryData.dailyTotals || {}).sort((a, b) =>
      new Date(b) - new Date(a)
    );

    return (
      <div className="bg-white rounded-md shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-[#018ABE] text-lg">Time Summary</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setShowBucketAnalysis(!showBucketAnalysis)}
              className={`flex items-center gap-1 text-sm ${showBucketAnalysis ? 'text-[#018ABE] font-medium' : 'text-gray-600'}`}
            >
              <FiPieChart className="w-4 h-4" />
              <span>Bucket Analysis</span>
            </button>
          </div>
        </div>

        {showBucketAnalysis && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <h4 className="font-medium mb-3">Bucket Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(summaryData.bucketBreakdown || {}).map(([bucket, duration]) => (
                <div key={bucket} className="bg-white p-3 rounded-md shadow-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                    {bucket}
                  </span>
                  <div className="mt-2 font-medium text-lg">{duration}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm text-gray-600">Total Hours</h4>
              <p className="font-bold text-xl text-[#018ABE]">{summaryData.totalHours}</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm text-gray-600">Days Tracked</h4>
              <p className="font-bold text-xl text-[#018ABE]">{sortedDates.length}</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm text-gray-600">Daily Average</h4>
              <p className="font-bold text-xl text-[#018ABE]">
                {sortedDates.length ?
                  convertToHoursMinutes(summaryData.totalMinutes / sortedDates.length) :
                  "00:00"}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm text-gray-600">Bucket Categories</h4>
              <p className="font-bold text-xl text-[#018ABE]">
                {Object.keys(summaryData.bucketBreakdown || {}).length}
              </p>
            </div>
          </div>

          <h4 className="font-medium mb-3">Daily Breakdown</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {sortedDates.map(date => (
              <div key={date} className="border border-gray-200 rounded-md overflow-hidden">
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleDayExpansion(date)}
                >
                  <div className="flex items-center gap-2">
                    {expandedDays[date] ? <FiMinus className="text-gray-500" /> : <FiPlus className="text-gray-500" />}
                    <span>{formatDate(date)}</span>
                  </div>
                  <div className="font-medium text-[#018ABE]">
                    {summaryData.dailyTotals[date].totalHours}
                  </div>
                </div>

                {expandedDays[date] && (
                  <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(summaryData.dailyTotals[date].buckets).map(([bucket, hours]) => (
                        <div key={bucket} className="flex justify-between items-center p-2 bg-white rounded-md">
                          <span className="text-sm">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-800 mr-2">
                              {bucket}
                            </span>
                          </span>
                          <span className="font-medium">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [summaryData, expandedDays, showBucketAnalysis]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#018ABE]">
          Timesheet Viewer
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSummaryView(!showSummaryView)}
            className={`border px-3 py-2 rounded-md flex items-center gap-2 ${showSummaryView
              ? 'bg-[#018ABE] text-white border-[#018ABE]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <FiPieChart className="w-4 h-4" />
            <span>{showSummaryView ? 'Hide Summary' : 'Show Summary'}</span>
          </button>

          <button
            onClick={fetchTimesheets}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center gap-2 hover:bg-gray-50"
            disabled={isLoading}
          >
            <FiRefreshCw className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>

        </div>
      </div>

      {/* Main Controls */}
      <div className="bg-white p-4 rounded-md shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
          {/* Employee selector */}
          <div className="relative w-full lg:w-1/3" ref={employeeDropdownRef}>
            <label className="block text-sm text-gray-600 mb-1">Employee</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiUsers className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Search employee name"
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full"
              />
              {selectedName && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => {
                      setSelectedName("");
                      setNameSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            {showDropdown && filteredEmployees.length > 0 && (
              <ul className="absolute z-10 w-full max-h-60 overflow-auto border border-gray-300 rounded-md bg-white mt-1 shadow-md">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((name) => (
                    <li
                      key={name}
                      onClick={() => {
                        setSelectedName(name);
                        setNameSearch(name);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                    >
                      {name}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500">No matching employees</li>
                )}

                {filteredEmployees.length === 100 && (
                  <li className="px-3 py-2 text-xs text-gray-500 italic border-t">
                    Showing first 100 matches. Please refine your search.
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* View and date selectors */}
          <div className="flex flex-wrap gap-3 w-full lg:w-2/3">
            <div className="flex flex-col relative w-36" ref={viewDropdownRef}>
              <label className="block text-sm text-gray-600 mb-1">View</label>
              <button
                onClick={() => setIsViewOpen(!isViewOpen)}
                className={`border border-gray-300 px-3 py-2 bg-white flex justify-between items-center ${isViewOpen ? "rounded-t-md" : "rounded-md"
                  }`}
              >
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                <FiChevronDown className={`ml-2 transition-transform ${isViewOpen ? "rotate-180" : ""}`} />
              </button>

              {isViewOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 border-t-0 rounded-b-md shadow-md z-10">
                  {["day", "week", "month", "year"].map((view) => (
                    <div
                      key={view}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setCurrentView(view);
                        setIsViewOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date selectors */}
            {(currentView === "day" || currentView === "week") && (
              <div className="flex flex-col w-44">
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}

            {currentView === "month" && (
              <div className="flex gap-2">
                <div className="flex flex-col relative w-36">
                  <label className="block text-sm text-gray-600 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1} className="bg-white">
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col relative w-28">
                  <label className="block text-sm text-gray-600 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
                  >
                    {years.map((year) => (
                      <option key={year} value={year} className="bg-white">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div> 
            )} 


            {/* Filter dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <label className="block text-sm text-gray-600 mb-1">Bucket Filters</label>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center gap-2 w-36"
              >
                <FiFilter className="text-gray-600" />
                <span>
                  {selectedBuckets.length > 0
                    ? `${selectedBuckets.length} Selected`
                    : "All Buckets"}
                </span>
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-md z-10">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium">Bucket Types</h3>
                  </div>
                  <div className="p-3 max-h-60 overflow-y-auto">
                    {filterBuckets.length > 0 ? (
                      filterBuckets.map((bucket) => (
                        <div key={bucket} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`bucket-${bucket}`}
                            checked={selectedBuckets.includes(bucket)}
                            onChange={() => toggleBucketFilter(bucket)}
                            className="mr-2"
                          />
                          <label htmlFor={`bucket-${bucket}`}>{bucket}</label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No bucket types found</p>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={() => setSelectedBuckets([])}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary View */}
      {showSummaryView && (
        <div className="mb-6">
          {summaryViewContent}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 bg-white p-4 rounded-md shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#018ABE]">
              {selectedName ? `${selectedName}'s Timesheet` : "Timesheet"} - {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
            </h2>
            {currentView === "day" && (
              <p className="text-gray-600">
                {selectedDate ? formatDate(selectedDate) : "Select a date"}
              </p>
            )}
            {currentView === "week" && (
              <p className="text-gray-600">
                Week of {dateRange.firstDay ? formatDate(dateRange.firstDay) : "--"} to{" "}
                {dateRange.lastDay ? formatDate(dateRange.lastDay) : "--"}
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                &laquo;
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABE]"></div>
        </div>
      ) : (
        <>
          {/* Timesheet Tables */}
          {filteredTimesheetData.length > 0 ? (
            <>
              {filteredTimesheetData.map((dayData, dayIndex) => (
                <div key={dayData.date} className="mb-6 bg-white rounded-md shadow-sm overflow-hidden">
                  {/* Date heading and summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 p-4">
                    <h3 className="font-medium mb-2 sm:mb-0">
                      {formatDate(dayData.date)}
                    </h3>
                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-[#018ABE]">
                        Total: {calculateTotalDuration(dayData.entries)}
                      </span>
                    </div>
                  </div>

                  {/* Timesheet entries */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 w-24 sm:w-32 text-sm font-medium text-gray-700 border-b">
                            Bucket
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700 border-b">
                            Task
                          </th>
                          <th className="px-4 py-3 w-36 text-sm font-medium text-gray-700 border-b text-center">
                            Time
                          </th>
                          <th className="px-4 py-3 w-20 text-sm font-medium text-gray-700 border-b text-center">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.entries.map((entry, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                          >
                            <td className="px-4 py-3 align-middle text-center">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 inline-block">
                                {entry.bucket}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {entry.task}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              {entry.time}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {entry.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <div className="bg-[#018ABE] p-4 rounded-md shadow-sm text-white mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Grand Total</span>
                  <span className="font-bold text-lg">
                    {calculateGrandTotal()}
                  </span>
                </div>
              </div>

              {/* Pagination controls (bottom) */}
              {totalPages > 1 && (
                <div className="bg-white p-4 rounded-md shadow-sm flex justify-center mb-6">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      First
                    </button>

                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      &laquo;
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-8 h-8 rounded-md ${currentPage === pageNumber
                            ? 'bg-[#018ABE] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      &raquo;
                    </button>

                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiCalendar className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No timesheet data found for the selected {currentView}.
                    {selectedBuckets.length > 0 && ` Try removing some filters.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}