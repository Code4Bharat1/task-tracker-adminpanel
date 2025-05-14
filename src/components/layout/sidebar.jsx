'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const menuItems = [
    { label: 'Dashboard', img: '/layout/dashboard.png', href: '/dashboard' },
    { label: 'Assign Task', img: '/layout/assigntask.png', href: '/assigntask' },
    { label: 'Attendance', img: '/layout/attendance.png', href: '/attendance' },
    { label: 'Add TimeSheet', img: '/layout/timesheet.png', href: '/timesheet' },
    { label: 'Calendar', img: '/layout/calendar.png', href: '/calendar' },
    { label: 'Document', img: '/layout/document.png', href: '/document' },
    { label: 'Leave', img: '/layout/leave.png', href: '/leavetable' },
    { label: 'Salary', img: '/layout/salary.png', href: '/salary' },
    { label: 'Expense', img: '/layout/salary.png', href: '/salary' },
    { label: 'Performance Board', img: '/layout/salary.png', href: '/salary' },
    { label: 'Company Policies', img: '/layout/company.png', href: '/companypolicy' },
    { label: 'Logout', img: '/layout/logout.png', href: '/' }
]

export default function Sidebar() {
    return (
        <div className="fixed min-h-screen w-1/6 bg-gradient-to-b from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] text-white flex flex-col items-center py-6">

            {/* Logo */}
            <div className="flex flex-col justify-center items-center mb-3">
                <Image
                    src="/layout/profile.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className="object-contain"
                />
                <p className='text-center'>Prashant Patil</p>
                <p className='text-center'>prashantpatil@gmail.com</p>
            </div>

            {/* Menu */}
            <nav className="flex flex-col gap-2 w-full px-4">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="flex items-center gap-4 px-3 py-2 hover:bg-white hover:text-sky-700 rounded-lg transition duration-200"
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Image src={item.img} alt={item.label} width={24} height={24} />
                        </div>
                        <span className="text-md font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
