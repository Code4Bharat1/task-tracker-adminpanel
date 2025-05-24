"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function Performanceboard() {
  const underlineRef = useRef(null);
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [behaviorScores, setBehaviorScores] = useState({});
  const [remarks, setRemarks] = useState({});

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

  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();

  // Helper function to check if today is weekend (Saturday = 6, Sunday = 0)
  const isWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  // Helper function to get current week
  const getCurrentWeek = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Find which week of the month today falls into
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    let startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() + mondayOffset);

    let weekNumber = 1;
    while (startDate <= today) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday

      if (today >= startDate && today <= endDate) {
        return weekNumber;
      }

      startDate.setDate(startDate.getDate() + 7);
      weekNumber++;
    }

    return 1; // Default to week 1 if not found
  };

  // Helper function to check if a week is in the future
  const isWeekInFuture = (weekLabel, month, year) => {
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // If the selected month/year is in the future
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) {
      return true;
    }

    // If it's the current month and year
    if (year === today.getFullYear() && month === today.getMonth()) {
      const weekNumber = parseInt(weekLabel.replace('Week ', ''));
      const currentWeekNumber = getCurrentWeek();

      // If selecting a future week
      if (weekNumber > currentWeekNumber) {
        return true;
      }

      // If selecting current week, check if it's weekend
      if (weekNumber === currentWeekNumber && !isWeekend()) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a week is in the past
  const isWeekInPast = (weekLabel, month, year) => {
    const today = new Date();

    // If the selected month/year is in the past
    if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())) {
      return true;
    }

    // If it's the current month and year
    if (year === today.getFullYear() && month === today.getMonth()) {
      const weekNumber = parseInt(weekLabel.replace('Week ', ''));
      const currentWeekNumber = getCurrentWeek();

      // If selecting a past week
      if (weekNumber < currentWeekNumber) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a week is the current week
  const isCurrentWeek = (weekLabel, month, year) => {
    const today = new Date();

    // Must be current month and year
    if (year !== today.getFullYear() || month !== today.getMonth()) {
      return false;
    }

    const weekNumber = parseInt(weekLabel.replace('Week ', ''));
    const currentWeekNumber = getCurrentWeek();

    return weekNumber === currentWeekNumber;
  };

  // Function to get weeks in a month with date ranges
  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Find the first Monday of the month or the Monday of the week containing the first day
    let startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    let weekNumber = 1;
    while (startDate <= lastDay) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 5); // Saturday (6 days from Monday)

      // Format dates
      const startFormatted = `${startDate.getDate()}${getOrdinalSuffix(startDate.getDate())} ${months[startDate.getMonth()].substring(0, 3)}`;
      const endFormatted = `${endDate.getDate()}${getOrdinalSuffix(endDate.getDate())} ${months[endDate.getMonth()].substring(0, 3)}`;

      const weekLabel = `Week ${weekNumber}`;
      const isFuture = isWeekInFuture(weekLabel, month, year);

      weeks.push({
        label: weekLabel,
        display: `Week ${weekNumber} (${startFormatted}-${endFormatted})`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isFuture: isFuture
      });

      startDate.setDate(startDate.getDate() + 7);
      weekNumber++;
    }

    return weeks;
  };

  // Function to get ordinal suffix for dates
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const weeksInMonth = getWeeksInMonth(currentYear, currentMonth);

  // Get selected week's date range
  const getSelectedWeekRange = () => {
    const selectedWeekData = weeksInMonth.find(week => week.label === selectedWeek);
    if (selectedWeekData) {
      return {
        weekStart: selectedWeekData.startDate.toISOString(),
        weekEnd: selectedWeekData.endDate.toISOString()
      };
    }
    return null;
  };

  const fetchPerformanceData = async () => {
    // Check if selected week is in future before making API call
    const selectedWeekData = weeksInMonth.find(week => week.label === selectedWeek);
    if (selectedWeekData && selectedWeekData.isFuture) {
      const currentWeekNumber = getCurrentWeek();
      const selectedWeekNumber = parseInt(selectedWeek.replace('Week ', ''));

      if (selectedWeekNumber > currentWeekNumber) {
        setError(`Cannot generate performance data for future weeks. Please select Week ${currentWeekNumber} or earlier.`);
      } else if (selectedWeekNumber === currentWeekNumber && !isWeekend()) {
        setError("Performance data for the current week can only be generated on weekends (Saturday/Sunday).");
      }
      setPerformanceData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const weekRange = getSelectedWeekRange();
      const isPastWeek = isWeekInPast(selectedWeek, currentMonth, currentYear);
      const isCurrent = isCurrentWeek(selectedWeek, currentMonth, currentYear);

      let url;

      if (isPastWeek) {
        // For past weeks, only fetch existing data without generating
        url = "http://localhost:4110/api/performance/getWeeklyPerformance";
        if (weekRange) {
          url += `?weekStart=${weekRange.weekStart}`;
        }
      } else if (isCurrent) {
        // For current week, use the generate endpoint (only on weekends)
        url = "http://localhost:4110/api/performance/generateWeeklyPerformance";
        if (weekRange) {
          url += `?weekStart=${weekRange.weekStart}`;
        }
      } else {
        // This shouldn't happen, but handle it gracefully
        url = "http://localhost:4110/api/performance/getWeeklyPerformance";
        if (weekRange) {
          url += `?weekStart=${weekRange.weekStart}`;
        }
      }

      const response = await axios.get(url, {
        withCredentials: true
      });

      if (response.data && response.data.length > 0) {
        setPerformanceData(response.data);
      } else {
        setPerformanceData([]);
        if (isPastWeek) {
          setError(`No performance score exists for this week (${selectedWeek})`);
        } else {
          setError(`No performance data found for the selected week (${selectedWeek})`);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      const isPastWeek = isWeekInPast(selectedWeek, currentMonth, currentYear);

      if (err.response?.status === 404 || err.response?.data?.message?.includes("No performance scores found")) {
        if (isPastWeek) {
          setError(`No performance score exists for this week (${selectedWeek})`);
        } else {
          setError(`No performance data available for the selected week (${selectedWeek})`);
        }
      } else {
        setError(err.response?.data?.message || err.message || "Failed to fetch performance data");
      }
      setPerformanceData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedWeek, selectedMonth]); // Re-fetch when week or month changes

  const handlePrevYear = () => {
    setSelectedMonth(new Date(currentYear - 1, currentMonth, 1));
  };

  const handleNextYear = () => {
    setSelectedMonth(new Date(currentYear + 1, currentMonth, 1));
  };

  const handleSelectMonth = (monthIndex) => {
    setSelectedMonth(new Date(currentYear, monthIndex, 1));
    setIsOpen(false);
    // Reset to Week 1 when month changes
    setSelectedWeek("Week 1");
  };

  const handleWeekChange = (weekLabel) => {
    const selectedWeekData = weeksInMonth.find(week => week.label === weekLabel);

    if (selectedWeekData && selectedWeekData.isFuture) {
      const currentWeekNumber = getCurrentWeek();
      const selectedWeekNumber = parseInt(weekLabel.replace('Week ', ''));

      if (selectedWeekNumber > currentWeekNumber) {
        toast.error(`Cannot select future weeks. Current week is Week ${currentWeekNumber}.`, {
          duration: 3000
        });
        return;
      } else if (selectedWeekNumber === currentWeekNumber && !isWeekend()) {
        toast.error("Performance data for the current week can only be accessed on weekends.", {
          duration: 3000
        });
        return;
      }
    }

    setSelectedWeek(weekLabel);
  };

  const formatDate = () => {
    return `${months[currentMonth].substring(0, 3)} ${currentYear}`;
  };

  const handleBehaviorScoreChange = (id, value) => {
    const score = parseFloat(value);

    if (value === "") {
      setBehaviorScores(prev => ({ ...prev, [id]: value }));
      return;
    }

    if (isNaN(score) || score < 0 || score > 3) {
      toast.error("Please enter a number between 0 and 3", {
        duration: 2000
      });
      return;
    }

    setBehaviorScores(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmitScore = async (employeeData) => {
    try {
      const score = behaviorScores[employeeData._id];
      const remark = remarks[employeeData._id];

      if (score === undefined || score === "" || !remark || remark.trim() === "") {
        toast.error("Both behavior score and remark are required", {
          duration: 2000
        });
        return;
      }

      await axios.put(
        `http://localhost:4110/api/performance/updateBehaviourScore/${employeeData._id}`,
        {
          behaviourScore: parseFloat(score),
          remark: remark.trim(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Score and remark updated successfully", {
        duration: 2000
      });

      await fetchPerformanceData();

      setBehaviorScores(prev => {
        const newScores = { ...prev };
        delete newScores[employeeData._id];
        return newScores;
      });

      setRemarks(prev => {
        const newRemarks = { ...prev };
        delete newRemarks[employeeData._id];
        return newRemarks;
      });

      setError(null);
    } catch (err) {
      console.error("Error updating behavior score:", err);
      setError(err.response?.data?.message || "Failed to update behavior score");
      toast.error(err.response?.data?.message || "Failed to update behavior score", {
        duration: 2000
      });
    }
  };

  useEffect(() => {
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Title */}
      <div className="relative ml-4 mt-4 mb-4 w-max">
        <h2 className="text-2xl font-bold text-black">Performance Board</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
        ></span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-6 justify-between items-center px-4 mb-6">
        {/* Week Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="timeRange" className="text-black font-medium text-lg">
            Week :
          </label>
          <select
            id="timeRange"
            value={selectedWeek}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray] min-w-[200px]"
          >
            {weeksInMonth.map((week) => (
              <option
                key={week.label}
                value={week.label}
                disabled={week.isFuture}
                className={week.isFuture ? 'text-gray-400 bg-gray-100' : ''}
              >
                {week.display} {week.isFuture ? '(Future)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Month Picker */}
        <div className="flex items-center gap-2">
          <label className="text-black font-medium text-lg">Month:</label>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between border border-[#018ABE] rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-[1px_1px_5px_lightgray] w-[110px] cursor-pointer"
            >
              <span>{formatDate()}</span>
              <Calendar size={14} className="ml-1 text-[#018ABE]" />
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-[#018ABE] rounded-lg shadow-md p-1.5 w-40 left-1/2 -translate-x-1/2">
                <div className="flex justify-between items-center mb-1 border-b border-gray-100 pb-1">
                  <button
                    onClick={handlePrevYear}
                    className="p-0.5 hover:bg-blue-50 rounded-full text-[#018ABE]"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="font-semibold text-gray-800 text-xs">
                    {currentYear}
                  </div>
                  <button
                    onClick={handleNextYear}
                    className="p-1 hover:bg-blue-50 rounded-full text-[#018ABE]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-0.5">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleSelectMonth(index)}
                      className={`p-1 text-xs rounded transition-colors ${index === currentMonth
                        ? "bg-[#018ABE] text-white font-medium"
                        : "hover:bg-blue-50 text-gray-700"
                        }`}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekend Restriction Info */}
      {!isWeekend() && isCurrentWeek(selectedWeek, currentMonth, currentYear) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <strong>Note:</strong> Performance data for the current week can only be generated on weekends (Saturday/Sunday).
        </div>
      )}

      {/* No Data Message */}
      {!loading && performanceData.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No performance data available for the selected week.
        </div>
      )}

      {/* Table */}
      {performanceData.length > 0 && (
        <div className="overflow-x-auto rounded-2xl shadow-lg -ml-1 mr-auto">
          <table className="min-w-full border-collapse table-auto text-sm">
            <thead>
              <tr className="bg-[#018ABE] text-white">
                <th className="px-4 py-2 border border-gray-100 w-[5%] text-center">ID</th>
                <th className="px-4 py-2 border border-gray-100 w-[12%] text-center">Name</th>
                <th className="px-4 py-2 border border-gray-100 w-[8%] text-center">Timesheet</th>
                <th className="px-4 py-2 border border-gray-100 w-[8%] text-center">Attendance</th>
                <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Behavior</th>
                <th className="px-4 py-2 border border-gray-100 w-[20%] text-center">Remark</th>
                <th className="px-4 py-2 border border-gray-100 w-[8%] text-center">Total</th>
                <th className="px-4 py-2 border border-gray-100 w-[8%] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {performanceData.map((entry, index) => {
                const isScoreSet = entry.behaviourScore !== undefined && entry.behaviourScore !== 0;
                const canEdit = !isScoreSet;
                const hasExistingRemark = entry.remark && entry.remark.trim() !== "";

                return (
                  <tr key={entry._id || index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2 border text-center font-medium">{index + 1}</td>
                    <td className="px-4 py-2 border text-center font-medium">{entry.name}</td>
                    <td className="px-4 py-2 border text-center font-medium">{entry.timesheetScore ?? "N/A"}</td>
                    <td className="px-4 py-2 border text-center font-medium">{entry.attendanceScore ?? "N/A"}</td>
                    <td className="px-4 py-2 border text-center font-medium">
                      <input
                        type="number"
                        min="0"
                        max="3"
                        step="1"
                        placeholder={isScoreSet ? entry.behaviourScore.toString() : "Enter"}
                        value={canEdit ? (behaviorScores[entry._id] || "") : entry.behaviourScore}
                        onChange={(e) => canEdit && handleBehaviorScoreChange(entry._id, e.target.value)}
                        disabled={!canEdit}
                        className={`w-24 px-2 py-1 border rounded text-center ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        title="Enter score between 0 to 3"
                      />
                    </td>
                    <td className="px-4 py-2 border text-center font-medium">
                      <input
                        type="text"
                        placeholder={hasExistingRemark ? "" : "Enter remark"}
                        value={canEdit ? (remarks[entry._id] || "") : (entry.remark || "")}
                        onChange={(e) => canEdit && handleRemarkChange(entry._id, e.target.value)}
                        disabled={!canEdit}
                        className={`w-full px-2 py-1 border rounded text-center ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        title={hasExistingRemark ? entry.remark : "Enter remark"}
                      />
                    </td>
                    <td className={`px-4 py-2 border text-center font-bold ${entry.totalScore >= 8 ? "text-green-600" : "text-red-500"}`}>
                      {entry.totalScore}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleSubmitScore(entry)}
                        disabled={!canEdit || !behaviorScores[entry._id] || behaviorScores[entry._id] === "" || !remarks[entry._id] || remarks[entry._id].trim() === ""}
                        className={`px-3 py-1 rounded text-sm transition-colors ${canEdit && behaviorScores[entry._id] && behaviorScores[entry._id] !== "" && remarks[entry._id] && remarks[entry._id].trim() !== ""
                          ? "bg-[#018ABE] text-white hover:bg-[#0178a1]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Submit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}