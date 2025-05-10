import Addteammember from '@/components/addteammember/addteammember'
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'
import React from 'react'

export default function page() {
  return (
    <div className="min-h-screen md:flex bg-white">
    {/* Desktop Sidebar Section (visible on md+) */}
    <div className="md:w-1/6">
    <Sidebar/>
    </div>

     <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
                  <Navbar/>
    <div>
      <Addteammember/>
    </div>
    </div>
    </div>
  )
}
