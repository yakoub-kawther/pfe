import { useState } from "react";
import { Bell, Info, CheckCheck } from "lucide-react";
import Student_layout from "../../layouts/Student_layout";

const initialNotifications = [
  { id: 1, icon: "bell", sender: "Admin",        message: "Your attendance has been updated.",           time: "2 min ago",  read: false },
  { id: 2, icon: "info", sender: "Teacher",       message: "New homework posted for Eng-A2.",             time: "1 hour ago", read: false },
  { id: 3, icon: "bell", sender: "Admin",         message: "Your fee for April 2026 is due.",             time: "Yesterday",  read: false },
  { id: 4, icon: "info", sender: "Teacher",       message: "Class on Monday is cancelled.",               time: "2 days ago", read: true  },
  { id: 5, icon: "bell", sender: "Admin",         message: "Your grade for March has been published.",    time: "3 days ago", read: true  },
  { id: 6, icon: "info", sender: "Teacher",       message: "Please bring your workbook next session.",    time: "1 week ago", read: true  },
];

export default function Notifications_student() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("All"); // All | Unread | Read

  const markRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAll = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unread = notifications.filter(n => !n.read).length;

  const displayed = notifications.filter(n => {
    if (filter === "Unread") return !n.read;
    if (filter === "Read")   return  n.read;
    return true;
  });

  // ─── styles ────────────────────────────────────────────────
  const F = "Inter, sans-serif";

  const filterBtn = (label) => ({
    padding: "6px 18px",
    borderRadius: "9999px",
    fontSize: "13px",
    fontFamily: F,
    cursor: "pointer",
    border: "1.5px solid",
    transition: "all 0.15s",
    fontWeight: filter === label ? 600 : 400,
    background: filter === label ? "#701366" : "white",
    color:      filter === label ? "white"   : "#701366",
    borderColor: filter === label ? "#701366" : "#e2d0e2",
  });

  return (
    <Student_layout>
      <div style={{ maxWidth: "760px", margin: "40px auto", padding: "0 24px", fontFamily: F, display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>Notifications</h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
              {unread > 0 ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>

          {unread > 0 && (
            <button
              onClick={markAll}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", color: "#701366", background: "#fdf4fd",
                border: "1.5px solid #e2d0e2", borderRadius: "10px", padding: "8px 16px",
                fontFamily: F, cursor: "pointer", fontWeight: 500,
              }}
            >
              <CheckCheck size={15} /> Mark all as read
            </button>
          )}
        </div>

        {/* ── Filter pills ── */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "Unread", "Read"].map(label => (
            <button key={label} style={filterBtn(label)} onClick={() => setFilter(label)}>
              {label}
              {label === "Unread" && unread > 0 && (
                <span style={{
                  marginLeft: "6px", background: filter === "Unread" ? "white" : "#701366",
                  color: filter === "Unread" ? "#701366" : "white",
                  fontSize: "10px", borderRadius: "99px", padding: "1px 6px", fontWeight: 500,
                }}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#b48ab0", fontSize: "14px" }}>
              No notifications here.
            </div>
          ) : displayed.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                padding: "16px 20px", borderRadius: "16px", cursor: "pointer",
                background: n.read ? "white" : "#fdf5fd",
                border: `1.5px solid ${n.read ? "#f0ecf0" : "#e2c8e2"}`,
                transition: "all 0.15s",
                boxShadow: n.read ? "none" : "0 2px 8px rgba(112,19,102,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c9a8d0"; e.currentTarget.style.background = "#fdf5fd"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = n.read ? "#f0ecf0" : "#e2c8e2"; e.currentTarget.style.background = n.read ? "white" : "#fdf5fd"; }}
            >
              {/* Icon */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                background: n.read ? "#f5eef5" : "linear-gradient(135deg, #701366, #9c1e8e)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {n.icon === "bell"
                  ? <Bell  size={16} color={n.read ? "#a07aa0" : "white"} />
                  : <Info  size={16} color={n.read ? "#a07aa0" : "white"} />}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", color: "#2d1a2d", margin: "0 0 4px", lineHeight: "1.4" }}>
                  <span style={{ fontWeight: n.read ? 500 : 700 }}>{n.sender}</span>
                  {n.message && (
                    <span style={{ fontWeight: 400, color: "#555" }}> — {n.message}</span>
                  )}
                </p>
                <p style={{ fontSize: "11px", color: "#b09ab0", margin: 0 }}>{n.time}</p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#701366", flexShrink: 0, marginTop: "6px",
                }} />
              )}
            </div>
          ))}
        </div>

      </div>
    </Student_layout>
  );
}