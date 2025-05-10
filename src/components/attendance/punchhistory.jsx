"use client";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import gsap from "gsap";

const punchData = [
  { date: "01/05/2025", InLocation: "Panvel", inTime: "09:36:15", OutLocation: "Panvel", outTime: "18:33:15", remark: "Present" },
  { date: "02/05/2025", InLocation: "Panvel", inTime: "10:50:33", OutLocation: "Panvel", outTime: "20:25:00", remark: "Late" },
  { date: "03/05/2025", InLocation: "Panvel", inTime: "08:44:30", OutLocation: "Panvel", outTime: "18:44:34", remark: "Present" },
  { date: "05/05/2025", InLocation: "Panvel", inTime: "10:40:48", OutLocation: "Panvel", outTime: "19:58:16", remark: "Late" },
  { date: "06/05/2025", InLocation: "Panvel", inTime: "-", OutLocation: "Panvel", outTime: "-", remark: "Absent" },
  { date: "07/05/2025", InLocation: "Panvel", inTime: "09:56:48", OutLocation: "Panvel", outTime: "20:12:10", remark: "Present" },
];

export default function PunchHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const underlineRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const filteredData = punchData.filter(item =>
    (selectedDate ? item.date === selectedDate : true) &&
    (remarkFilter ? item.remark === remarkFilter : true)
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [["Date", "In Location", "In Time", "Out Location", "Out Time", "Remark"]], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, worksheet, "PunchHistory");
    XLSX.writeFile(workbook, "punch_history.xlsx");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-center mb-8 relative text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
          ></span>
          Punch History
        </h1>
      </div>

      <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="date"
            value={selectedDate ? selectedDate.split("/").reverse().join("-") : ""}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              setSelectedDate(`${day}/${month}/${year}`);
            }}
            className="shadow-md p-2 rounded w-48"
          />

          <select
            value={remarkFilter}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setSelectedDate("");
                setRemarkFilter("");
              } else {
                setRemarkFilter(value);
              }
            }}
            className="shadow-md p-2 rounded w-48"
          >
            <option value="">Remark Type</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="all">Reset Filters</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow">
          <table className="min-w-full text-center">
            <thead className="bg-[#058CBF] text-white">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Date</th>
                <th className="px-4 py-2 border border-gray-300">In Location</th>
                <th className="px-4 py-2 border border-gray-300">In Time</th>
                <th className="px-4 py-2 border border-gray-300">Out Location</th>
                <th className="px-4 py-2 border border-gray-300">Out Time</th>
                <th className="px-4 py-2 border border-gray-300">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-2 border border-gray-300">{item.date}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.InLocation}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.inTime}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.OutLocation}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.outTime}</td>
                    <td
                      className={`px-4 py-2 font-semibold border border-gray-300 ${
                        item.remark === "Present"
                          ? "text-green-600"
                          : item.remark === "Late"
                          ? "text-orange-500"
                          : "text-red-600"
                      }`}
                    >
                      {item.remark}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 mr-10">
          <button
            onClick={exportToExcel}
            className="bg-[#058CBF] text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
