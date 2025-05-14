'use client';

import React, { useState } from 'react';
import { FaSort, FaCheckSquare, FaTimesCircle } from 'react-icons/fa';

const expenses = [
  {
    id: 'NXC101',
    name: 'Shubham Prajapati',
    category: 'Travel',
    amount: '₹1,200',
    date: '10-05-2025',
    status: 'Approved',
  },
  {
    id: 'NXC102',
    name: 'Rohan Pawar',
    category: 'Hotel Stay',
    amount: '₹3,000',
    date: '15-03-2025',
    status: 'Pending',
  },
  {
    id: 'NXC103',
    name: 'Harsh Singh',
    category: 'Food',
    amount: '₹1,500',
    date: '18-05-2025',
    status: 'Approved',
  },
  {
    id: 'NXC104',
    name: 'Henna',
    category: 'Office Supplies',
    amount: '₹5,200',
    date: '23-05-2025',
    status: 'Rejected',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'text-green-600';
    case 'Pending':
      return 'text-orange-500';
    case 'Rejected':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

const statuses = ['All', 'Approved', 'Pending', 'Rejected'];

const ExpenseRequest = () => {
  const [activeStatus, setActiveStatus] = useState('All');

  const filteredExpenses =
    activeStatus === 'All'
      ? expenses
      : expenses.filter((e) => e.status === activeStatus);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold border-b-4 border-red-500 inline-block pb-1">
          Employees Expenses
        </h2>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="statusSelect" className="mr-2 font-medium">
            Filter by Status:
          </label>
          <select
            id="statusSelect"
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm text-left bg-white border border-blue-300">
          <thead className="bg-[#0284C7] text-white">
            <tr>
              <th className="px-4 py-2 border-r border-white">Employee ID</th>
              <th className="px-4 py-2 border-r border-white">Employee Name</th>
              <th className="px-4 py-2 border-r border-white">Category</th>
              <th className="px-3 py-2 border-r border-white text-center">
                <div className="flex items-center justify-center gap-1">
                  Amount (₹) <FaSort className="text-xs" />
                </div>
              </th>
              <th className="px-3 py-2 border-r border-white text-center">
                <div className="flex items-center justify-center gap-1">
                  Date <FaSort className="text-xs" />
                </div>
              </th>
              <th className="px-4 py-2 border-r border-white">Status</th>
              <th className="px-4 py-2">Take Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {filteredExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2 font-medium">{expense.id}</td>
                <td className="px-4 py-2">{expense.name}</td>
                <td className="px-4 py-2">{expense.category}</td>
                <td className="px-4 py-2 text-center">{expense.amount}</td>
                <td className="px-4 py-2 text-center">{expense.date}</td>
                <td
                  className={`px-4 py-2 font-semibold ${getStatusColor(
                    expense.status
                  )}`}
                >
                  {expense.status}
                </td>
                <td className="px-4 py-2 flex items-center gap-2 text-sm">
                  <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
                    <FaCheckSquare className="mr-1" /> Approved
                  </button>
                  <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
                    <FaTimesCircle className="mr-1" /> Reject
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No records found for "{activeStatus}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseRequest;
