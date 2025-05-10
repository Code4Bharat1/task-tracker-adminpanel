'use client';
import { Download, File, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const data = [
  {
    name: 'Chinmay Gawade',
    document: 'Resume',
    date: '30-04-2025',
    type: 'pdf',
    fileUrl: '/documents/chinmay_resume.pdf',
  },
  {
    name: 'Harsh Singh',
    document: 'Adhar card',
    date: '28-03-2025',
    type: 'word',
    fileUrl: '/documents/harsh_adhar.docx',
  },
  {
    name: 'Tamim Tolkar',
    document: 'Pan card',
    date: '10-05-2025',
    type: 'pdf',
    fileUrl: '/documents/tamim_pan.pdf',
  },
];

function formatDate(input) {
  const date = new Date(input);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function DocumentTable() {
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('Date');
  const [filterDate, setFilterDate] = useState('');
  const router = useRouter();

  const filteredData = data
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.document.toLowerCase().includes(search.toLowerCase());

      const matchDate = filterDate
        ? item.date === formatDate(filterDate)
        : true;

      return matchSearch && matchDate;
    })
    .sort((a, b) => {
      if (sortType === 'Name') return a.name.localeCompare(b.name);
      if (sortType === 'Date') {
        const [aDate, aMonth, aYear] = a.date.split('-').map(Number);
        const [bDate, bMonth, bYear] = b.date.split('-').map(Number);
        return (
          new Date(bYear, bMonth - 1, bDate).getTime() -
          new Date(aYear, aMonth - 1, aDate).getTime()
        );
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          <span className="border-b-4 border-red-500 pb-1 ml-8">Document</span>
        </h1>

        <div className="flex items-center mr-9 gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border-none rounded-full px-4 py-2 shadow">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="outline-none w-32 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            className="px-4 py-2 rounded shadow text-sm outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          {/* Add Document Button */}
          <button
            onClick={() => router.push('/adddocument')}
            className="bg-[#018ABE] hover:bg-[#0176a1] text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Add Document
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex justify-center">
  <div className="w-full md:w-[98%] lg:w-[95%] rounded-xl shadow-[0px_5px_10px_lightgray] bg-white overflow-hidden my-8">
    <table className="min-w-full border-separate border-spacing-0">

          <thead style={{ backgroundColor: '#018ABE' }} className="text-white">
              <tr className="text-center">
              <th className="p-3 border-r border-white rounded-tl-lg">Sr No.</th>
              <th className="p-3 border-r border-white">Name</th>
              <th className="p-3 border-r border-white">Documents</th>
              <th className="p-3 border-r border-white">Dates</th>
              <th className="p-3 border-r border-white">Type</th>
              <th className="p-3 border-r border-white">Download</th>
              <th className="p-3 border-r border-white">Action</th>
              </tr>
            </thead>
            <tbody>
  {filteredData.map((item, index) => (
    <tr key={index} className="border-t text-center">
      
      <td className="py-1">
        <p className="border-r px-1 py-1 whitespace-nowrap">{index + 1}</p>
      </td>

      <td className="py-1">
        <p className="border-r px-1 py-1 whitespace-nowrap">{item.name}</p>
      </td>

      <td className="py-1">
        <p className="border-r px-1 py-1 whitespace-nowrap">{item.document}</p>
      </td>

      <td className="py-1">
        <p className="border-r px-1 py-1 whitespace-nowrap">{item.date}</p>
      </td>

      <td className="py-1">
        <p className="border-r px-1 py-1 whitespace-nowrap flex justify-center items-center">
          {item.type === 'pdf' ? (
            <span className="text-black">📕 pdf</span>
          ) : (
            <span className="text-black">📘 word</span>
          )}
        </p>
      </td>

      <td className="py-1">
      <p className="border-r px-1 py-2 whitespace-nowrap flex justify-center items-center">
          <a
            href={item.fileUrl}
            download
            className="text-black hover:text-black"
            title="Download"
          >
            <Download size={18} />
          </a>
        </p>
      </td>

      <td className="px-2 py-1 text-center">
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#008ecc] hover:underline"
          title="View"
        >
          View
        </a>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
