import React, { useState } from "react";
import {
  TbChartBar, TbSchool, TbUsers, TbBriefcase,
  TbBook2, TbCreditCard, TbCalendar, TbBell, TbUserPlus, TbSettings, TbLogout
} from "react-icons/tb";
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
    { to: "/Dashboard",     icon: <TbChartBar   size={20} strokeWidth={1.5} />, label: "Dashboard"     },
    { to: "/Teachers",      icon: <TbSchool     size={20} strokeWidth={1.5} />, label: "Teachers"      },
    { to: "/Students",      icon: <TbUsers      size={20} strokeWidth={1.5} />, label: "Students"      },
    { to: "/Employees",     icon: <TbBriefcase  size={20} strokeWidth={1.5} />, label: "Employees"     },
    { to: "/Classes",       icon: <TbBook2      size={20} strokeWidth={1.5} />, label: "School Config" },
    { to: "/Fees",          icon: <TbCreditCard size={20} strokeWidth={1.5} />, label: "Fees"          },
    { to: "/Time_table",    icon: <TbCalendar   size={20} strokeWidth={1.5} />, label: "Time Table"    },
    { to: "/Notifications", icon: <TbBell       size={20} strokeWidth={1.5} />, label: "Notifications" },
    { to: "/Inscriptions",  icon: <TbUserPlus   size={20} strokeWidth={1.5} />, label: "Enrollment"    },
    { to: "/Settings",      icon: <TbSettings   size={20} strokeWidth={1.5} />, label: "Settings"      },
  ];

  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 2,
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
      <div style={{ padding: "1.5rem 0.75rem 0.5rem 0.75rem", flexShrink: 0 }}>
        <img
          src="/src/assets/logo.svg"
          alt="A to Z Lingua"
          style={{ width: "clamp(85px, 9vw, 110px)", height: "auto", display: "block" }}
        />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: "1.5rem 0.75rem 0.5rem 0.75rem",
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
          <TbLogout size={18} strokeWidth={1.5} />
          Log Out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;