"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  Clock,
  FileText,
  FileCheck,
  Coins,
  Receipt,
  TrendingUp,
  ShieldCheck,
  LogOut,
  MailCheck,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Assign Task", icon: ClipboardCheck, href: "/assigntask" },
  { label: "Attendance", icon: CalendarDays, href: "/attendance" },
  { label: "Add TimeSheet", icon: Clock, href: "/timesheet" },
  { label: "Calendar", icon: FileText, href: "/calendar" },
  { label: "Document", icon: FileCheck, href: "/document" },
  { label: "Leave", icon: MailCheck, href: "/leavetable" },
  { label: "Salary", icon: Coins, href: "/salary" },
  { label: "Expense", icon: Receipt, href: "/expenseRequest" },
  { label: "Performance Board", icon: TrendingUp, href: "/performanceboard" },
  { label: "Company Policies", icon: ShieldCheck, href: "/companypolicy" },
  { label: "Logout", icon: LogOut, href: "/" },
];

export default function Sidebar() {
  return (
    <div className="fixed min-h-screen w-1/6 bg-gradient-to-b from-[#018ABE] from-15% via-[#65B7D4] to-[#E0E2E3] text-white flex flex-col items-center py-6">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 w-full mb-6">
        <Image
          src="/signup/tasklogo.png"
          alt="Logo"
          width={100}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Scrollable Menu */}
      <nav
        className="
          flex-1
          overflow-y-auto
          w-full
          px-2
          scrollbar-thin
          scrollbar-thumb-white
          scrollbar-track-[#018ABE]
        "
      >
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="
              flex items-center gap-3
              px-3 py-2
              hover:bg-white hover:text-sky-700
              rounded-lg
              transition duration-200
            "
          >
            {/* Icon: shrinks on small screens */}
            <item.icon className="w-5 h-5 max-sm:w-4 max-sm:h-4" />

            {/* Label: shrinks on small screens */}
            <span className="font-medium text-base max-sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
