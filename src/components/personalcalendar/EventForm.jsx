"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  CalendarIcon,
  ChevronDown,
  Bell,
  Plane,
  Clock,
  CheckSquare,
} from "lucide-react";

const EventForm = ({
  formData,
  handleInputChange,
  categoryDotColors,
  onSubmit,
  onCancel,
}) => {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Refs for auto-close timers
  const timeCloseTimer = useRef(null);
  const categoryCloseTimer = useRef(null);

  const timeOptions = Array.from({ length: 16 }).map((_, i) => {
    const hour = i + 6; // 6 AM to 9 PM
    const displayHour = hour % 12 || 12;
    const amPm = hour < 12 ? "AM" : "PM";
    return {
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${displayHour}:00 ${amPm}`,
    };
  });

  const categoryOptions = [
    { value: "Reminder", label: "Reminder", color: "#22c55e", icon: Bell },
    { value: "Leaves", label: "Leaves", color: "#eab308", icon: Plane },
    { value: "Deadline", label: "Deadline", color: "#a855f7", icon: Clock },
    {
      value: "Daily Task",
      label: "Daily Task",
      color: "#3b82f6",
      icon: CheckSquare,
    },
  ];

  // Get today's date in YYYY-MM-DD format
  const getTodaysDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get the color for the selected category
  const getSelectedCategoryColor = () => {
    const selectedCategory = categoryOptions.find(
      (option) => option.value === formData.category
    );
    return selectedCategory ? selectedCategory.color : "#6b7280"; // Default gray
  };

  // Get the icon for the selected category
  const getSelectedCategoryIcon = () => {
    const selectedCategory = categoryOptions.find(
      (option) => option.value === formData.category
    );
    return selectedCategory ? selectedCategory.icon : null;
  };

  // Auto-close functions
  const startTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
    timeCloseTimer.current = setTimeout(() => {
      setIsTimeDropdownOpen(false);
    }, 3000);
  };

  const startCategoryAutoClose = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }
    categoryCloseTimer.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 3000);
  };

  const clearTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
  };

  const clearCategoryAutoClose = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }
  };

  // Effect to start auto-close when dropdowns open
  useEffect(() => {
    if (isTimeDropdownOpen) {
      startTimeAutoClose();
    } else {
      clearTimeAutoClose();
    }

    return () => clearTimeAutoClose();
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    if (isCategoryDropdownOpen) {
      startCategoryAutoClose();
    } else {
      clearCategoryAutoClose();
    }

    return () => clearCategoryAutoClose();
  }, [isCategoryDropdownOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeAutoClose();
      clearCategoryAutoClose();
    };
  }, []);

  const handleTimeSelect = (timeValue) => {
    clearTimeAutoClose();
    handleInputChange({ target: { name: "time", value: timeValue } });
    setIsTimeDropdownOpen(false);
  };

  const handleCategorySelect = (categoryValue) => {
    clearCategoryAutoClose();
    handleInputChange({ target: { name: "category", value: categoryValue } });
    setIsCategoryDropdownOpen(false);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = getTodaysDate();

    // Check if selected date is in the past
    if (selectedDate < today) {
      // Don't update the date if it's in the past
      return;
    }

    handleInputChange(e);
  };

  const selectedTimeLabel =
    timeOptions.find((option) => option.value === formData.time)?.label ||
    "Select Time";
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === formData.category)
      ?.label || "Select Category";

  // Check if the current date is in the past
  const isDateInPast = () => {
    if (!formData.date) return false;
    const selectedDate = formData.date.split("-").reverse().join("-"); // Convert DD-MM-YYYY to YYYY-MM-DD
    const today = getTodaysDate();
    return selectedDate < today;
  };

  return (
    <div>
      {/* Title Input */}
      <input
        type="text"
        name="title"
        placeholder="Add Title"
        className="w-full border-b border-gray-300 py-2 mb-4 focus:outline-none"
        value={formData.title || ""}
        onChange={handleInputChange}
        disabled={isDateInPast()}
      />

      {/* Date Input */}
      <div className="flex items-center mb-4">
        <input
          type="date"
          name="date"
          className={`border-b border-gray-300 py-2 focus:outline-none ${
            isDateInPast() ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          value={
            formData.date ? formData.date.split("-").reverse().join("-") : ""
          }
          onChange={handleDateChange}
          min={getTodaysDate()}
          disabled={isDateInPast()}
        />
        {isDateInPast() && (
          <span className="ml-2 text-sm text-red-500">
            Past dates are not allowed
          </span>
        )}
      </div>

      {/* Category Dropdown */}
      <div
        className="mb-4"
        onMouseEnter={clearCategoryAutoClose}
        onMouseLeave={startCategoryAutoClose}
      >
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            className={`w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between ${
              isDateInPast() ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={() => {
              if (isDateInPast()) return;
              clearCategoryAutoClose();
              setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
            }}
            disabled={isDateInPast()}
          >
            <div className="flex items-center">
              {formData.category && (
                <div className="mr-2">
                  {React.createElement(getSelectedCategoryIcon(), {
                    size: 16,
                    style: { color: getSelectedCategoryColor() },
                  })}
                </div>
              )}
              <span
                className={formData.category ? "text-black" : "text-gray-500"}
              >
                {selectedCategoryLabel}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isCategoryDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCategoryDropdownOpen && !isDateInPast() && (
            <div
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
              onMouseEnter={clearCategoryAutoClose}
              onMouseLeave={startCategoryAutoClose}
            >
              <div className="max-h-32 overflow-y-auto">
                {categoryOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 flex items-center ${
                        formData.category === option.value
                          ? "bg-blue-50 text-[#058CBF]"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleCategorySelect(option.value)}
                    >
                      <IconComponent
                        size={16}
                        className="mr-2"
                        style={{ color: option.color }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Dropdown */}
      <div
        className="mb-6"
        onMouseEnter={clearTimeAutoClose}
        onMouseLeave={startTimeAutoClose}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
        </label>
        <div className="relative">
          <button
            type="button"
            className={`w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between ${
              isDateInPast() ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={() => {
              if (isDateInPast()) return;
              clearTimeAutoClose();
              setIsTimeDropdownOpen(!isTimeDropdownOpen);
            }}
            disabled={isDateInPast()}
          >
            <span className={formData.time ? "text-black" : "text-gray-500"}>
              {selectedTimeLabel}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isTimeDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isTimeDropdownOpen && !isDateInPast() && (
            <div
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
              onMouseEnter={clearTimeAutoClose}
              onMouseLeave={startTimeAutoClose}
            >
              <div className="max-h-32 overflow-y-auto">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                      formData.time === option.value
                        ? "bg-blue-50 text-[#058CBF]"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleTimeSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Repeat After 15 Minutes Toggle */}
      <div className="flex items-center mt-4 mb-6">
        <span className="text-gray-700 mr-3">Repeat after 15 minutes:</span>
        <label
          htmlFor="repeat-after-15"
          className={`relative inline-flex items-center cursor-pointer ${
            isDateInPast() ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <input
            id="repeat-after-15"
            type="checkbox"
            className="sr-only peer"
            checked={formData.repeatAfter15Min || false}
            onChange={(e) =>
              !isDateInPast() &&
              handleInputChange({
                target: {
                  name: "repeatAfter15Min",
                  value: e.target.checked,
                },
              })
            }
            disabled={isDateInPast()}
          />
          <div className="w-11 h-6 bg-[#ced9de] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#e2e9eb] rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#058CBF]"></div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`py-2 px-6 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
            isDateInPast()
              ? "bg-gray-400 cursor-not-allowed hover:scale-100"
              : "hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-30"
          }`}
          style={{
            backgroundColor: isDateInPast()
              ? "#9ca3af"
              : getSelectedCategoryColor(),
            boxShadow: isDateInPast()
              ? "none"
              : `0 4px 15px ${getSelectedCategoryColor()}30`,
            focusRingColor: isDateInPast()
              ? "#9ca3af"
              : getSelectedCategoryColor(),
          }}
          onClick={onSubmit}
          disabled={isDateInPast()}
        >
          <div className="flex items-center justify-center">
            {!isDateInPast() && formData.category && (
              <div className="mr-2">
                {React.createElement(getSelectedCategoryIcon(), {
                  size: 18,
                  color: "white",
                })}
              </div>
            )}
            <span>
              {isDateInPast() ? "Cannot Create Past Event" : "Create Event"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EventForm;
