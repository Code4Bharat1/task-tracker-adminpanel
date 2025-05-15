"use client";
import { useState, useEffect } from "react";

export default function AttendanceTable({ selectedDate, selectedRemark }) {
  const allData = [
    {
      id: 1,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-05",
    },
    {
      id: 2,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-05",
    },
    {
      id: 3,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-05",
    },
    {
      id: 4,
      name: "Anjali D",
      inTime: "10:40:48",
      outTime: "19:58:16",
      remark: "Late",
      date: "2025-05-01",
    },
    {
      id: 5,
      name: "Prashant P",
      inTime: "-",
      outTime: "-",
      remark: "Absent",
      date: "2025-05-01",
    },
    {
      id: 6,
      name: "Anjali D",
      inTime: "09:56:48",
      outTime: "20:12:10",
      remark: "Present",
      date: "2025-05-05",
    },
    {
      id: 7,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 8,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-04",
    },
    {
      id: 9,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 10,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-02",
    },
    {
      id: 11,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-02",
    },
    {
      id: 12,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-05",
    },
    {
      id: 13,
      name: "Anjali D",
      inTime: "10:40:48",
      outTime: "19:58:16",
      remark: "Late",
      date: "2025-05-08",
    },
    {
      id: 14,
      name: "Prashant P",
      inTime: "-",
      outTime: "-",
      remark: "Absent",
      date: "2025-05-07",
    },
    {
      id: 15,
      name: "Anjali D",
      inTime: "09:56:48",
      outTime: "20:12:10",
      remark: "Present",
      date: "2025-05-05",
    },
    {
      id: 16,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 17,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-04",
    },
    {
      id: 18,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 19,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-08",
    },
    {
      id: 20,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-08",
    },
    {
      id: 21,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-08",
    },
    {
      id: 22,
      name: "Anjali D",
      inTime: "10:40:48",
      outTime: "19:58:16",
      remark: "Late",
      date: "2025-05-07",
    },
    {
      id: 23,
      name: "Prashant P",
      inTime: "-",
      outTime: "-",
      remark: "Absent",
      date: "2025-05-05",
    },
    {
      id: 24,
      name: "Anjali D",
      inTime: "09:56:48",
      outTime: "20:12:10",
      remark: "Present",
      date: "2025-05-06",
    },
    {
      id: 25,
      name: "Prashant P",
      inTime: "09:36:15",
      outTime: "19:31:15",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 26,
      name: "Anjali D",
      inTime: "10:50:33",
      outTime: "20:25:00",
      remark: "Late",
      date: "2025-05-04",
    },
    {
      id: 27,
      name: "Prashant P",
      inTime: "09:44:30",
      outTime: "19:44:34",
      remark: "Present",
      date: "2025-05-04",
    },
    {
      id: 28,
      name: "Prashant P",
      inTime: "09:30:00",
      outTime: "19:30:00",
      remark: "Present",
      date: "2025-04-13",
    },
    {
      id: 29,
      name: "Anjali D",
      inTime: "10:15:00",
      outTime: "20:00:00",
      remark: "Late",
      date: "2025-04-15",
    },
  ];

  const [sortedGroupedData, setSortedGroupedData] = useState([]);

  useEffect(() => {
    let result = [...allData];

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
    <div className="space-y-8">
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
