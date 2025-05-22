"use client";
import { useState, useRef, useEffect } from "react";
import {
  FaTrashAlt,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaFilter,
  FaSearch,
  FaImage,
  FaFilePdf,
  FaClock,
  FaTag,
  FaChevronDown,
  FaPlus,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";

// Mock data for demonstration
const DEPARTMENTS = [
  { id: "all", name: "All Employees", count: 245 },
  { id: "hr", name: "Human Resources", count: 12 },
  { id: "management", name: "Management", count: 8 },
  { id: "engineering", name: "Engineering", count: 85 },
  { id: "sales", name: "Sales", count: 45 },
  { id: "marketing", name: "Marketing", count: 23 },
  { id: "finance", name: "Finance", count: 18 },
  { id: "operations", name: "Operations", count: 32 },
  { id: "support", name: "Customer Support", count: 22 }
];

const POST_TEMPLATES = [
  { id: "announcement", name: "Announcement", icon: "📢" },
  { id: "meeting", name: "Meeting", icon: "🤝" },
  { id: "training", name: "Training", icon: "📚" },
  { id: "policy", name: "Policy Update", icon: "📋" },
  { id: "celebration", name: "Celebration", icon: "🎉" },
  { id: "reminder", name: "Reminder", icon: "⏰" }
];

const PRIORITY_LEVELS = [
  { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
  { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { id: "high", name: "High", color: "bg-red-100 text-red-800" },
  { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-900" }
];

// Enhanced Toast Component
const Toast = ({ message, type = "success", show, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-[9999] transition-all duration-500 transform ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
  >
    <div className={`flex items-center px-6 py-4 rounded-lg shadow-lg ${type === "success" ? "bg-green-500" :
        type === "error" ? "bg-red-500" :
          type === "warning" ? "bg-yellow-500" : "bg-blue-500"
      } text-white`}>
      {type === "success" && <FaCheckCircle className="mr-2" />}
      {type === "error" && <FaExclamationCircle className="mr-2" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-75">
        <FaTimes size={14} />
      </button>
    </div>
  </div>
);

// Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionId) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt.id === selected[0]);
      return option?.name || "";
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-gray-700">{getDisplayText()}</span>
        <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label key={option.id} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-gray-900">{option.name}</span>
                <span className="ml-2 text-sm text-gray-500">({option.count})</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [scheduleData, setScheduleData] = useState({
    type: "immediate",
    datetime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurring: false,
    recurringType: "daily",
    endDate: "",
    ...initialData
  });

  const handleSave = () => {
    onSave(scheduleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When to post
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="immediate"
                  checked={scheduleData.type === "immediate"}
                  onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                  className="mr-2"
                />
                Post immediately
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleData.type === "scheduled"}
                  onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                  className="mr-2"
                />
                Schedule for later
              </label>
            </div>
          </div>

          {scheduleData.type === "scheduled" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleData.datetime}
                  onChange={(e) => setScheduleData({ ...scheduleData, datetime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={scheduleData.recurring}
                  onChange={(e) => setScheduleData({ ...scheduleData, recurring: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Make this a recurring post
                </label>
              </div>

              {scheduleData.recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat
                  </label>
                  <select
                    value={scheduleData.recurringType}
                    onChange={(e) => setScheduleData({ ...scheduleData, recurringType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Schedule
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function EnhancedPostUpload() {
  // State management
  const [activeTab, setActiveTab] = useState("create");
  const [postType, setPostType] = useState("announcement");
  const [priority, setPriority] = useState("medium");
  const [selectedDepartments, setSelectedDepartments] = useState(["all"]);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [file, setFile] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({ type: "immediate" });
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! 🌅";
    if (hour < 17) return "Good Afternoon! ☀️";
    return "Good Evening! 🌙";
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit", "error");
      return;
    }

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;

      if (selectedFile.type.startsWith("image/")) {
        setFileType("image");
      } else if (selectedFile.type === "application/pdf") {
        setFileType("pdf");
      } else {
        showToast("Unsupported file type. Please upload an image or PDF.", "error");
        return;
      }

      setFilePreview(base64data);
    };

    reader.readAsDataURL(selectedFile);
  };

  // Handle tag management
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Validate form
  const validateForm = () => {
    if (!message.trim()) return "Please enter a message";
    if (!note.trim()) return "Please enter a note";
    if (selectedDepartments.length === 0) return "Please select at least one department";
    if (scheduleSettings.type === "scheduled" && !scheduleSettings.datetime) {
      return "Please set a schedule date and time";
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form
      setMessage("");
      setNote("");
      setFile(null);
      setFilePreview(null);
      setFileType(null);
      setTags([]);
      setSelectedDepartments(["all"]);
      setScheduleSettings({ type: "immediate" });

      showToast("Post created successfully!", "success");
    } catch (err) {
      showToast("Failed to create post. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate post preview data
  const getPreviewData = () => {
    const totalEmployees = selectedDepartments.includes("all")
      ? DEPARTMENTS[0].count
      : selectedDepartments.reduce((sum, deptId) => {
        const dept = DEPARTMENTS.find(d => d.id === deptId);
        return sum + (dept?.count || 0);
      }, 0);

    return {
      message,
      note,
      type: postType,
      priority,
      departments: selectedDepartments,
      totalEmployees,
      tags,
      schedule: scheduleSettings,
      file: file?.name
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
            <p className="text-gray-600 mt-1">{getGreeting()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "create", name: "Create Post", icon: FaPlus },
              { id: "preview", name: "Preview", icon: FaEye },
              { id: "drafts", name: "Drafts", icon: FaEdit },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Type Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {POST_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setPostType(template.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${postType === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <div className="text-sm font-medium">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message and Note */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your message here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note *
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add additional notes..."
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>

                {!filePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-4xl text-gray-400 mb-4">📎</div>
                    <p className="text-lg font-medium text-gray-700">Click to upload files</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Images and PDFs up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {fileType === "image" ? (
                          <FaImage className="text-blue-500 mr-3" />
                        ) : (
                          <FaFilePdf className="text-red-500 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{file?.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                          setFileType(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    {fileType === "image" && (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <FaTag className="mr-1" size={12} />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add a tag..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Priority */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Level</h3>
                <div className="space-y-2">
                  {PRIORITY_LEVELS.map((level) => (
                    <label key={level.id} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={level.id}
                        checked={priority === level.id}
                        onChange={(e) => setPriority(e.target.value)}
                        className="mr-3"
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                        {level.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <FaUsers className="inline mr-2" />
                  Target Audience
                </h3>
                <MultiSelectDropdown
                  options={DEPARTMENTS}
                  selected={selectedDepartments}
                  onChange={setSelectedDepartments}
                  placeholder="Select departments"
                />
                <div className="mt-3 text-sm text-gray-600">
                  {selectedDepartments.includes("all") ? (
                    <span>All {DEPARTMENTS[0].count} employees</span>
                  ) : (
                    <span>
                      {selectedDepartments.reduce((sum, deptId) => {
                        const dept = DEPARTMENTS.find(d => d.id === deptId);
                        return sum + (dept?.count || 0);
                      }, 0)} employees selected
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <FaClock className="inline mr-2" />
                  Schedule
                </h3>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
                >
                  {scheduleSettings.type === "immediate" ? (
                    <span className="flex items-center">
                      <FaClock className="mr-2 text-green-500" />
                      Post immediately
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Scheduled for {new Date(scheduleSettings.datetime).toLocaleString()}
                    </span>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isLoading ? "Creating Post..." : "Create Post"}
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Preview Post
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Post Preview</h3>

              {message || note ? (
                <div className="space-y-6">
                  {/* Post Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        A
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Admin</p>
                        <p className="text-sm text-gray-500">
                          {scheduleSettings.type === "immediate" ? "Now" : new Date(scheduleSettings.datetime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_LEVELS.find(p => p.id === priority)?.color
                      }`}>
                      {PRIORITY_LEVELS.find(p => p.id === priority)?.name}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{message}</h4>
                    <p className="text-gray-700">{note}</p>
                  </div>

                  {/* File Preview */}
                  {filePreview && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      {fileType === "image" ? (
                        <img
                          src={filePreview}
                          alt="Attached image"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <FaFilePdf className="text-red-500 mr-3 text-xl" />
                          <span className="font-medium text-gray-900">{file?.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <FaTag className="mr-1" size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Target Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Distribution</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Post Type:</span>
                        <span className="font-medium">
                          {POST_TEMPLATES.find(t => t.id === postType)?.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Target Audience:</span>
                        <span className="font-medium">
                          {selectedDepartments.includes("all")
                            ? "All Employees"
                            : `${selectedDepartments.length} Department${selectedDepartments.length > 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Recipients:</span>
                        <span className="font-medium">
                          {selectedDepartments.includes("all")
                            ? DEPARTMENTS[0].count
                            : selectedDepartments.reduce((sum, deptId) => {
                              const dept = DEPARTMENTS.find(d => d.id === deptId);
                              return sum + (dept?.count || 0);
                            }, 0)
                          } employees
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>Start creating your post to see the preview</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "drafts" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Draft Posts</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search drafts..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FaFilter className="mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Mock Draft Posts */}
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "Monthly Team Meeting Announcement",
                    type: "meeting",
                    lastEdited: "2 hours ago",
                    departments: ["all"],
                    priority: "medium"
                  },
                  {
                    id: 2,
                    title: "New HR Policy Update",
                    type: "policy",
                    lastEdited: "1 day ago",
                    departments: ["hr", "management"],
                    priority: "high"
                  },
                  {
                    id: 3,
                    title: "Quarterly Training Schedule",
                    type: "training",
                    lastEdited: "3 days ago",
                    departments: ["engineering", "sales"],
                    priority: "low"
                  }
                ].map((draft) => (
                  <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{draft.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_LEVELS.find(p => p.id === draft.priority)?.color
                            }`}>
                            {PRIORITY_LEVELS.find(p => p.id === draft.priority)?.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {POST_TEMPLATES.find(t => t.id === draft.type)?.icon} {POST_TEMPLATES.find(t => t.id === draft.type)?.name}
                          </span>
                          <span>Last edited {draft.lastEdited}</span>
                          <span>
                            {draft.departments.includes("all")
                              ? "All employees"
                              : `${draft.departments.length} department${draft.departments.length > 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <FaEdit />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              <div className="text-center py-12 text-gray-500 border-t mt-8">
                <div className="text-4xl mb-4">📄</div>
                <p>No drafts found</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={setScheduleSettings}
        initialData={scheduleSettings}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <p>{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Creating your post...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Employees:</span>
            <span className="font-medium">{DEPARTMENTS[0].count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Recipients:</span>
            <span className="font-medium text-blue-600">
              {selectedDepartments.includes("all")
                ? DEPARTMENTS[0].count
                : selectedDepartments.reduce((sum, deptId) => {
                  const dept = DEPARTMENTS.find(d => d.id === deptId);
                  return sum + (dept?.count || 0);
                }, 0)
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Message Length:</span>
            <span className={`font-medium ${message.length > 500 ? 'text-red-600' : 'text-green-600'}`}>
              {message.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4">
        <button className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors">
          <span className="text-xs font-mono">?</span>
        </button>
      </div>
    </div>
  );
}