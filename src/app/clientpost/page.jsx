
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'
import ClientPostHistory from '@/components/postupload/clientpost'
import React from 'react'



export default function AddDocument() {
  return (
     <div className="min-h-screen md:flex bg-white">
        {/* Desktop Sidebar Section (visible on md+) */}
        <div className="md:w-1/6">
        <Sidebar/>
        </div>
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
         <Navbar/>
          <div>
          
<ClientPostHistory/>
    </div>
    </div>
    </div>
  )
}
