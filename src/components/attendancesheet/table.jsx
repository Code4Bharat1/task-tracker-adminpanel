"use client";
import { useState, useEffect } from "react";

export default function AttendanceTable({ selectedDate, selectedRemark }) {
  const [sortedGroupedData, setSortedGroupedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4110/api/attendance/allAttendance", {
          method: "GET",
          credentials: "include", // 🔑 this allows cookies to be sent
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        // Format and map the backend data to match the expected structure
        let result = data.map((item) => ({
          id: item._id,
          name: `${item.firstName} ${item.lastName}`,
          inTime: item.punchIn ? new Date(item.punchIn).toLocaleTimeString() : "-",
          outTime: item.punchOut ? new Date(item.punchOut).toLocaleTimeString() : "-",
          remark: item.remark,
          date: new Date(item.date).toISOString().split("T")[0], // YYYY-MM-DD format
        }));

        if (selectedDate) {
          result = result.filter((item) => item.date === selectedDate);
        } else {
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();
          result = result.filter((item) => {
            const itemDate = new Date(item.date);
            return (
              itemDate.getFullYear() === currentYear &&
              itemDate.getMonth() + 1 === currentMonth
            );
          });
        }

        if (selectedRemark) {
          result = result.filter((item) => item.remark === selectedRemark);
        }

        const grouped = result.reduce((acc, item) => {
          const date = item.date;
          if (!acc[date]) acc[date] = [];
          acc[date].push(item);
          return acc;
        }, {});

        const sorted = Object.entries(grouped)
          .map(([date, records]) => ({ date, records }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setSortedGroupedData(sorted);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    fetchData();
  }, [selectedDate, selectedRemark]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getColor = (remark) => {
    if (remark === "Present") return "text-green-500 font-bold";
    if (remark === "Late") return "text-orange-500 font-bold";
    if (remark === "Absent") return "text-red-500 font-bold";
    return "";
  };

  return (
    <div className="mx-auto max-w-5xl mt-8 space-y-8">
      {sortedGroupedData.length > 0 ? (
        sortedGroupedData.map(({ date, records }) => (
          <div key={date} className="mb-8">
            <div className="text-xl font-bold mb-3">{formatDate(date)}</div>
            <div className="overflow-hidden rounded-lg shadow-md">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="px-4 py-2 border-b border-r border-gray-300 first:border-l">
                      Sr. No
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-300">
                      Name
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-300">
                      In Time
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-300">
                      Out Time
                    </th>
                    <th className="px-4 py-2 border-b border-gray-300">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, index) => (
                    <tr key={row.id} className="bg-white even:bg-gray-50">
                      <td className="px-4 py-2 border-b border-r border-gray-300 first:border-l">
                        {index + 1}.
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-300 font-semibold">
                        {row.name}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-300">
                        {row.inTime}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-300">
                        {row.outTime}
                      </td>
                      <td
                        className={`px-4 py-2 border-b border-gray-300 ${getColor(
                          row.remark
                        )}`}
                      >
                        {row.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="border px-4 py-6 text-center text-gray-500 rounded-md">
          No records found for the selected criteria
        </div>
      )}
    </div>
  );
}
