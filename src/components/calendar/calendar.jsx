"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiUsers,
  FiX
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Calendar constants
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Category definitions with colors and priorities
const categoryColors = {
  "Daily Task": "bg-blue-600",
  "Meeting": "bg-red-500",
  "Reminder": "bg-green-500",
  "Deadline": "bg-purple-600",
  "Leaves": "bg-yellow-400",
  "Other": "bg-orange-400",
};

// Category hover and active states
const categoryHoverColors = {
  "Daily Task": "hover:bg-blue-700",
  "Meeting": "hover:bg-red-600",
  "Reminder": "hover:bg-green-600",
  "Deadline": "hover:bg-purple-700",
  "Leaves": "hover:bg-yellow-500",
  "Other": "hover:bg-orange-500",
};

const categoryTextColors = {
  "Daily Task": "text-blue-600",
  "Meeting": "text-red-500",
  "Reminder": "text-green-500",
  "Deadline": "text-purple-600",
  "Leaves": "text-yellow-600",
  "Other": "text-orange-500",
};

const priorityOrder = [
  "Daily Task",
  "Meeting",
  "Reminder",
  "Deadline",
  "Leaves",
  "Other",
];

export default function CalendarPage() {
  const router = useRouter();
  const initialDate = new Date(); // Current month
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState(formatDateKey(new Date()));
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("Task");
  const [eventDates, setEventDates] = useState({});
  const [hoverDay, setHoverDay] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateEvent, setAnimateEvent] = useState(null);

  // IMPORTANT: Hard-coded calType set to "Monthly"
  const calType = "Monthly";

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(new Date());
  const [taskTime, setTaskTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Daily Task");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participant, setParticipant] = useState("");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [remindBefore, setRemindBefore] = useState(15);

  // Refs
  const dropdownRef = useRef(null);
  const dayModalRef = useRef(null);
  const modalRef = useRef(null);

  // Generate times array
  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const ampm = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  });

  // Load persisted events from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
          setEventDates(JSON.parse(savedEvents));
        }
      } catch (e) {
        console.error('Could not load from localStorage:', e);
      }
    }
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Close time dropdowns when clicking outside
      if (!event.target.closest(".time-dropdown")) {
        setIsTimeDropdownOpen(false);
        setIsStartTimeOpen(false);
        setIsEndTimeOpen(false);
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle escape key press to close modals
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        if (showDayModal) setShowDayModal(false);
        if (showModal) {
          setShowModal(false);
          resetForm();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showDayModal, showModal]);

  // Add auto-refresh for calendar data and real-time updates
  useEffect(() => {
    // Fetch data initially
    fetchCalendarData();
    
    // Set up interval for periodic refresh (every 2 minutes)
    const refreshInterval = setInterval(() => {
      fetchCalendarData(false); // Pass false to not show loading indicator on auto-refresh
    }, 120000); // 2 minutes
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [currentDate]);

  // Update calendar data when a new event is added
  useEffect(() => {
    // Listen for external calendar changes
    const handleExternalChanges = () => {
      fetchCalendarData(false);
    };
    
    // Set up event listener
    window.addEventListener('calendar-updated', handleExternalChanges);
    
    // Clean up
    return () => {
      window.removeEventListener('calendar-updated', handleExternalChanges);
    };
  }, []);

  // Helper function to format date as YYYY-MM-DD
  function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  }

  // Function to generate dynamic mock data for current month
  const generateMockData = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Event templates by category
    const eventTemplates = {
      "Daily Task": [
        { title: "Code Review", description: "Review recent pull requests" },
        { title: "Team Standup", description: "Daily team sync" },
        { title: "Bug Fixes", description: "Address reported bugs" },
        { title: "Documentation", description: "Update project documentation" },
        { title: "Gym Session", description: "Weekly workout" }
      ],
      "Meeting": [
        { title: "Project Planning", description: "Discuss upcoming milestones" },
        { title: "Client Meeting", description: "Present progress update" },
        { title: "Team Sync", description: "Weekly team coordination" },
        { title: "1:1 with Manager", description: "Bi-weekly check-in" },
        { title: "Budget Planning", description: "Quarterly budget review" }
      ],
      "Reminder": [
        { title: "Doctor's Appointment", description: "Annual checkup" },
        { title: "Bill Payment", description: "Monthly utilities payment" },
        { title: "Birthday", description: "Team member's birthday" },
        { title: "Subscription Renewal", description: "Renew software subscription" },
        { title: "Follow-up", description: "Follow up on client request" }
      ],
      "Deadline": [
        { title: "Project Submission", description: "Final project delivery" },
        { title: "Client Proposal", description: "Submit proposal for review" },
        { title: "Report Due", description: "Submit monthly report" },
        { title: "Feature Release", description: "Deploy new features" },
        { title: "Code Freeze", description: "Feature lock for testing" }
      ],
      "Leaves": [
        { title: "Vacation", description: "Annual leave" },
        { title: "Sick Leave", description: "Out of office" },
        { title: "Personal Day", description: "Taking time off" },
        { title: "Conference", description: "Attending industry event" },
        { title: "Training", description: "Professional development course" }
      ],
      "Other": [
        { title: "Networking Event", description: "Industry meetup" },
        { title: "Webinar", description: "Educational online session" },
        { title: "Team Lunch", description: "Monthly team bonding" },
        { title: "System Maintenance", description: "Scheduled downtime" },
        { title: "Brainstorming", description: "Creative idea generation" }
      ]
    };
    
    // Generate participants
    const participants = [
      "alice@example.com",
      "bob@example.com",
      "carol@example.com",
      "dave@example.com",
      "eve@example.com",
      "frank@example.com",
      "grace@example.com",
      "heidi@example.com",
      "user1@example.com",
      "user2@example.com"
    ];
    
    // Generate some events for the month
    let events = [];
    
    // Calculate how many events to generate (more realistic distribution)
    const totalEvents = Math.floor(Math.random() * 15) + 10; // 10-25 events per month
    
    for (let i = 0; i < totalEvents; i++) {
      // Pick a random day in the month
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      // Pick a random category
      const categoryIndex = Math.floor(Math.random() * priorityOrder.length);
      const category = priorityOrder[categoryIndex];
      
      // Pick a random template
      const templates = eventTemplates[category];
      const templateIndex = Math.floor(Math.random() * templates.length);
      const template = templates[templateIndex];
      
      // Generate random time
      const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const ampm = hour < 12 ? "AM" : "PM";
      const hour12 = hour % 12 || 12;
      const time = `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
      
      // For meetings, generate start and end times
      let startTime, endTime;
      if (category === "Meeting") {
        startTime = time;
        // End time is 30-90 minutes later
        const durationHours = Math.floor(Math.random() * 2) + (minute >= 30 ? 1 : 0);
        const durationMinutes = [0, 30][Math.floor(Math.random() * 2)];
        const endHour = (hour + durationHours) % 24;
        const endMinute = (minute + durationMinutes) % 60;
        const endAmPm = endHour < 12 ? "AM" : "PM";
        const endHour12 = endHour % 12 || 12;
        endTime = `${endHour12}:${String(endMinute).padStart(2, "0")} ${endAmPm}`;
        
        // Random subset of participants (1-3)
        const numParticipants = Math.floor(Math.random() * 3) + 1;
        const meetingParticipants = [];
        for (let j = 0; j < numParticipants; j++) {
          const participantIndex = Math.floor(Math.random() * participants.length);
          if (!meetingParticipants.includes(participants[participantIndex])) {
            meetingParticipants.push(participants[participantIndex]);
          }
        }
        
        events.push({
          id: Date.now() + i,
          title: template.title,
          description: template.description,
          date: dateStr,
          type: category,
          category: category,
          startTime,
          endTime,
          participants: meetingParticipants,
          calType: "Monthly" // <-- Adding calType here
        });
      } else {
        events.push({
          id: Date.now() + i,
          title: template.title,
          description: template.description,
          date: dateStr,
          type: category,
          category: category,
          time: category === "Leaves" ? "All day" : time,
          calType: "Monthly" // <-- Adding calType here
        });
      }
    }
    
    return events;
  };

  // Fetch calendar data from the API
  const fetchCalendarData = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
    
    try {
      // In a real application, you would fetch from the API:
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/admin/calendar/user/${calType}`, {
        credentials: "include",
        method: "GET",
      });
      
      console.log(res);

      if (!res.ok) {
        throw new Error(`Failed to fetch calendar data: ${res.status}`);
      }
      
      const data = await res.json();
      processCalendarData(data);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      
      // Use dynamic mock data instead of static data
      const dynamicMockData = generateMockData();
      processCalendarData(dynamicMockData);
      
      // Only show error toast in production
      if (process.env.NODE_ENV === 'production') {
        toast.error("Failed to load calendar data");
      } else {
        toast.info("Using simulated calendar data", {
          icon: <FiInfo className="text-blue-500" />
        });
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  // Process calendar data into the format we need
  const processCalendarData = (data) => {
    const groupedEvents = data.reduce((acc, item) => {
      const eventDate = new Date(item.date);
      const dateKey = formatDateKey(eventDate);

      console.log(data);
      const eventData = {
        id: item.id,
        title: item.title,
        description: item.description,
        participants: item.participants || [],
        time: item.time || null,
        startTime: item.startTime || null,
        endTime: item.endTime || null,
        category: item.category || "", // Support both category and type fields
        calType: item.calType || "Monthly" // <-- Ensure calType is preserved
      };

      return {
        ...acc,
        [dateKey]: [...(acc[dateKey] || []), eventData]
      };
    }, {});

    setEventDates(groupedEvents);
  };

  // Handle changing the month
  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Handle date click - show events for the day
  const handleDateClick = (dateKey, events, event) => {
    setSelectedDate(dateKey);
    setSelectedDateEvents(events);
    setShowDayModal(true);

    // Calculate position for day modal (for better user experience)
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      // Position the modal near the clicked day but ensure it's visible
      setModalPosition({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
      });
    }
  };

  // Handle day hover
  const handleDayHover = (dateKey) => {
    setHoverDay(dateKey);
  };

  // Format date for display
  const formatDateForDisplay = (dateKey) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generic event creation handler to reduce redundancy
  const createCalendarEntry = async (entryData) => {
    setIsSubmitting(true);
    
    try {
      // IMPORTANT: Ensure calType is always included
      entryData.calType = calType;
      
      // In a real application, you would post to the API:
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/admin/calendar`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${entryData.type.toLowerCase()}`);
      }

      toast.success(`${entryData.type} created successfully!`);

      // Refresh calendar data to show the new entry
      await fetchCalendarData();

      // Reset form and close modal
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error(`Error creating ${entryData.type.toLowerCase()}:`, error);
      toast.error(`Failed to create ${entryData.type.toLowerCase()}`);
      
      // For development: Simulate successful creation with mock data
      simulateEntryCreation(entryData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for task creation
  const handleTaskCreate = async () => {
    if (!taskTitle.trim() || !taskTime) {
      toast.error("Please fill all required fields!", {
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }

    const taskData = {
      type: "Task",
      calType: calType, // IMPORTANT: Use the hard-coded calType
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      time: taskTime,
      category: "Daily Task"
    };

    createCalendarEntry(taskData);
  };

  // Handler for event creation
  const handleEventCreate = async () => {
    if (!taskTitle.trim() || !startTime) {
      toast.error("Please fill all required fields!", {
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }

    const eventData = {
      type: "Event",
      calType: calType, // IMPORTANT: Use the hard-coded calType
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      time: startTime,
      category: selectedCategory,
      reminder: true,
      remindBefore: parseInt(remindBefore, 10)
    };

    createCalendarEntry(eventData);
  };

  // Handler for meeting creation
  const handleMeetingCreate = async () => {
    if (!taskTitle.trim() || !startTime || !endTime || !participant) {
      toast.error("Please fill all required fields!", {
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }

    const meetingData = {
      type: "Meeting",
      calType: calType, // IMPORTANT: Use the hard-coded calType
      category: "Meeting",
      title: taskTitle,
      description: taskDescription,
      date: formatDateKey(taskDate),
      startTime,
      endTime,
      participants: [participant],
      reminder: false,
      remindBefore: 15,
    };

    createCalendarEntry(meetingData);
  };

  // Simulate entry creation for development (consolidated function)
  const simulateEntryCreation = (entryData) => {
    // Generate a unique ID
    const newEntryId = Date.now();
    
    // Create the event object - ensure it always has calType
    const newEvent = {
      id: newEntryId,
      title: entryData.title,
      description: entryData.description,
      time: entryData.time,
      startTime: entryData.startTime,
      endTime: entryData.endTime,
      participants: entryData.participants || [],
      category: entryData.category,
      date: entryData.date,
      reminder: entryData.reminder,
      remindBefore: entryData.remindBefore,
      calType: calType // IMPORTANT: Always include calType
    };

    // Update both state and trigger refresh
    const dateKey = formatDateKey(taskDate);
    
    // Update local state for immediate feedback
    setEventDates(prev => {
      const updatedDates = {
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent]
      };
      
      // Store in localStorage for persistence during development
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('calendarEvents', JSON.stringify(updatedDates));
        } catch (e) {
          console.error('Could not save to localStorage:', e);
        }
      }
      
      return updatedDates;
    });

    // Set animateEvent to trigger animation on the newly created event
    setAnimateEvent(newEntryId);
    setTimeout(() => setAnimateEvent(null), 2000);

    // Simulate notifications based on entry type
    if (entryData.type === "Meeting" && entryData.participants?.length > 0) {
      setTimeout(() => {
        toast.info(`Meeting invites sent to ${entryData.participants.length} participant(s)`, {
          autoClose: 3000
        });
      }, 1500);
    }
    
    if (entryData.type === "Event" && entryData.reminder) {
      const demoDelay = Math.min(entryData.remindBefore * 50, 10000); // Max 10 seconds
      setTimeout(() => {
        toast.info(`Reminder: ${entryData.title} is coming up!`);
      }, demoDelay);
    }

    toast.success(`${entryData.type} created successfully!`, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    resetForm();
    setShowModal(false);
  };

  // Reset all form fields
  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDate(new Date());
    setTaskTime("");
    setSelectedCategory("Daily Task");
    setStartTime("");
    setEndTime("");
    setParticipant("");
    setRemindBefore(15);
  };

  // Calculate calendar grid parameters with current date
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;
  
  // Function to check for upcoming events and send notifications
  const checkUpcomingEvents = () => {
    const now = new Date();
    const today = formatDateKey(now);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Get today's events
    const todayEvents = eventDates[today] || [];
    
    // Check each event time
    todayEvents.forEach(event => {
      if (event.time) {
        const [timeStr, ampm] = event.time.split(' ');
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        // Convert to 24-hour format
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        // Calculate minutes until event
        const eventMinutes = hour * 60 + minute;
        const currentMinutes = currentHour * 60 + currentMinute;
        const minutesUntilEvent = eventMinutes - currentMinutes;
        
        // If event is coming up within 30 minutes and hasn't been notified
        if (minutesUntilEvent > 0 && minutesUntilEvent <= 30 && !event.notified) {
          // Mark as notified to prevent duplicate notifications
          event.notified = true;
          
          // Show notification
          toast.info(`Upcoming in ${minutesUntilEvent} minutes: ${event.title}`, {
            autoClose: 5000
          });
        }
      }
    });
  };
  
  // Set up periodic check for upcoming events
  useEffect(() => {
    // Check every 5 minutes
    const checkInterval = setInterval(checkUpcomingEvents, 300000);
    
    // Do an initial check
    checkUpcomingEvents();
    
    return () => clearInterval(checkInterval);
  }, [eventDates, todayKey]);

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold relative">
          My Calendar
          <span className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></span>
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium transition duration-200 ease-in-out hover:bg-gray-50 hover:shadow flex items-center gap-2 shadow-sm"
              aria-label="Select calendar view"
            >
              <span>Month</span>
              <FiChevronDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg z-10 w-40 overflow-hidden border border-gray-100 animate-fadeIn">
                {[
                  { label: "Day", href: "/daycalendar" },
                  { label: "Month", href: "/calendar" },
                  { label: "Year", href: "/yearcalendar" },
                ].map((item) => (
                  <div key={item.label} onClick={() => {
                    setShowDropdown(false);
                    router.push(item.href);
                  }}>
                    <div className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm ${item.label === "Month" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => fetchCalendarData()}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 font-medium px-3.5 py-2.5 rounded-lg hover:bg-gray-200 transition shadow-sm"
            disabled={isLoading}
            title="Refresh calendar data"
          >
            <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
          >
            <FiPlus className="h-5 w-5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md p-5 relative overflow-hidden border border-gray-100">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
              <FiRefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-700 font-medium">Loading calendar...</p>
            </div>
          </div>
        )}
      
        <div className="flex items-center justify-between mb-5">
          <div className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {months[currentDate.getMonth()]} <span className="text-gray-500">{currentDate.getFullYear()}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Previous month"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Next month"
            >
              <FiChevronRight size={22} />
            </button>
          </div>
        </div>

        <div className="mt-2 mb-3">
          <div className="grid grid-cols-7 text-center font-medium text-base mb-2 border-b pb-2">
            {days.map((day, index) => (
              <div key={day} className={`py-2 ${index === 0 ? "text-red-500" : "text-gray-700"}`}>{day}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-start-${i}`} className="aspect-square rounded-lg bg-gray-50 text-sm text-gray-400 flex items-center justify-center"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = eventDates[dateKey] || [];
            const weekday = (firstDay + day - 1) % 7;
            const isSunday = weekday === 0;
            const isToday = dateKey === todayKey;
            const isHovered = dateKey === hoverDay;

            // Group events by category
            const groupedEvents = events.reduce((acc, event) => {
              acc[event.category] = (acc[event.category] || 0) + 1;
              return acc;
            }, {});

            // Sort by priority
            const sortedEvents = Object.entries(groupedEvents)
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.category);
                const bIndex = priorityOrder.indexOf(b.category);
                const aPriority = aIndex === -1 ? Infinity : aIndex;
                const bPriority = bIndex === -1 ? Infinity : bIndex;
                return aPriority - bPriority;
              });

            // Base styling
            let bgClass = "bg-white";
            let dayClass = "text-gray-800";
            
            if (isSunday) {
              dayClass = "text-red-500";
            }
            
            if (isToday) {
              bgClass = "bg-blue-50";
            }
            
            if (isHovered) {
              bgClass = "bg-gray-50";
            }

            return (
              <div
                key={`day-${day}`}
                onClick={(e) => handleDateClick(dateKey, events, e)}
                onMouseEnter={() => handleDayHover(dateKey)}
                onMouseLeave={() => handleDayHover(null)}
                className={`group relative aspect-square flex flex-col justify-start items-start p-1.5 text-sm rounded-lg border ${isToday ? 'border-blue-400' : 'border-gray-100'} ${bgClass} hover:shadow-md hover:border-blue-200 transition-all cursor-pointer overflow-hidden`}
              >
                <div className={`w-full flex justify-between items-center mb-1 ${isToday ? 'pb-1 border-b border-blue-200' : ''}`}>
                  <span className={`text-base font-medium ${dayClass}`}>
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5">
                      {events.length}
                    </span>
                  )}
                </div>

                {/* Event indicators - max 3 visible */}
                <div className="w-full mt-0.5 space-y-1 overflow-hidden flex-grow">
                  {events.slice(0, 3).map((event, idx) => (
                    <div
                      key={`event-${idx}`}
                      className={`w-full px-1.5 py-0.5 rounded text-xs text-white font-medium truncate transition-all ${animateEvent === event.id ? 'animate-pulse bg-opacity-90' : ''} ${categoryColors[event.category] || "bg-gray-400"}`}
                      title={event.title}
                    >
                      {event.time && <span className="inline-block mr-1 opacity-80 text-[10px]">⌚</span>}
                      {event.title}
                    </div>
                  ))}

                  {events.length > 3 && (
                    <div className="text-xs font-medium text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {events.length > 0 && isHovered && (
                  <div className="absolute z-40 -translate-y-2 -translate-x-1/2 left-1/2 bottom-full w-64 bg-white text-gray-700 text-sm shadow-xl rounded-lg p-3 transition-opacity duration-200 pointer-events-none border border-gray-200 animate-fadeIn">
                    <div className="text-lg font-semibold mb-2 text-gray-800 border-b pb-2">
                      {`${months[month]} ${day}, ${year}`}
                    </div>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {events.map((event, index) => (
                        <li key={index} className="border-b pb-2 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-3 h-3 rounded-sm ${categoryColors[event.category] || ""}`}></span>
                            <span className="font-semibold truncate">{event.title}</span>
                          </div>
                          {event.startTime && event.endTime ? (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <FiClock className="inline-block" />
                              {event.startTime} - {event.endTime}
                            </div>
                          ) : event.time && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <FiClock className="inline-block" />
                              {event.time}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Triangle pointer */}
                    <div className="absolute w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45 left-1/2 -bottom-2 -ml-2"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: endOffset }).map((_, i) => (
            <div key={`empty-end-${i}`} className="aspect-square rounded-lg bg-gray-50 text-sm text-gray-400 flex items-center justify-center"></div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-5 rounded-xl shadow-sm mt-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Event Categories</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(categoryColors).map(([category, colorClass]) => (
            <div key={category} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <span className={`w-4 h-4 ${colorClass} rounded-sm shadow-sm`}></span>
              <span className="font-medium text-gray-700">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300" 
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div 
            ref={modalRef}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close modal"
              disabled={isSubmitting}
            >
              <FiX size={20} className="text-gray-500" />
            </button>

            {/* Tabs */}
            <div className="flex justify-around mb-6 border-b">
              {["Task", "Event", "Meeting"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-5 font-medium transition-all duration-200 relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  disabled={isSubmitting}
                >
                  {tab === "Meeting" ? "Schedule Meeting" : tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-5">
              {/* Common Fields */}
              <div className="mb-5">
                <input
                  type="text"
                  placeholder={`Add Title${activeTab === "Meeting" ? ", e.g., Project Stand-up Meeting" : ""}`}
                  className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-gray-800 placeholder:text-gray-500 text-lg font-medium transition-colors duration-200"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Date Picker - Common to all tabs */}
              <div className="mb-5 flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <FiCalendar className="text-blue-500 text-xl" />
                <input
                  type="date"
                  value={taskDate.toISOString().split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTaskDate(new Date(e.target.value))}
                  className="flex-1 bg-transparent focus:outline-none text-gray-700"
                  disabled={isSubmitting}
                />
              </div>

              {/* Task Tab Content */}
              {activeTab === "Task" && (
                <>
                  <div className="mb-5 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between border border-gray-200 transition-colors"
                        disabled={isSubmitting}
                      >
                        <span className={taskTime ? "text-gray-800" : "text-gray-500"}>
                          {taskTime || "Select time"}
                        </span>
                        <FiChevronDown className={`transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isTimeDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200 animate-fadeIn">
                          <div className="sticky top-0 bg-gray-50 p-2 border-b">
                            <input 
                              type="text" 
                              placeholder="Search time..."
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              disabled={isSubmitting}
                            />
                          </div>
                          {times.map((time, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTaskTime(time);
                                setIsTimeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                                taskTime === time ? "bg-blue-100 text-blue-700" : ""
                              }`}
                              disabled={isSubmitting}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Add Description"
                      className="w-full bg-gray-50 px-4 py-3 rounded-lg text-gray-700 placeholder:text-gray-500 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTaskCreate}
                      className={`px-5 py-2.5 ${
                        isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-lg transition font-medium flex items-center gap-2 shadow-sm`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <FiRefreshCw className="animate-spin h-4 w-4" />}
                      Create Task
                    </button>
                  </div>
                </>
              )}

              {/* Event Tab Content */}
              {activeTab === "Event" && (
                <>
                  <div className="mb-5 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Category:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between border border-gray-200 transition-colors"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-4 h-4 rounded-sm ${categoryColors[selectedCategory]}`}></span>
                          <span className="text-gray-800">{selectedCategory}</span>
                        </div>
                        <FiChevronDown className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCategoryOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200 animate-fadeIn">
                          {priorityOrder.filter(category => category !== "Meeting").map((category, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                                selectedCategory === category ? `${categoryTextColors[category]} bg-opacity-10 bg-blue-50 font-medium` : ""
                              }`}
                              disabled={isSubmitting}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-4 h-4 rounded-sm ${categoryColors[category]}`}></span>
                                {category}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between border border-gray-200 transition-colors"
                        disabled={isSubmitting}
                      >
                        <span className={startTime ? "text-gray-800" : "text-gray-500"}>
                          {startTime || "Select time"}
                        </span>
                        <FiChevronDown className={`transition-transform duration-200 ${isStartTimeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isStartTimeOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200 animate-fadeIn">
                          <div className="sticky top-0 bg-gray-50 p-2 border-b">
                            <input 
                              type="text" 
                              placeholder="Search time..."
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              disabled={isSubmitting}
                            />
                          </div>
                          {times.map((time, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setStartTime(time);
                                setIsStartTimeOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                                startTime === time ? "bg-blue-100 text-blue-700" : ""
                              }`}
                              disabled={isSubmitting}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Add Description"
                      className="w-full bg-gray-50 px-4 py-3 rounded-lg text-gray-700 placeholder:text-gray-500 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Remind Before:</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={remindBefore}
                        onChange={(e) => setRemindBefore(e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        min="1"
                        disabled={isSubmitting}
                      />
                      <span className="text-gray-700">minutes</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEventCreate}
                      className={`px-5 py-2.5 ${
                        isSubmitting ? 'bg-gray-400' : `${categoryColors[selectedCategory]} ${categoryHoverColors[selectedCategory]}`
                      } text-white rounded-lg transition font-medium flex items-center gap-2 shadow-sm`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <FiRefreshCw className="animate-spin h-4 w-4" />}
                      Create Event
                    </button>
                  </div>
                </>
              )}

              {/* Meeting Tab Content */}
              {activeTab === "Meeting" && (
                <>
                  <div className="mb-5 relative time-dropdown">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Time:</label>
                    <div className="flex items-center gap-2">
                      {/* Start Time */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
                          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between border border-gray-200 transition-colors"
                          disabled={isSubmitting}
                        >
                          <span className={startTime ? "text-gray-800" : "text-gray-500"}>
                            {startTime || "Start"}
                          </span>
                          <FiChevronDown className={`transition-transform duration-200 ${isStartTimeOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStartTimeOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200 animate-fadeIn">
                            <div className="sticky top-0 bg-gray-50 p-2 border-b">
                              <input 
                                type="text" 
                                placeholder="Search time..."
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                disabled={isSubmitting}
                              />
                            </div>
                            {times.map((time, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setStartTime(time);
                                  setIsStartTimeOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                                  startTime === time ? "bg-blue-100 text-blue-700" : ""
                                }`}
                                disabled={isSubmitting}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-gray-500 font-medium">to</span>

                      {/* End Time */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}
                          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between border border-gray-200 transition-colors"
                          disabled={isSubmitting}
                        >
                          <span className={endTime ? "text-gray-800" : "text-gray-500"}>
                            {endTime || "End"}
                          </span>
                          <FiChevronDown className={`transition-transform duration-200 ${isEndTimeOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isEndTimeOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200 animate-fadeIn">
                            <div className="sticky top-0 bg-gray-50 p-2 border-b">
                              <input 
                                type="text" 
                                placeholder="Search time..."
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                disabled={isSubmitting}
                              />
                            </div>
                            {times.map((time, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setEndTime(time);
                                  setIsEndTimeOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                                  endTime === time ? "bg-blue-100 text-blue-700" : ""
                                }`}
                                disabled={isSubmitting}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Add Participant:</label>
                    <div className="relative">
                      <select
                        value={participant}
                        onChange={(e) => setParticipant(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="" disabled>Select Email Address</option>
                        <option value="alice@example.com">alice@example.com</option>
                        <option value="bob@example.com">bob@example.com</option>
                        <option value="user1@example.com">user1@example.com</option>
                        <option value="user2@example.com">user2@example.com</option>
                      </select>
                      <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-gray-600 font-medium block mb-2">Description:</label>
                    <textarea
                      placeholder="Meeting Description"
                      className="w-full bg-gray-50 px-4 py-3 rounded-lg text-gray-700 placeholder:text-gray-500 border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMeetingCreate}
                      className={`px-5 py-2.5 ${
                        isSubmitting ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                      } text-white rounded-lg transition font-medium flex items-center gap-2 shadow-sm`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <FiRefreshCw className="animate-spin h-4 w-4" />}
                      Schedule Meeting
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          onClick={() => setShowDayModal(false)}
        >
          <div
            ref={dayModalRef}
            className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${Math.min(Math.max(0, modalPosition.left - 400), window.innerWidth - 500)}px, ${Math.min(Math.max(0, modalPosition.top - 200), window.innerHeight - 400)}px)`,
              transition: 'all 0.2s ease-out'
            }}
          >
            <div className="sticky top-0 bg-white p-6 pb-3 border-b z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {formatDateForDisplay(selectedDate)}
                </h2>
                <p className="text-gray-600">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
                </p>
              </div>

              <button
                onClick={() => setShowDayModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Close modal"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="text-gray-500 text-lg mb-2 font-medium">No events scheduled</div>
                  <p className="text-gray-500 mb-6">This day is free from any scheduled events.</p>
                  <button
                    onClick={() => {
                      setShowDayModal(false);
                      setSelectedDate(selectedDate);
                      const date = new Date(selectedDate);
                      setTaskDate(date);
                      setShowModal(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FiPlus />
                      Add Event
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event, index) => (
                    <div
                      key={`event-detail-${index}`}
                      className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer ${animateEvent === event.id ? 'animate-pulse border-blue-300' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`inline-block w-5 h-5 rounded-md mt-1 flex-shrink-0 ${categoryColors[event.category] || "bg-gray-400"}`}></span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Category:</span>
                              <span className={`px-2.5 py-1 rounded-full text-white text-xs ${categoryColors[event.category] || "bg-gray-400"}`}>
                                {event.category}
                              </span>
                            </div>

                            {event.category === "Meeting" ? (
                              <>
                                {event.startTime && event.endTime && (
                                  <div className="flex items-center gap-1">
                                    <FiClock className="text-gray-400" />
                                    <span>{event.startTime} - {event.endTime}</span>
                                  </div>
                                )}
                                {event.participants?.length > 0 && (
                                  <div className="w-full mt-3">
                                    <span className="flex items-center gap-1 font-medium text-gray-700 mb-2">
                                      <FiUsers className="text-gray-500" />
                                      Participants:
                                    </span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {event.participants.map((participant, pIdx) => (
                                        <span
                                          key={`participant-${pIdx}`}
                                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                                        >
                                          {participant}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              event.time && (
                                <div className="flex items-center gap-1">
                                  <FiClock className="text-gray-400" />
                                  <span>{event.time}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white mt-3 py-4 px-6 border-t flex justify-end gap-3 shadow-md">
              <button
                onClick={() => setShowDayModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDayModal(false);
                  setSelectedDate(selectedDate);
                  const date = new Date(selectedDate);
                  setTaskDate(date);
                  setShowModal(true);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <FiPlus />
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add some CSS animations for dynamic effects */}
      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}