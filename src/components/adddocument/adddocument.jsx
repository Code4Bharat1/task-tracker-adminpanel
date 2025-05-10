'use client';
import React, { useState, useRef } from 'react';
import { MdDelete, MdPreview } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast'; // ✅ Toast import

const documentOptions = ['Adhar card', 'Passport photo', 'Pan card', 'Resume'];

export default function AddDocument() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docName, setDocName] = useState(documentOptions[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDelete = () => setUploadedFile(null);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <Toaster /> {/* ✅ Toast container */}

      <h1 className="text-4xl font-bold mb-8">
        <span className="border-b-4 border-red-500 pb-1 ml-8">Add Document</span>
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-3xl ml-8">
  <div className="grid grid-cols-2 gap-8 mb-8">

        <div>
  <label className="block font-medium mb-2">First Name :</label>
  <input
    type="text"
    className="w-full border border-[#BFB8B8] rounded-md px-4 py-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={firstName}
    onChange={(e) => {
      const value = e.target.value;
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFirstName(value);
      }
    }}
    placeholder="Enter first name"
  />
</div>

<div>
  <label className="block font-medium mb-2">Last Name :</label>
  <input
    type="text"
    className="w-full border border-[#BFB8B8] rounded-md px-4 py-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={lastName}
    onChange={(e) => {
      const value = e.target.value;
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setLastName(value);
      }
    }}
    placeholder="Enter last name"
  />
</div>

        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Dropdown Section */}
          <div>
            <label className="block font-medium mb-2">Document Name :</label>
            <div className="relative w-full">
              <button
                type="button"
                className="w-full border border-[#BFB8B8] rounded-md px-4 py-2 shadow-lg flex justify-between items-center"
                onClick={() => setShowDropdown((v) => !v)}
              >
                {docName}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute w-full bg-white border rounded-md shadow mt-1 z-10 max-h-40 overflow-y-auto text-sm">
                  {documentOptions.map((option) => (
                    <button
                      key={option}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
                      onClick={() => {
                        setDocName(option);
                        setShowDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block font-medium mb-2">Upload Document :</label>
            <div className="flex items-center bg-[#D9D9D9] border border-[#877575] rounded-md px-3 py-2 shadow w-60">
              <label className="file-label relative cursor-pointer">
                <span className="text-sm text-black bg-white border border-gray-300 px-3 py-1 rounded shadow mr-3">
                  Choose File
                </span>
                <input
                  id="attachment"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <span className="text-black text-sm truncate">
                {uploadedFile ? uploadedFile.name : 'No File chosen'}
              </span>
            </div>

            {/* Uploaded Document Section */}
            <div className="mt-6">
  <label className="block font-medium mb-2">Uploaded Document :</label>
  {uploadedFile ? (
    <div className="flex items-center justify-center space-x-3">
      <input
        type="text"
        readOnly
        value={uploadedFile.name}
        className="border border-gray-300 bg-white text-gray-600 rounded-lg px-4 py-2 shadow-inner w-52 text-center"
      />
      <div className="flex space-x-2">
        <button onClick={handleDelete} title="Delete">
          <MdDelete size={22} />
        </button>
        <a
          href={URL.createObjectURL(uploadedFile)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-500"
          title="View"
        >
          <MdPreview size={22} />
        </a>
      </div>
    </div>
  ) : (
    <input
      type="text"
      readOnly
      value="No file uploaded"
      className="border border-[#877575] bg-[#D9D9D9] text-gray-600 rounded-lg px-4 py-2 shadow-inner w-60 text-center"
    />
  )}
</div>

          </div>
        </div>

        {/* Save Button with Validation */}
        <div className="flex justify-center mt-14">
          <button
            className="bg-[#018ABE] text-white font-semibold px-12 py-3 rounded-lg shadow hover:bg-[#01739C] transition"
            onClick={() => {
              if (!firstName || !lastName || !uploadedFile || !docName) {
                toast.error('Please fill in all fields before saving.');
                return;
              }
              toast.success('Document saved successfully!');
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}