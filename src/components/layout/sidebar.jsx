"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  // ClipboardCheck,
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
  UserPlus,
  // Send,
} from "lucide-react";

const menuItems = [
  // { label: "Add Employees", icon: UserPlus, href: "/addemployees" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  // { label: "Assign Task", icon: ClipboardCheck, href: "/assigntask" },
  { label: "View Attendance", icon: CalendarDays, href: "/viewattendance" },
  { label: "View TimeSheet", icon: Clock, href: "/viewtimesheet" },
  { label: "Calendar", icon: FileText, href: "/calendar" },
  { label: "Document", icon: FileCheck, href: "/document" },
  { label: "Leave", icon: MailCheck, href: "/leavetable" },
  { label: "Salary", icon: Coins, href: "/salary" },
  { label: "Expense", icon: Receipt, href: "/expenseRequest" },
  // { label: "Post Upload", icon: Send, href: "/postupload" },
  { label: "Performance Board", icon: TrendingUp, href: "/performanceboard" },
  { label: "Company Policies", icon: ShieldCheck, href: "/companypolicy" },
  { label: "Logout", icon: LogOut, href: "/" },
];

export default function Sidebar() {
  return (
    <div
      className="
        fixed h-screen
        w-[50px] sm:w-[120px] md:w-[180px] lg:w-1/6
        bg-gradient-to-b from-[#018ABE] from-15% via-[#65B7D4] via-90% to-[#E0E2E3] 
        text-white flex flex-col items-center py-4 z-50
      "
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-12 w-full md:py-12">
        <Image
          src="/signup/tasklogo.png"
          alt="Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>

      {/* Scrollable Menu */}
      <nav
        className="
          flex-1 w-full px-2 overflow-y-hidden
          scrollbar-y-hidden
        "
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="
              flex items-center gap-2 px-2 py-2
              hover:bg-white hover:text-sky-700
              rounded-md transition duration-200
            "
          >
            <item.icon className="w-5 h-5" />
            <span className="hidden sm:inline font-medium text-[8px] sm:text-[12px] md:text-[16px]">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
