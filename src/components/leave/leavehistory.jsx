"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";

export default function LeaveTable() {
  const underlineRef = useRef(null);
  const router = useRouter();

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="max-w-6xl mt-10 px-4 mx-auto">
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-1 relative inline-block text-gray-800">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        Leave History
      </h2>

      <div className="flex justify-end -mt-5 gap-2 mb-10">
        <label
          htmlFor="status"
          className="mr-3 text-black font-medium font-poppins text-lg"
        >
          Status:
        </label>

        <select
          id="status"
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-[1px_1px_10px_lightgray] font-poppins"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mt-4 rounded-2xl shadow-lg mx-auto">
        <table className="min-w-full border-collapse table-auto text-sm">
          <thead>
            <tr className="bg-[#018ABE] text-white">
              <th className="px-4 py-2 whitespace-nowrap border border-gray-100 w-[5%] text-center">
                SR NO
              </th>
              <th className="px-4  font-normal py-2 border border-gray-100 w-[10%] text-center">
                NAME
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[20%] text-center">
                LEAVE TYPE
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                APPLY DATE
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                FROM DATE
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                TO DATE
              </th>
              <th className="px-4 py-2 border border-gray-100 w-[10%] text-center">
                TOTAL DAYS
              </th>
              <th className="px-4 py-2 border whitespace-nowrap border-gray-100 w-[10%] text-center">
                VIEW REQUEST
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {[
              {
                sr: 1,
                name: "Chinmay Gawade",
                type: "Casual Leave",
                apply: "30-04-2025",
                from: "10-05-2025",
                to: "01-04-2025",
                days: "05",
              },
              {
                sr: 2,
                name: "Harsh Singh",
                type: "Sick Leave",
                apply: "28-03-2025",
                from: "28-03-2025",
                to: "01-04-2025",
                days: "03",
              },
              {
                sr: 3,
                name: "Tamim Tolkar",
                type: "Study Leave",
                apply: "10-05-2025",
                from: "11-05-2025",
                to: "23-03-2025",
                days: "13",
              },
            ].map((entry) => (
              <tr key={entry.sr}>
                <td className="px-4 py-2 font-medium text-center relative">
                  {entry.sr}.
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.name}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.type}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.apply}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.from}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.to}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  {entry.days}
                </td>
                <td className="px-4 py-2 font-medium text-center relative">
                  <div className="custom-border-left"></div>
                  <button
                    onClick={() => router.push("/leavetable/leave-approvals")}
                    className="text-[#018ABE] underline hover:text-blue-800 transition"
                  >
                    View
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
