import React, { useState } from "react";
import {
  LayoutDashboard, GraduationCap, Users, Briefcase,
  BookOpen, CreditCard, Calendar, Bell, BarChart3, Settings, LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const SIDEBAR_W = 190;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);
      const [hover, setHover] = useState(false);

  const handleLogout = () => {

    localStorage.removeItem("user");
    navigate("/Login");
  };

  const navItems = [
    { to: "/Dashboard",     icon: <LayoutDashboard size={15} />, label: "Dashboard"     },
    { to: "/Teachers",      icon: <GraduationCap   size={15} />, label: "Teachers"      },
    { to: "/Students",      icon: <Users           size={15} />, label: "Students"      },
    { to: "/Employees",     icon: <Briefcase       size={15} />, label: "Employees"     },
    { to: "/Classes",       icon: <BookOpen        size={15} />, label: "School Config" },
    { to: "/Fees",          icon: <CreditCard      size={15} />, label: "Fees"          },
    { to: "/Time_table",    icon: <Calendar        size={15} />, label: "Time Table"    },
    { to: "/Notifications", icon: <Bell            size={15} />, label: "Notifications" },
    { to: "/Inscriptions",  icon: <BarChart3       size={15} />, label: "Inscriptions"  },
    { to: "/Settings",      icon: <Settings        size={15} />, label: "Settings"      },
  ];

  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 0,
      width: SIDEBAR_W,
      minWidth: SIDEBAR_W,
      maxWidth: SIDEBAR_W,
      height: "100vh",
      background: "#F8E0F8",
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      zIndex: 40,
      overflow: "hidden",
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "2.5rem 0.75rem 0.5rem 1.5rem", flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: "2.25rem", color: "#701366", lineHeight: 1, fontWeight: 500 }}>A to Z</span>
          <span style={{ fontSize: "0.6875rem", color: "#701366", letterSpacing: "0.15em", fontWeight: 600 }}>LINGUA</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: "0.5rem 0.75rem",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {navItems.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          const hovered = hoveredPath === to;

          return (
            <Link
              key={to}
              to={to}
              onMouseEnter={() => setHoveredPath(to)}
              onMouseLeave={() => setHoveredPath(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                width: "88%",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: 8,
                textDecoration: "none",
                whiteSpace: "nowrap",
                color: "#701366",
                background: active
                  ? "#fff"
                  : hovered
                  ? "rgba(112,19,102,0.1)"
                  : "transparent",
                boxShadow: active ? "0 1px 4px rgba(112,19,102,0.08)" : "none",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "0.5rem 0.75rem 0.75rem",
      }}>
        <img src="/src/assets/Support.svg" style={{ width: "clamp(70px, 7vw, 290px)", height: "auto" }} alt="Support" />
        <button
          onClick={handleLogout}
            onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", height: 34,
            background: hover ? "#801060" : "#701366",
             color: "#fff",
            fontSize: "0.75rem", fontWeight: 500,
            border: "none", borderRadius: 8,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;