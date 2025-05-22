'use client';
import React, { useState, useRef } from 'react';
import { MdDelete, MdPreview, MdCloudUpload, MdCheckCircle } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { Eye, FileText, User, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const documentOptions = ['Addhar card', 'Passport photo', 'Pan card', 'Resume'];

export default function AddDocument() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docName, setDocName] = useState(documentOptions[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  
  const fileInputRef = useRef(null);

  // File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      toast.success('File uploaded successfully!');
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      toast.success('File uploaded successfully!');
    }
  };

  // Delete File Handler
  const handleDelete = () => {
    setUploadedFile(null);
    toast.success('File removed');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Save Document Handler with Axios
  const handleSaveDocument = async () => {
    if (!firstName || !lastName || !uploadedFile || !docName) {
      toast.error('Please fill in all fields before saving.');
      return;
    }

    setIsLoading(true);

    // Create FormData Object
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('documentName', docName);
    formData.append('documentFile', uploadedFile);

    try {
      const response = await axios.post(
        'http://localhost:4110/api/adddocument/adminaddDocument',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can use this to show upload progress if needed
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      toast.success('Document saved successfully!');
      console.log('Response from server:', response.data);

      // Clear form after success
      setFirstName('');
      setLastName('');
      setDocName(documentOptions[0]);
      setUploadedFile(null);
      
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Failed to save document.';
        toast.error(errorMessage);
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  px-4 py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
        }}
      />
      
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className="flex items-center gap-3">
          <div className="bg-[#0179a4] p-3 rounded-lg">
            <FileText className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            Add Document
          </h1>
        </div>

        <button
          onClick={() => router.push('/viewdocument')}
          className="bg-gradient-to-r  bg-[#0179a4] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-medium transition-all duration-200 transform hover:scale-105"
        >
          <Eye size={18} />
          View Documents
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:mx-4 lg:mx-8 border border-gray-200">
        {/* Personal Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <User className="text-[#0179a4]" size={20} />
            <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-3 text-gray-700">First Name</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={firstName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(value)) {
                    setFirstName(value);
                  }
                }}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block font-medium mb-3 text-gray-700">Last Name</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={lastName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(value)) {
                    setLastName(value);
                  }
                }}
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        {/* Document Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-[#0179a4]" size={20} />
            <h2 className="text-xl font-semibold text-gray-700">Document Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Document Type Dropdown */}
            <div>
              <label className="block font-medium mb-3 text-gray-700">Document Type</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 shadow-sm flex justify-between items-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <span className="text-gray-700">{docName}</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg mt-2 z-20 max-h-48 overflow-y-auto">
                    {documentOptions.map((option) => (
                      <button
                        key={option}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
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
              <label className="block font-medium mb-3 text-gray-700">Upload Document</label>
              
              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                    isDragOver 
                      ? 'border-bg-[#0179a4] bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <MdCloudUpload className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600 font-medium mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Maximum file size: 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MdCheckCircle className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 truncate max-w-xs">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Delete file"
                      >
                        <MdDelete size={20} />
                      </button>
                      <a
                        href={URL.createObjectURL(uploadedFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Preview file"
                      >
                        <MdPreview size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            className={`bg-gradient-to-r  bg-[#0179a4] text-white font-semibold px-12 py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
            onClick={handleSaveDocument}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Upload size={20} />
                Save Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}