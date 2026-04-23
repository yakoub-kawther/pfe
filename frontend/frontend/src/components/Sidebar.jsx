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

import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/Login");
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-[#F8E0F8] rounded-tr-2xl rounded-br-2xl flex flex-col justify-between py-3 px-3"
      style={{ width: "160px", minWidth: "160px", maxWidth: "160px" }}
    >

      <div className="flex flex-col gap-4 mt-10 ml-6">
        {/* Logo */}
        <div className="flex flex-col items-start">
          <span className="text-4xl text-[#701366] font-item leading-none">A to Z</span>
          <span className="text-[11px] text-[#701366] font-item tracking-widest">LINGUA</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2">
          {[
            { to: "/Dashboard",     icon: <LayoutDashboard className="w-4 h-4 shrink-0" />, label: "Dashboard"     },
            { to: "/Teachers",      icon: <GraduationCap   className="w-4 h-4 shrink-0" />, label: "Teachers"      },
            { to: "/Students",      icon: <Users           className="w-4 h-4 shrink-0" />, label: "Students"      },
            { to: "/Employees",     icon: <Briefcase       className="w-4 h-4 shrink-0" />, label: "Employees"     },
            { to: "/Classes",       icon: <BookOpen        className="w-4 h-4 shrink-0" />, label: "School Config"       },
            { to: "/Fees",          icon: <CreditCard      className="w-4 h-4 shrink-0" />, label: "Fees"          },
            { to: "/Time_table",    icon: <Calendar        className="w-4 h-4 shrink-0" />, label: "Time Table"    },
            { to: "/Notifications", icon: <Bell            className="w-4 h-4 shrink-0" />, label: "Notifications" },
            { to: "/Inscriptions",       icon: <BarChart3       className="w-4 h-4 shrink-0" />, label: "Inscriptions"       },
            { to: "/Settings",      icon: <Settings        className="w-4 h-4 shrink-0" />, label: "Settings"      },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-2 py-1.5 w-[85%] text-[13px] rounded-lg transition-all duration-150 whitespace-nowrap
                ${location.pathname === to
                  ? "bg-white text-[#701366] font-item"
                  : "text-[#701366] hover:bg-white/50"
                }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <img src="/src/assets/Support.svg" className="w-24" alt="Support" />
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-[#701366] text-white text-[12px] hover:bg-[#f8b2ea] rounded-lg whitespace-nowrap transition-all duration-150"
          style={{ width: "120px", height: "34px", flexShrink: 0 }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log Out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;