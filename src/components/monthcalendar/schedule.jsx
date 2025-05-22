'use client';

import { useState, useEffect, useRef } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { IoMdArrowDropdown, IoMdSearch } from 'react-icons/io';
import { toast } from 'react-toastify';

export default function SchedulePage({ onClose, selectedDate }) {
  const [date, setDate] = useState(selectedDate || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participant, setParticipant] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const emailRef = useRef(null);

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  const emailOptions = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
    'david@example.com',
    'eve@example.com',
    'frank@example.com',
    'grace@example.com',
    'henry@example.com'
  ];

  const filteredEmails = emailOptions.filter(email => 
    email.toLowerCase().includes(emailSearch.toLowerCase())
  );

  useEffect(() => {
    if (selectedDate) {
      // Convert from Date object to YYYY-MM-DD format if needed
      if (selectedDate instanceof Date) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
      } else {
        setDate(selectedDate);
      }
    }

    const handleClickOutside = (event) => {
      if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
        setIsStartOpen(false);
      }
      if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
        setIsEndOpen(false);
      }
      if (emailRef.current && !emailRef.current.contains(event.target)) {
        setIsEmailOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedDate]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSchedule = (e) => {
    e?.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please select start and end times");
      return;
    }

    if (parseTime(startTime) >= parseTime(endTime)) {
      toast.error("End time must be after start time");
      return;
    }

    if (!participant) {
      toast.error("Please select a participant");
      return;
    }

    const meetingData = {
      type: "Meeting",
      title,
      description,
      date: date,
      time: `${startTime} - ${endTime}`,
      startTime,
      endTime,
      email: participant,
      participants: [participant],
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const meetings = JSON.parse(localStorage.getItem("meetings") || "[]");
    meetings.push(meetingData);
    localStorage.setItem("meetings", JSON.stringify(meetings));

    toast.success("Meeting scheduled successfully!");

    // Reset form
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setParticipant('');

    // Close modal
    if (onClose) onClose();
  };

  const handleCancel = (e) => {
    e?.preventDefault();
    
    // Reset form
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setParticipant('');
    
    // Close modal
    if (onClose) onClose();
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg">
      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
          <LuCalendarClock className="text-gray-500" />
          <input
            type="date"
            value={date}
            min={getMinDate()}
            onChange={(e) => setDate(e.target.value)}
            className="ml-2 w-full bg-transparent focus:outline-none py-1 text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Time Pickers */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Time:</label>
        <div className="flex items-center space-x-2">
          {/* Start Time */}
          <div className="relative" ref={startTimeRef}>
            <button
              onClick={() => setIsStartOpen(!isStartOpen)}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg bg-gray-50 text-gray-700 w-[120px] border border-gray-200 hover:bg-gray-100"
            >
              {startTime || 'Start'}
              <IoMdArrowDropdown className={`transition-transform ${isStartOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStartOpen && (
              <div className="absolute z-10 mt-1 w-[140px] bg-white shadow-lg rounded-lg py-1 max-h-60 overflow-auto border border-gray-200">
                {times.map((time) => (
                  <div
                    key={time}
                    onClick={() => {
                      setStartTime(time);
                      setIsStartOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer ${startTime === time ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-gray-500">to</span>

          {/* End Time */}
          <div className="relative" ref={endTimeRef}>
            <button
              onClick={() => setIsEndOpen(!isEndOpen)}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg bg-gray-50 text-gray-700 w-[120px] border border-gray-200 hover:bg-gray-100"
            >
              {endTime || 'End'}
              <IoMdArrowDropdown className={`transition-transform ${isEndOpen ? 'rotate-180' : ''}`} />
            </button>
            {isEndOpen && (
              <div className="absolute z-10 mt-1 w-[140px] bg-white shadow-lg rounded-lg py-1 max-h-60 overflow-auto border border-gray-200">
                {times.map((time) => (
                  <div
                    key={time}
                    onClick={() => {
                      setEndTime(time);
                      setIsEndOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer ${endTime === time ? 'bg-green-100 text-green-700' : 'hover:bg-gray-50'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Add Participant:</label>
        <div className="relative" ref={emailRef}>
          <button
            onClick={() => setIsEmailOpen(!isEmailOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          >
            {participant || 'Select Email Address'}
            <IoMdArrowDropdown className={`transition-transform ${isEmailOpen ? 'rotate-180' : ''}`} />
          </button>
          {isEmailOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 max-h-60 overflow-auto border border-gray-200">
              <div className="px-2 py-1 sticky top-0 bg-white border-b">
                <div className="relative">
                  <IoMdSearch className="absolute left-2 top-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search email"
                    className="w-full pl-8 pr-2 py-1 text-sm border rounded focus:outline-none"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                  />
                </div>
              </div>
              {filteredEmails.map((email) => (
                <div
                  key={email}
                  onClick={() => {
                    setParticipant(email);
                    setIsEmailOpen(false);
                    setEmailSearch('');
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer ${participant === email ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  {email}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title:</label>
        <input
          type="text"
          placeholder="Enter meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Meeting Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
        <textarea
          placeholder="Enter meeting description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          className="px-4 py-2 text-sm font-medium text-white bg-[#018ABE] rounded-lg hover:bg-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]"
        >
          Schedule Meeting
        </button>
      </div>
    </div>
  );
}