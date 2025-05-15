"use client";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LeaveRequest() {
  const handleApprove = () => toast.success("Leave Approved");
  const handleReject = () => toast.error("Leave Rejected");
  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);
  return (
    <div className="flex justify-center items-start mt-10">
      <div className="w-full max-w-3xl px-4">
        {/* Heading */}
        <h2 className="text-2xl font-bold mb-6 relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
          ></span>
          Leave Request
        </h2>

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

              <div className="ml-2 mt-4 text-sm sm:text-base space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                  <p className="font-medium">Emp Regn. No.</p>
                  <p>25306</p>
                  <p className="font-medium">DOJ</p>
                  <p>01/01/2025</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                  <p className="font-medium">Emp Name</p>
                  <p>Prashant P</p>
                  <p className="font-medium">Department</p>
                  <p>IT Service</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                  <p className="font-medium">Designation</p>
                  <p>Graphic Designer</p>
                </div>
              </div>
            </div>

            {/* Leave Period Table */}
            <div>
              <h2 className="text-lg font-bold  mb-2">Leave Period</h2>
              <div className="rounded-lg overflow-hidden">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#018ABE] text-white">
                      <th className="py-2 px-4 border-r border-gray-600">
                        FROM
                      </th>
                      <th className="py-2 px-4 border-r border-gray-600">TO</th>
                      <th className="py-2 px-4">REASON</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#ECF5F9]">
                      <td className="py-2 px-4 border-r border-gray-600">
                        05/05/2025
                      </td>
                      <td className="py-2 px-4 border-r border-gray-600">
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
