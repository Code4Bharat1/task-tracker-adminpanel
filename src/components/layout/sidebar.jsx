"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
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
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "View Attendance", icon: CalendarDays, href: "/viewattendance" },
  { label: "View TimeSheet", icon: Clock, href: "/viewtimesheet" },
  { label: "Calendar", icon: FileText, href: "/calendar" },
  { label: "Document", icon: FileCheck, href: "/viewdocument" },
  { label: "Leave", icon: MailCheck, href: "/leavetable" },
  { label: "Salary", icon: Coins, href: "/salary" },
  { label: "Expense", icon: Receipt, href: "/expenseRequest" },
  { label: "Performance Board", icon: TrendingUp, href: "/performanceboard" },
  { label: "Company Policies", icon: ShieldCheck, href: "/companypolicy" },
  { label: "Logout", icon: LogOut, href: "/" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

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
      <nav className="flex-1 w-full px-2 overflow-y-hidden scrollbar-y-hidden">
        {menuItems.map((item, idx) => {
          const active = isActive(item.href);

          return (
            <Link
              key={idx}
              href={item.href}
              className={`
                flex items-center gap-2 px-2 py-2 rounded-md transition duration-200
                ${active ? "bg-white text-sky-700 font-semibold" : "hover:bg-white/30 hover:text-white"}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-[8px] sm:text-[12px] md:text-[16px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
