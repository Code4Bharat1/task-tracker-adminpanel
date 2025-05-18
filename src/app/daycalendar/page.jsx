

import Categories from '@/components/calendardropdwon/categerious';
import CalendarPage from '@/components/calendardropdwon/daycalendar';
import ToDo from '@/components/calendardropdwon/todo';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';


import React from 'react';

export default function Home() {
  return (
    <div>
      {/* Sidebar - Fixed */}
      <div className="w-1/6 fixed top-0 bottom-0 left-0 bg-gray-100">
        <Sidebar />
      </div>

      {/* Navbar - Fixed */}
      <div className="fixed top-0 right-0 w-5/6 ml-[16.6667%] z-10">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-2 gap-4 md:gap-50 mt-[60px] ml-[16.6667%] h-[calc(100vh-60px)] overflow-x-hidden overflow-y-auto p-4 bg-white">
        <CalendarPage />

        <Categories />

        <div className="col-span-2">
          <ToDo />
        </div>
      </div>
    </div>
  );
}
