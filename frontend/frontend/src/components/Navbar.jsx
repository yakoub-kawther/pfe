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
    <aside className="fixed top-0 left-0 w-40 h-screen bg-[#F8E0F8] rounded-tr-2xl rounded-br-2xl flex flex-col justify-between py-3 px-2">

      {/* TOP */}
     <div className="flex flex-col min-h-0 flex-1">

        {/* Logo */}
        <div className="flex flex-col items-start mb-2">
          <span className="text-3xl text-[#701366] font-item leading-none">ZKY</span>
          <span className="text-[10px] text-[#701366] font-item tracking-widest">LINGUA</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0 overflow-y-auto flex-1">

          <Link to="/Dashboard" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link to="/Teachers" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <GraduationCap className="w-4 h-4" />
            Teachers
          </Link>

          <Link to="/Students" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <Users className="w-4 h-4" />
            Students
          </Link>

          <Link to="/Employees" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <Briefcase className="w-4 h-4" />
            Employees
          </Link>

          <Link to="/Classes" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <BookOpen className="w-4 h-4" />
            Classes
          </Link>

          <Link to="/Fees" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <CreditCard className="w-4 h-4" />
            Fees
          </Link>

          <Link to="/timetable" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <Calendar className="w-4 h-4" />
            Time Table
          </Link>

          <Link to="/notifications" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <Bell className="w-4 h-4" />
            Notifications
          </Link>

          <Link to="/reports" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <BarChart3 className="w-4 h-4" />
            Reports
          </Link>

          <Link to="/settings" className="flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-lg text-[#701366] hover:bg-white/50">
            <Settings className="w-4 h-4" />
            Settings
          </Link>

        </nav>
      </div>

      {/* BOTTOM */}
     <div className="flex flex-col items-center gap-1 shrink-0 pt-1">

        <img src="/src/assets/Support.svg" className="w-20" />

        <button className="w-full flex items-center justify-center gap-1.5 bg-[#701366] text-white text-[12px] hover:bg-[#f8b2ea] py-1 rounded-lg">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;