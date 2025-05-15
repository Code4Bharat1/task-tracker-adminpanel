'use client';

import React, { useState } from 'react';
import { FaSort, FaCheckSquare, FaTimesCircle } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

const expenses = [
  {
    id: 'NXC101',
    name: 'Shubham Prajapati',
    category: 'Travel',
    amount: '₹1,200',
    date: '10-05-2025',
    status: 'Approved',
    document: 'invoice_nxc101.pdf',
  },
  {
    id: 'NXC102',
    name: 'Rohan Pawar',
    category: 'Hotel Stay',
    amount: '₹3,000',
    date: '15-03-2025',
    status: 'Pending',
    document: 'receipt_nxc102.pdf',
  },
  {
    id: 'NXC103',
    name: 'Harsh Singh',
    category: 'Food',
    amount: '₹1,500',
    date: '18-05-2025',
    status: 'Approved',
    document: 'bill_nxc103.pdf',
  },
  {
    id: 'NXC104',
    name: 'Henna',
    category: 'Office Supplies',
    amount: '₹5,200',
    date: '23-05-2025',
    status: 'Rejected',
    document: 'invoice_nxc104.pdf',
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
  const [showModal, setShowModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const router = useRouter();

  const filteredExpenses =
    activeStatus === 'All'
      ? expenses
      : expenses.filter((e) => e.status === activeStatus);
      
  const openModal = (document) => {
    setCurrentDocument(document);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

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
              <th className="px-4 py-2 border-r border-white">Documents</th>
              <th className="px-4 py-2 border-r border-white">Take Action</th>
              <th className="px-4 py-2 border-r border-white">More</th>
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
                <td className="px-4 py-2 text-blue-600 underline cursor-pointer">
                  <span 
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(expense.document);
                    }}
                    className="cursor-pointer"
                  >
                    View
                  </span>
                </td>
                <td className="px-4 py-2 flex items-center gap-2 text-sm">
                  <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
                    <FaCheckSquare className="mr-1" /> Approved
                  </button>
                  <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
                    <FaTimesCircle className="mr-1" /> Reject
                  </button>
                </td>
                <td className="px-4 py-2 relative">
                  <div className="group inline-block relative">
                    <BsThreeDotsVertical className="text-xl cursor-pointer" />
                    <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-300 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        onClick={() => router.push(`/expense`)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No records found for "{activeStatus}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Document Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Receipt Document</h3>
              <button 
                type="button"
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
              <div className="w-full h-64 flex items-center justify-center border border-gray-300 bg-white rounded-md mb-4">
                <img src="/api/placeholder/400/320" alt="Receipt document" className="max-h-full object-contain" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Document: {currentDocument}</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Download
                  </button>
                  <button 
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseRequest;