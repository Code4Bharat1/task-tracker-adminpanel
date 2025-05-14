"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function Performanceboard() {
  const underlineRef = useRef(null);

  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  // Initialize selectedMonth with current date
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  // State to control the dropdown visibility
  const [isOpen, setIsOpen] = useState(false);

  // Months array for selection
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

  // Navigation handlers
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

  // Format date for display
  const formatDate = () => {
    return `${months[currentMonth].substring(0, 3)} ${currentYear}`;
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

  const allPerformanceData = {
    "Week 1": [
      { rank: 1, name: "Chinmay Gawade", points: "9.5" },
      { rank: 2, name: "Harsh Singh", points: "8.8" },
      { rank: 3, name: "Tamim Tolkar", points: "8.3" },
    ],
    "Week 2": [
      { rank: 1, name: "Harsh Singh", points: "9.3" },
      { rank: 2, name: "Tamim Tolkar", points: "9.1" },
      { rank: 3, name: "Chinmay Gawade", points: "8.9" },
    ],
    "Week 3": [
      { rank: 1, name: "Tamim Tolkar", points: "9.7" },
      { rank: 2, name: "Chinmay Gawade", points: "9.0" },
      { rank: 3, name: "Harsh Singh", points: "8.5" },
    ],
    "Week 4": [
      { rank: 1, name: "Chinmay Gawade", points: "9.8" },
      { rank: 2, name: "Tamim Tolkar", points: "9.6" },
      { rank: 3, name: "Harsh Singh", points: "9.0" },
    ],
  };

  const performanceData = allPerformanceData[selectedWeek];

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
                      className={`p-1 text-xs rounded transition-colors ${
                        index === currentMonth
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
              <th className="px-4 py-2 border border-gray-100 w-[5%] text-center">
                Rank
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                Name
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                Points (out of 10)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {performanceData.map((entry) => (
              <tr key={entry.rank}>
                <td className="px-4 py-2 custom-border font-medium relative text-center">
                  {entry.rank}.
                </td>
                <td className="px-4 py-2 custom-border font-medium relative text-center">
                  <span className="custom-border-left"></span>
                  {entry.name}
                </td>
                <td className="px-4 py-2 custom-border relative font-medium text-center">
                  <span className="custom-border-left"></span>
                  {entry.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
