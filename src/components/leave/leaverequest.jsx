"use client";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LeaveRequest() {
  const handleApprove = () => toast.success("Leave Approved");
  const handleReject = () => toast.error("Leave Rejected");

  return (
    <div className="flex justify-center items-start mt-10">
      <div className="w-full max-w-3xl px-4">
        {/* Heading */}
        <h1 className="text-2xl font-bold mb-6 border-b-2 border-red-500 w-fit">
          Leave Request
        </h1>

        {/* White Box */}
        <div className="bg-white rounded-lg shadow p-8 border border-gray-300 w-full">
          <div className="space-y-7">
            {/* Submitted On */}
            <div>
              <p className="font-semibold text-lg">
                Submitted On
                <span className="font-normal ml-4 text-base">01/05/2025</span>
              </p>
            </div>

            {/* Employee Info */}
            <div>
              <p className="font-semibold text-lg">Emp Information :</p>
              <div className="ml-2 space-y-2 mt-4 text-sm sm:text-base">
                <p>
                  Emp Regn. No. <span className="ml-2">25306</span>
                  <span className="ml-12">DOJ : 01/01/2025</span>
                </p>
                <p>
                  Emp Name <span className="ml-6">Prashant P</span>
                  <span className="ml-12">Department : IT Service</span>
                </p>
                <p>
                  Designation <span className="ml-3">Graphic Designer</span>
                </p>
              </div>
            </div>

            {/* Leave Period Table */}
            <div>
              <h2 className="text-lg font-bold underline mb-2">Leave Period</h2>
              <div className="rounded-lg overflow-hidden">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-cyan-700 text-black">
                      <th className="py-2 px-4 border-r border-black">From</th>
                      <th className="py-2 px-4 border-r border-black">To</th>
                      <th className="py-2 px-4">Type of Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-100">
                      <td className="py-2 px-4 border-r border-black">
                        05/05/2025
                      </td>
                      <td className="py-2 px-4 border-r border-black">
                        08/05/2025
                      </td>
                      <td className="py-2 px-4">Sick Leave</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-6 mt-10">
              <button
                className="bg-green-600 text-white font-semibold py-2 px-6 rounded hover:bg-green-700"
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                className="bg-red-600 text-white font-semibold py-2 px-6 rounded hover:bg-red-700"
                onClick={handleReject}
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </div>
  );
}
