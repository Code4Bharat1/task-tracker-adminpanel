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

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4110/api/performance/generateWeeklyPerformance",
        {
          withCredentials: true
        }
      );
      setPerformanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handlePrevYear = () => {
    setSelectedMonth(new Date(currentYear - 1, currentMonth, 1));
  };

  const handleNextYear = () => {
    setSelectedMonth(new Date(currentYear + 1, currentMonth, 1));
  };

  const handleSelectMonth = (monthIndex) => {
    setSelectedMonth(new Date(currentYear, monthIndex, 1));
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

    if (isNaN(score) || score < 0 || score > 3) {
      toast.error("Please enter a number between 0 and 3", {
        duration:2000
      });
      return;
    }

    setBehaviorScores(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmitScore = async (employeeData) => {
    try {
      const score = behaviorScores[employeeData._id];
      console.log(employeeData._id)
      console.log(score)
      if (score === undefined || score === "") return;

      await axios.put(
        `http://localhost:4110/api/performance/updateBehaviourScore/${employeeData._id}`,
        {
          behaviourScore: parseFloat(score),
        },
        {
          withCredentials: true,
        }
      );



      await fetchPerformanceData();

      setBehaviorScores(prev => {
        const newScores = { ...prev };
        delete newScores[employeeData._id];
        return newScores;
      });

      setError(null);
    } catch (err) {
      console.error("Error updating behavior score:", err);
      setError(err.response?.data?.message || "Failed to update behavior score");
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
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray]"
          >
            <option>Week 1</option>
            <option>Week 2</option>
            <option>Week 3</option>
            <option>Week 4</option>
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

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg -ml-1 mr-auto">
        <table className="min-w-full border-collapse table-auto text-sm">
          <thead>
            <tr className="bg-[#018ABE] text-white">
              <th className="px-4 py-2 border border-gray-100 w-[5%] text-center">ID</th>
              <th className="px-4 py-2 border border-gray-100 w-[15%] text-center">Name</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Timesheet</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Attendance</th>
              <th className="px-4 py-2 border border-gray-100 w-[15%] text-center">Behavior</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Total</th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {performanceData.map((entry, index) => (
              <tr key={entry._id || index} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2 border text-center font-medium">{index + 1}</td>
                <td className="px-4 py-2 border text-center font-medium">{entry.name}</td>
                <td className="px-4 py-2 border text-center font-medium">{entry.timesheetScore ?? "N/A"}</td>
                <td className="px-4 py-2 border text-center font-medium">{entry.attendanceScore ?? "N/A"}</td>
                <td className="px-4 py-2 border text-center font-medium">
                  <input
                    type="number"
                    min="-3"
                    max="3"
                    step="1"
                    placeholder={entry.behaviourScore ?? "Enter"}
                    value={behaviorScores[entry._id] || ""}
                    onChange={(e) => handleBehaviorScoreChange(entry._id, e.target.value)}
                    className="w-24 px-2 py-1 border rounded text-center"
                    title="Enter score between 1 to 3"
                  />
                </td>
                <td className={`px-4 py-2 border text-center font-bold ${entry.totalScore >= 8 ? "text-green-600" :"text-red-500"}`}>
                  {entry.totalScore}
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
    </div>
  );
}