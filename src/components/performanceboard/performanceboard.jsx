"use client"
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Settings, X } from "lucide-react";

export default function Performanceboard() {
  const underlineRef = useRef(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [behaviorScores, setBehaviorScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [weights, setWeights] = useState({
    attendanceWeight: 4,
    timesheetWeight: 4,
    behaviourWeight: 2
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();

  // Get weeks for the selected month
  const getWeeksInMonth = (month, year) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let currentWeekStart = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentWeekStart.setDate(firstDay.getDate() + mondayOffset);

    let weekNumber = 1;
    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

      // Only include weeks that have days in the current month
      if (currentWeekStart.getMonth() === month || weekEnd.getMonth() === month) {
        const weekStartInMonth = new Date(Math.max(currentWeekStart, firstDay));
        const weekEndInMonth = new Date(Math.min(weekEnd, lastDay));

        weeks.push({
          number: weekNumber,
          start: new Date(currentWeekStart),
          end: new Date(currentWeekStart.getTime() + 5 * 24 * 60 * 60 * 1000), // Only workdays
          label: `Week ${weekNumber} (${weekStartInMonth.getDate()} ${months[weekStartInMonth.getMonth()].substring(0, 3)} to ${weekEndInMonth.getDate()} ${months[weekEndInMonth.getMonth()].substring(0, 3)} ${year})`
        });
        weekNumber++;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  };

  const weeksInMonth = getWeeksInMonth(currentMonth, currentYear);
  const currentWeek = weeksInMonth.find(w => w.number === selectedWeek) || weeksInMonth[0];

  const fetchPerformanceWeights = async () => {
    try {
      const response = await fetch(
        "http://localhost:4110/api/performance/weights",
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setWeights(data);
      }
    } catch (err) {
      console.error("Error fetching weights:", err);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentWeek) {
        setPerformanceData([]);
        setLoading(false);
        return;
      }

      const weekStartStr = currentWeek.start.toISOString().split('T')[0];

      // First try to get existing data
      const getResponse = await fetch(
        `http://localhost:4110/api/performance/getWeeklyScore?weekStart=${weekStartStr}`,
        { credentials: "include" }
      );

      if (getResponse.ok) {
        const getData = await getResponse.json();
        if (getData.count > 0) {
          setPerformanceData(getData.data);
          setLoading(false);
          return;
        }
      }

      // If no data exists, generate it
      const generateResponse = await fetch(
        `http://localhost:4110/api/performance/generateWeeklyPerformance?weekStart=${weekStartStr}`,
        { credentials: "include" }
      );

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        setPerformanceData(generateData);
      } else {
        throw new Error("Failed to generate performance data");
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceWeights();
  }, []);

  useEffect(() => {
    if (currentWeek) {
      fetchPerformanceData();
    }
  }, [selectedWeek, selectedMonth]);

  const handlePrevYear = () => {
    setSelectedMonth(new Date(currentYear - 1, currentMonth, 1));
    setSelectedWeek(1);
  };

  const handleNextYear = () => {
    setSelectedMonth(new Date(currentYear + 1, currentMonth, 1));
    setSelectedWeek(1);
  };

  const handleSelectMonth = (monthIndex) => {
    setSelectedMonth(new Date(currentYear, monthIndex, 1));
    setSelectedWeek(1);
    setIsOpen(false);
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

    if (isNaN(score) || score < -3 || score > 3) {
      setError("Please enter a number between -3 and 3");
      return;
    }

    setBehaviorScores(prev => ({
      ...prev,
      [id]: value,
    }));
    setError(null);
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

      if (score === undefined || score === "") return;

      const response = await fetch(
        `http://localhost:4110/api/performance/updateBehaviourScore/${employeeData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            behaviourScore: parseFloat(score),
            remark: remark || ""
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update behavior score");
      }

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
      setError("Failed to update behavior score");
    }
  };

  const handleUpdateWeights = async () => {
    try {
      const total = weights.attendanceWeight + weights.timesheetWeight + weights.behaviourWeight;
      if (total !== 10) {
        setError(`The sum of all weights must be 10. Currently: ${total}`);
        return;
      }

      const response = await fetch(
        "http://localhost:4110/api/performance/weights",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(weights),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update weights");
      }

      setShowWeightsModal(false);
      setError(null);

      // Refresh data to reflect new weights
      await fetchPerformanceData();
    } catch (err) {
      console.error("Error updating weights:", err);
      setError("Failed to update performance weights");
    }
  };

  useEffect(() => {
    if (underlineRef.current) {
      const tl = {
        fromTo: (ref, from, to) => {
          if (ref) {
            Object.assign(ref.style, from);
            setTimeout(() => Object.assign(ref.style, to), 50);
          }
        }
      };
      tl.fromTo(
        underlineRef.current,
        { transform: "scaleX(0)", transformOrigin: "left" },
        { transform: "scaleX(1)", transition: "transform 1s ease-out" }
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
            Week:
          </label>
          <select
            id="timeRange"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray]"
          >
            {weeksInMonth.map(week => (
              <option key={week.number} value={week.number}>
                {week.label}
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

        {/* Settings Button */}
        <button
          onClick={() => setShowWeightsModal(true)}
          className="flex items-center gap-2 bg-[#018ABE] text-white px-4 py-2 rounded-md hover:bg-[#0178a1] transition-colors"
        >
          <Settings size={16} />
          Scoring Weights
        </button>
      </div>

      {/* Performance Weights Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Performance Scoring Weights</h3>
              <button
                onClick={() => setShowWeightsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Attendance Weight (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={weights.attendanceWeight}
                  onChange={(e) => setWeights(prev => ({
                    ...prev,
                    attendanceWeight: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Timesheet Weight (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={weights.timesheetWeight}
                  onChange={(e) => setWeights(prev => ({
                    ...prev,
                    timesheetWeight: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Behaviour Weight (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={weights.behaviourWeight}
                  onChange={(e) => setWeights(prev => ({
                    ...prev,
                    behaviourWeight: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="text-sm text-gray-600">
                Total: {(weights.attendanceWeight + weights.timesheetWeight + weights.behaviourWeight).toFixed(1)} / 10
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowWeightsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWeights}
                className="px-4 py-2 bg-[#018ABE] text-white rounded hover:bg-[#0178a1]"
              >
                Update Weights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg -ml-1 mr-auto">
        <table className="min-w-full border-collapse table-auto text-sm">
          <thead>
            <tr className="bg-[#018ABE] text-white">
              <th className="px-4 py-2 border border-gray-100 w-[5%] text-center">ID</th>
              <th className="px-4 py-2 border border-gray-100 w-[15%] text-center">Name</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                Timesheet ({weights.timesheetWeight})
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                Attendance ({weights.attendanceWeight})
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[15%] text-center">
                Behavior ({weights.behaviourWeight})
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Total</th>
              <th className="px-4 py-2 border border-gray-100 w-[15%] text-center">Remark</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {performanceData.map((entry, index) => (
              <tr key={entry._id || index} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2 border text-center font-medium">{index + 1}</td>
                <td className="px-4 py-2 border text-center font-medium">{entry.name}</td>
                <td className="px-4 py-2 border text-center font-medium">
                  {entry.timesheetScore?.toFixed(2) ?? "N/A"}
                </td>
                <td className="px-4 py-2 border text-center font-medium">
                  {entry.attendanceScore?.toFixed(2) ?? "N/A"}
                </td>
                <td className="px-4 py-2 border text-center font-medium">
                  <input
                    type="number"
                    min="-3"
                    max="3"
                    step="0.1"
                    placeholder={entry.behaviourScore?.toString() || "Enter"}
                    value={behaviorScores[entry._id] || ""}
                    onChange={(e) => handleBehaviorScoreChange(entry._id, e.target.value)}
                    className="w-24 px-2 py-1 border rounded text-center"
                    title="Enter score between -3 to 3"
                  />
                </td>
                <td className={`px-4 py-2 border text-center font-bold ${entry.totalScore >= 8 ? "text-green-600" : "text-red-500"
                  }`}>
                  {entry.totalScore?.toFixed(2)}
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="text"
                    placeholder={entry.remark || "Add remark"}
                    value={remarks[entry._id] || ""}
                    onChange={(e) => handleRemarkChange(entry._id, e.target.value)}
                    className="w-32 px-2 py-1 border rounded text-center text-xs"
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => handleSubmitScore(entry)}
                    disabled={!behaviorScores[entry._id] || behaviorScores[entry._id] === ""}
                    className={`px-3 py-1 rounded text-sm transition-colors ${behaviorScores[entry._id] && behaviorScores[entry._id] !== ""
                        ? "bg-[#018ABE] text-white hover:bg-[#0178a1]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {performanceData.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No performance data found for the selected week.
        </div>
      )}
    </div>
  );
}