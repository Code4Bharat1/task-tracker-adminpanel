import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import PersonalCalendar from "@/components/personalcalendar/personalcalendar";

import React from "react";

function page() {
  return (
    <div className="min-h-screen md:flex bg-white">
      {/* Desktop Sidebar Section (visible on md+) */}
      <div className="md:w-1/6 ">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        {/* Desktop Navbar (hidden on mobile) */}
        <Navbar />
        <div>
          <PersonalCalendar />
        </div>
      </div>
    </div>
  );
}

export default page;
