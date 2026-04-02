import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
  CreditCard,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 w-36 h-screen bg-[#F8E0F8] rounded-tr-2xl rounded-br-1.5xl flex flex-col py-2 px-1.5">

      {/* Logo */}
      <div className="flex flex-col items-start mb-2">
        <span className="text-3xl text-[#701366] font-item leading-none">ZKY</span>
        <span className="text-[10px] text-[#701366] font-item tracking-widest">LINGUA</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0">
        <Link to="/Dashboard" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
          Dashboard
        </Link>

        <Link to="/Teachers" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          Teachers
        </Link>

        <Link to="/Students" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <Users className="w-3.5 h-3.5 shrink-0" />
          Students
        </Link>

        <Link to="/Employees" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          Employees
        </Link>

        <Link to="/Classes" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Classes
        </Link>

        <Link to="/Fees" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <CreditCard className="w-3.5 h-3.5 shrink-0" />
          Fees
        </Link>

        <Link to="/timetable" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          Time Table
        </Link>

        <Link to="/notifications" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <Bell className="w-3.5 h-3.5 shrink-0" />
          Notifications
        </Link>

        <Link to="/reports" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
          Reports
        </Link>

        <Link to="/settings" className="flex items-center gap-2 pl-2 px-1 py-[1px] text-[10.5px] rounded-lg text-[#701366] hover:bg-white/50">
          <Settings className="w-3.5 h-3.5 shrink-0" />
          Settings
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* BOTTOM */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <img src="/src/assets/Support.svg" className="w-22" />
        <button className="w-full flex items-center justify-center gap-2 bg-[#701366] text-white text-[12px] hover:bg-[#f8b2ea] py-0 rounded-lg">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;