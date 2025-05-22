"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  Mail,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

// Category color mapping
const categoryColors = {
  "Daily Task": "bg-green-500",
  "Deadline": "bg-purple-600", 
  "Leaves": "bg-yellow-400",
  "Reminder": "bg-green-500",
  "Meeting": "bg-red-500",
  "Event": "bg-blue-500",
  "Other": "bg-orange-400",
};

// Compact Toast Component
const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg max-w-xs ${getToastStyles()}`}
      >
        {getIcon()}
        <p className="text-xs font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// Compact Date Picker
const CompactDatePicker = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    if (!date) return "Pick Date";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push(currentDate);
    }
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    return date < today;
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md bg-white border border-gray-200 w-full text-left hover:border-blue-300 text-sm"
      >
        <Calendar className="w-4 h-4 text-blue-500" />
        <span className="flex-1">{formatDate(selectedDate)}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 w-64">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100 rounded text-sm"
            >
              ←
            </button>
            <div className="font-medium text-gray-800 text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100 rounded text-sm"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 p-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <button
                key={index}
                onClick={() => {
                  if (date && !isDateDisabled(date)) {
                    onChange(date);
                    setIsOpen(false);
                  }
                }}
                disabled={!date || isDateDisabled(date)}
                className={`p-1 text-xs rounded ${
                  !date
                    ? "invisible"
                    : isDateDisabled(date)
                    ? "text-gray-300 cursor-not-allowed"
                    : selectedDate &&
                      date.toDateString() === selectedDate.toDateString()
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                {date ? date.getDate() : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CompactEventForm({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [category, setCategory] = useState("Reminder");
  const [reminderMinutes, setReminderMinutes] = useState("15");
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [timeSearch, setTimeSearch] = useState("");

  const emailOptions = [
    "john.doe@gmail.com",
    "jane.smith@outlook.com",
    "mike.johnson@yahoo.com",
  ];

  const categoryOptions = [
    
    "Deadline", 
    "Leaves",
    "Reminder"
  ];

  const formatTimeDisplay = (timeValue) => {
    if (!timeValue) return "";
    const [hours, minutes] = timeValue.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = formatTimeDisplay(timeString);
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  const filteredTimeOptions = timeOptions.filter((time) =>
    time.display.toLowerCase().includes(timeSearch.toLowerCase())
  );

  const emailButtonRef = useRef(null);
  const timeButtonRef = useRef(null);
  const categoryButtonRef = useRef(null);

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmailDropdown &&
        emailButtonRef.current &&
        !emailButtonRef.current.contains(event.target)
      ) {
        setShowEmailDropdown(false);
      }
      if (
        showTimeDropdown &&
        timeButtonRef.current &&
        !timeButtonRef.current.contains(event.target)
      ) {
        setShowTimeDropdown(false);
        setTimeSearch("");
      }
      if (
        showCategoryDropdown &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmailDropdown, showTimeDropdown, showCategoryDropdown]);

  const handleCancel = useCallback((e) => {
    e?.preventDefault();
    setTitle("");
    setDescription("");
    setEmail("");
    setSelectedDate(new Date());
    setSelectedTime("");
    setCategory("Reminder");
    setReminderMinutes("15");
    showToast("Form cleared", "warning");
    if (onClose) onClose();
  }, [onClose]);

  const handleSaveAndClose = useCallback(
    async (e) => {
      e?.preventDefault();

      if (!title.trim()) {
        showToast("Title required", "error");
        return;
      }
      if (!description.trim()) {
        showToast("Description required", "error");
        return;
      }
      if (!email.trim()) {
        showToast("Email required", "error");
        return;
      }
      if (!selectedTime) {
        showToast("Time required", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Invalid email format", "error");
        return;
      }

      try {
        const eventData = {
          type: "Event",
          id: Date.now().toString(),
          title,
          description,
          email,
          date: selectedDate.toISOString().split("T")[0],
          time: formatTimeDisplay(selectedTime),
          category,
          reminderMinutes: parseInt(reminderMinutes),
          createdAt: new Date().toISOString(),
          participants: email ? [email] : []
        };

        const existingEvents = JSON.parse(
          localStorage.getItem("events") || "[]"
        );
        existingEvents.push(eventData);
        localStorage.setItem("events", JSON.stringify(existingEvents));

        showToast("Event created successfully!", "success");

        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } catch (error) {
        showToast("Failed to save event", "error");
      }
    },
    [
      title,
      description,
      email,
      selectedDate,
      selectedTime,
      category,
      reminderMinutes,
      onClose,
    ]
  );

  return (
    <div className="h-fit bg-white p-1">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg ">
          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title{" "}
              </label>
              <input
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date{" "}
                </label>
                <CompactDatePicker
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Time{" "}
                </label>
                <div className="relative" ref={timeButtonRef}>
                  <button
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 w-full text-left text-sm hover:border-blue-300"
                  >
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="flex-1 text-xs">
                      {selectedTime ? formatTimeDisplay(selectedTime) : "Pick"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 ${
                        showTimeDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showTimeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-full">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search time..."
                          value={timeSearch}
                          onChange={(e) => setTimeSearch(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {filteredTimeOptions.slice(0, 10).map((time, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedTime(time.value);
                              setShowTimeDropdown(false);
                              setTimeSearch("");
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                          >
                            {time.display}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category & Reminder Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative" ref={categoryButtonRef}>
                  <button
                    onClick={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-200 w-full text-left text-sm hover:border-blue-300"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-3 h-3 rounded-sm ${categoryColors[category] || 'bg-gray-400'}`}
                      ></span>
                      <span className="text-xs">{category}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 ${
                        showCategoryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-full">
                      {categoryOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCategory(option);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2"
                        >
                          <span 
                            className={`w-3 h-3 rounded-sm ${categoryColors[option] || 'bg-gray-400'}`}
                          ></span>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Remind
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(e.target.value)}
                    className="w-12 px-2 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">min</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative" ref={emailButtonRef}>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md hover:border-blue-300">
                  <Mail className="w-4 h-4 text-blue-500 ml-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setShowEmailDropdown(true)}
                    placeholder="your@email.com"
                    className="flex-1 px-2 py-2 text-sm bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setShowEmailDropdown(!showEmailDropdown)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 ${
                        showEmailDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {showEmailDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-full">
                    {emailOptions
                      .filter((option) =>
                        option.toLowerCase().includes(email.toLowerCase())
                      )
                      .map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setEmail(option);
                            setShowEmailDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                        >
                          {option}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description{" "}
              </label>
              <textarea
                placeholder="Event details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4  ">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              className="flex-1 py-2 text-sm bg-[#018ABE] text-white rounded-md hover:bg-[#018ABE] font-medium"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}