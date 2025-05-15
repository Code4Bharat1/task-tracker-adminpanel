'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import axios from 'axios';

const positions = ['Manager', 'Team Leader', 'Employee', 'HR'];
const genders = ['Male', 'Female', 'Other'];

// Helper function to convert Excel date serial number to YYYY-MM-DD format
const excelDateToYYYYMMDD = (serial) => {
  if (!serial) return '';
  
  // Excel dates are number of days since 1900-01-01 (except Excel incorrectly assumes 1900 is a leap year)
  // For JavaScript, we need to convert this to milliseconds
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const EXCEL_EPOCH = new Date(1899, 11, 30); // Dec 30, 1899
  
  // Create date from the Excel serial number
  const date = new Date(EXCEL_EPOCH.getTime() + serial * MS_PER_DAY);
  
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

export default function EmployeeForm() {
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState(positions[0]);
  const [gender, setGender] = useState(genders[0]);
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [bulkEmployees, setBulkEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const excelInputRef = useRef(null);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhoneNumber = (phone) => /^[\d\s+\-()]{7,15}$/.test(phone);
  const isValidPosition = (pos) => positions.includes(pos);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setEmail('');
    setPosition(positions[0]);
    setGender(genders[0]);
    setDateOfJoining('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!firstName || !lastName || !phoneNumber || !email || !dateOfJoining) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!isValidEmail(email)) return toast.error('Invalid email address');
    if (!isValidPhoneNumber(phoneNumber)) return toast.error('Invalid phone number format');

    try {
      setIsSubmitting(true);
      
      const payload = {
        firstName, 
        lastName, 
        phoneNumber, 
        email, 
        position, 
        gender, 
        dateOfJoining
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/register`,
        payload,
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success('Employee added successfully!');
        resetForm();
      } else {
        toast.error('Failed to save employee');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload CSV or Excel file only.');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          toast.error('No data found in the uploaded file');
          return;
        }

        const requiredHeaders = [
          'First Name', 'Last Name', 'Phone Number',
          'Email', 'Position', 'Gender', 'Date of Joining'
        ];
        
        const fileHeaders = Object.keys(jsonData[0] || {});
        const missingHeaders = requiredHeaders.filter(
          (h) => !fileHeaders.includes(h)
        );

        if (missingHeaders.length > 0) {
          toast.error(`Missing headers: ${missingHeaders.join(', ')}`);
          return;
        }

        // Process and validate the data
        const processedData = jsonData.map((emp, index) => {
          // Convert Excel date format if needed
          let dateOfJoining = emp['Date of Joining'];
          if (typeof dateOfJoining === 'number') {
            dateOfJoining = excelDateToYYYYMMDD(dateOfJoining);
          }

          return {
            ...emp,
            'Date of Joining': dateOfJoining,
            rowIndex: index + 2 // +2 because of header row and 0-indexing
          };
        });

        // Validate all rows
        const invalidRows = processedData.filter(emp => 
          !emp['First Name'] || 
          !emp['Last Name'] || 
          !isValidEmail(emp['Email']) ||
          !isValidPhoneNumber(emp['Phone Number']) ||
          !isValidPosition(emp['Position']) ||
          !emp['Date of Joining']
        );

        if (invalidRows.length > 0) {
          toast.error(`Found ${invalidRows.length} invalid rows. Please check data and try again.`);
          console.error('Invalid rows:', invalidRows);
          return;
        }

        setBulkEmployees(processedData);
        toast.success(`Successfully parsed ${processedData.length} employees`);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the format.');
      }
      
      e.target.value = null;
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkEmployees.length === 0) {
      toast.error('No employees to upload');
      return;
    }

    try {
      setIsBulkUploading(true);
      
      const users = bulkEmployees.map(emp => ({
        firstName: emp['First Name'],
        lastName: emp['Last Name'],
        phoneNumber: emp['Phone Number'],
        email: emp['Email'],
        position: emp['Position'],
        gender: emp['Gender'],
        dateOfJoining: emp['Date of Joining'],
      }));

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/register/bulk`,
        { users },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success(res.data.message || `Successfully uploaded ${users.length} employees!`);
        setBulkEmployees([]);
      } else {
        toast.error('Bulk upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error during bulk upload');
    } finally {
      setIsBulkUploading(false);
    }
  };

  const generateCSVTemplate = () => {
    const headers = [
      'First Name', 'Last Name', 'Phone Number',
      'Email', 'Position', 'Gender', 'Date of Joining'
    ];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-white rounded-lg shadow-md min-h-screen">
      
      <div className="flex items-center border-b-4 border-blue-600 pb-4 mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Employee Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Single Employee Form */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Single Employee
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => /^[a-zA-Z\s]*$/.test(e.target.value) && setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => /^[a-zA-Z\s]*$/.test(e.target.value) && setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: 7-15 digits, may include spaces, +, -, ()</p>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">Position *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white"
                  required
                >
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white"
                  required
                >
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700 mb-1">Date of Joining *</label>
              <input
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Employee
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bulk Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Bulk Upload Employees
          </h2>

          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important Instructions
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 ml-5 list-disc">
              <li>CSV headers must be exactly: <br />
                <span className="font-bold">First Name, Last Name, Phone Number, Email, Position, Gender, Date of Joining</span>
              </li>
              <li>Position must be one of: {positions.join(', ')}</li>
              <li>Date of Joining format: YYYY-MM-DD (e.g., 2025-02-01)</li>
              <li>All fields are required</li>
            </ul>
          </div>

          <div className="space-y-4">
            <label className="block font-medium text-gray-700 mb-1">
              Upload Excel/CSV File
            </label>
            
            <div className="flex items-center">
              <input
                ref={excelInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <a
              href={generateCSVTemplate()}
              download="employee_template.csv"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-center w-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download CSV Template
            </a>
          </div>

          {bulkEmployees.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Parsed Employees: {bulkEmployees.length}
              </h3>
              
              <div className="overflow-x-auto mt-2 border border-gray-200 rounded-md max-h-60">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0">
                      {['First Name', 'Last Name', 'Phone Number', 'Email', 'Position', 'Gender', 'Date of Joining'].map(header => (
                        <th key={header} className="border-b border-gray-300 px-3 py-2 font-medium text-gray-700">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkEmployees.map((emp, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {['First Name', 'Last Name', 'Phone Number', 'Email', 'Position', 'Gender', 'Date of Joining'].map(field => (
                          <td key={field} className="border-b border-gray-200 px-3 py-2 text-gray-600">{emp[field]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleBulkUpload}
                className="bg-blue-700 text-white py-3 px-6 rounded-md hover:bg-blue-800 transition mt-4 w-full flex items-center justify-center"
                disabled={isBulkUploading}
              >
                {isBulkUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload {bulkEmployees.length} Employees to Database
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )};