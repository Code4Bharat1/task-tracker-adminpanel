'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Expense = () => {
  const underlineRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto text-[15px] text-gray-900">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <h2 className="text-2xl font-bold">Expenses Request</h2>
          <div
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] w-full bg-[#FA4A4A] scale-x-0"
          ></div>
        </div>
        <div className="text-sm font-medium">
          <span className="text-gray-600">Submitted On</span> :{' '}
          <span className="font-semibold">10/05/2025</span>
        </div>
      </div>

      {/* Details Box */}
      <div className="border-2 border-blue-500 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex flex-col gap-5">
          <InfoRow label="Employee ID & Name" value="NXC101 / Shubham Prajapati" />
          <InfoRow label="Expense Title" value="Cab to client Site" />
          <InfoRow label="Category" value="Travel" />
          <InfoRow label="Date & Time of Expense" value="8/05/2025" />
          <InfoRow label="Amount (₹)" value="₹1,200" />
          <InfoRow label="Payment Method" value="Cash, UPI, Credit Card, etc." />
          <InfoRow
            label="Uploaded Receipt"
            value={
              <button className="bg-[#1A98D7] hover:bg-[#147FB3] text-white px-5 py-2 rounded-md text-sm font-bold shadow-xl">
                View Doc
              </button>
            }
          />
          <InfoRow
            label="Employee Notes / Description"
            value={
              <p className="text-gray-800">
                E.g., <strong>"Took Uber from office to client."</strong>
              </p>
            }
          />
          <InfoRow
            label="Admin Notes"
            value={
              <p className="text-gray-500">
                Field where admin can add remarks while approving/rejecting,&nbsp;
                Reasons for Rejecting application
              </p>
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8 pt-8">
          <button className="bg-[#0F9D58] hover:bg-green-700 text-black font-semibold px-8 py-2 rounded-md text-[15px]">
            Approve
          </button>
          <button className="bg-[#EA4335] hover:bg-red-700 text-black font-semibold px-8 py-2 rounded-md text-[15px]">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
    <div className="text-md w-64 font-bold">
      {label} <span className="font-bold">:</span>
    </div>
    <div>{value}</div>
  </div>
);

export default Expense;
