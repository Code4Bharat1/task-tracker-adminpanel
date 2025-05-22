"use client";
import { useState, useEffect, useRef, forwardRef } from "react";
import { LuCalendarClock } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    ref={ref}
    type="button"
    className="flex-1 text-left bg-white focus:outline-none placeholder:text-gray-500 text-gray-800 cursor-pointer "
  >
    {value || "DD/MM/YYYY"}
  </button>
));
CustomDateInput.displayName = "CustomDateInput";

export default function TaskForm({ onClose, onSave, selectedDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate || new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomEmail, setIsCustomEmail] = useState(false);

  const timeDropdownRef = useRef(null);
  const emailDropdownRef = useRef(null);

  const emailList = [
    "john.doe@example.com",
    "jane.smith@example.com",
    "mark.wilson@example.com",
    "sarah.johnson@example.com",
    "Add custom email...",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setShowEmailDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayTime = () => {
    if (!selectedTime) return "Select time";
    return selectedTime;
  };

  const handleEmailSelect = (email) => {
    if (email === "Add custom email...") {
      setIsCustomEmail(true);
      setSelectedEmail("");
    } else {
      setSelectedEmail(email);
      setIsCustomEmail(false);
    }
    setShowEmailDropdown(false);
  };

  const handleCancel = (e) => {
    e?.preventDefault();
    onClose();
  };

  const handleCreate = (e) => {
    e?.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];
    const finalEmail = isCustomEmail ? customEmail : selectedEmail;

    const taskData = {
      type: "Task",
      title,
      description,
      date: formattedDate,
      time: selectedTime || "",
      email: finalEmail || "",
      createdAt: new Date().toISOString(),
      participants: finalEmail ? [finalEmail] : []
    };

    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.push(taskData);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    toast.success("Task created successfully!");

    if (onSave) {
      onSave(formattedDate, "Daily Task", title, finalEmail);
    }

    if (onClose) onClose();
  };

  return (
    <div>
      {/* Title Input */}
      <input
        type="text"
        placeholder="Add Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-b border-gray-300 focus:outline-none py-2 text-gray-700 placeholder-gray-500 mb-4"
      />

      {/* Date Picker */}
      <div className="flex items-center gap-3 mb-5">
        <LuCalendarClock className="text-2xl text-gray-600" />
        <DatePicker
          selected={date}
          onChange={setDate}
          dateFormat="dd/MM/yyyy"
          customInput={<CustomDateInput />}
          minDate={new Date()}
        />
      </div>

      {/* Time Input */}
      <div className="mb-4">
        <label className="text-gray-600 block mb-2">Time:</label>
        <div className="relative" ref={timeDropdownRef}>
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-700 w-full text-left flex justify-between items-center"
          >
            {formatDisplayTime()}
            <IoMdArrowDropdown className="text-gray-600 text-base" />
          </button>

          {showTimeDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
              {Array.from({ length: 24 }, (_, hour) =>
                [0, 15, 30, 45].map((minute) => {
                  const hourDisplay = hour % 12 === 0 ? 12 : hour % 12;
                  const ampm = hour < 12 ? "AM" : "PM";
                  const timeString = `${hourDisplay}:${minute.toString().padStart(2, "0")} ${ampm}`;
                  return (
                    <button
                      key={`${hour}-${minute}`}
                      onClick={() => {
                        setSelectedTime(timeString);
                        setShowTimeDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-blue-100 rounded-md"
                    >
                      {timeString}
                    </button>
                  );
                })
              ).flat()}
            </div>
          )}
        </div>
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label className="text-gray-600 block mb-2">Email:</label>
        <div className="relative" ref={emailDropdownRef}>
          <div
            onClick={() => setShowEmailDropdown(!showEmailDropdown)}
            className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-700 w-full text-left flex justify-between items-center cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MdEmail className="text-gray-600" />
              {isCustomEmail ? "Custom email" : selectedEmail || "Select email"}
            </div>
            <IoMdArrowDropdown className="text-gray-600 text-base" />
          </div>

          {showEmailDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
              {emailList.map((email) => (
                <button
                  key={email}
                  onClick={() => handleEmailSelect(email)}
                  className="w-full text-left px-2 py-1 hover:bg-blue-100 rounded-md"
                >
                  {email}
                </button>
              ))}
            </div>
          )}
        </div>

        {isCustomEmail && (
          <input
            type="email"
            placeholder="Enter email address"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-700 mt-2"
          />
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="text-gray-600 block mb-2">Description:</label>
        <textarea
          placeholder="Add Description"
          className="w-full bg-gray-50 px-4 py-2 rounded-lg shadow-sm text-gray-700 border border-gray-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-6">
        <button onClick={handleCancel} className="text-gray-700 hover:underline font-medium">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="bg-[#018ABE] text-white px-4 py-2 rounded-md hover:bg-[#016d98] transition-colors"
        >
          Create Task
        </button>
      </div>
    </div>
  );
}