
import React from 'react'


import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import CalendarPage from '@/components/calendar/calendar';




export default function Home() {
  return (

    <div className="min-h-screen md:flex bg-white">
    {/* Sidebar */}
    <div className="md:w-1/6">
    <Sidebar/>
    </div>
      


  {/* Main Content */}
  <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
       <Navbar/>

        {/* Page Content */}
        <main className="px-6 py-6">
  <CalendarPage/>
</main>
     
    
</div>
    </div>
  );
}


