'use client';
import React, { useState, useRef } from 'react';
import { MdDelete, MdPreview } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { Eye  } from 'lucide-react';
import { useRouter } from 'next/navigation';

const documentOptions = ['Adhar card', 'Passport photo', 'Pan card', 'Resume'];

export default function AddDocument() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docName, setDocName] = useState(documentOptions[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const router = useRouter();
  

  const fileInputRef = useRef(null);

  // File Change Handler
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Delete File Handler
  const handleDelete = () => setUploadedFile(null);

  // Save Document Handler
  const handleSaveDocument = async () => {
    if (!firstName || !lastName || !uploadedFile || !docName) {
      toast.error('Please fill in all fields before saving.');
      return;
    }

    // Create FormData Object
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('documentName', docName);
    formData.append('documentFile', uploadedFile);

    try {
      const response = await fetch('http://localhost:4110/api/adddocument/adminaddDocument', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Document saved successfully!');
        console.log('Response from server:', data);

        // Clear form after success
        setFirstName('');
        setLastName('');
        setDocName(documentOptions[0]);
        setUploadedFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save document.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Server error, please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <Toaster /> {/* Toast container */}
      <div className='flex items-center justify-between'>
      <h1 className="text-4xl font-bold mb-8">
        <span className="border-b-4 border-red-500 pb-1 ml-8">Add Document</span>
      </h1>

         {/* Add Document Button */}
          <button
            onClick={() => router.push('/viewdocument')}
            className="bg-[#018ABE] cursor-pointer hover:bg-[#0176a1] text-white px-4 mr-7 py-2 rounded shadow flex items-center gap-2 text-sm font-medium"
          >
            <Eye  size={16} />
            View Document
          </button>

      </div>

      <div className="bg-white rounded-xl shadow p-8 md:mx-10 border border-black justify-center items-center">
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
          <div>
            <label className="block font-medium mb-2">Document Name :</label>
            <div className="relative w-full">
              <button
                type="button"
                className="w-full border border-[#BFB8B8] rounded-md px-4 py-2 shadow-lg flex justify-between items-center"
                onClick={() => setShowDropdown((v) => !v)}
              >
                {docName}
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

          <div>
            <label className="block font-medium mb-2">Upload Document :</label>
            <div className="mb-3">
              <div className="flex">
                <label className="cursor-pointer bg-gray-200 text-black border border-gray-300 rounded-l-md px-4 py-2">
                  Choose File
                  <input
                    id="attachment"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-md px-4 py-2 flex-grow">
                  {uploadedFile ? uploadedFile.name : 'No File chosen'}
                </div>
              </div>
            </div>

            {uploadedFile && (
              <div className="mt-2">
                <label className="block font-medium mb-2">Uploaded Document :</label>
                <div className="flex">
                  <div className="bg-gray-100 border border-gray-300 rounded-l-md px-4 py-2 flex-grow">
                    {uploadedFile.name}
                  </div>
                  <button onClick={handleDelete} className="bg-white border cursor-pointer border-gray-300 border-l-0 rounded-r-md px-2 py-2" title="Delete">
                    <MdDelete size={20} />
                  </button>
                  <a
                    href={URL.createObjectURL(uploadedFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-300 border-l-0 rounded-r-md px-2 py-2"
                    title="View"
                  >
                    <MdPreview size={20} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-14">
          <button
            className="bg-[#018ABE] text-white cursor-pointer font-semibold px-12 py-3 rounded-lg shadow hover:bg-[#01739C] transition"
            onClick={handleSaveDocument}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}