import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, Info, CheckCheck } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: "bell", sender: "Dr Hamza",                       message: "We don't have a session today",       time: "2h ago",            read: false },
  { id: 2, icon: "bell", sender: "Updated the Classroom",          message: "English C2 moved to room 4",          time: "6h ago",            read: false },
  { id: 3, icon: "info", sender: "Dr Amine",                       message: "You have a test of English tomorrow",  time: "Today 9:36 am",     read: true  },
  { id: 4, icon: "info", sender: "Emily Tyler",                    message: "Don't forget the test of Spanish",     time: "Tomorrow",          read: true  },
  { id: 5, icon: "bell", sender: "Updated the program of Spanish", message: "Schedule has been revised",            time: "Tomorrow",          read: true  },
  { id: 6, icon: "bell", sender: "Blake Silver",                   message: "We report the session of French",      time: "Sep 12 | 10:54 am", read: true  },
];

function NotifDropdown({ notifications, setNotifications, onClose }) {
  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAll = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: "340px",
        background: "white",
        borderRadius: "18px",
        boxShadow: "0 8px 32px rgba(112,19,102,0.15), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1.5px solid #f0e0f0",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px 12px",
        borderBottom: "1px solid #f5eef5",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#701366", fontFamily: "Inter, sans-serif" }}>
            Notifications
          </span>
          {unread > 0 && (
            <span style={{
              background: "#701366", color: "white", fontSize: "10px", fontWeight: 400,
              borderRadius: "99px", padding: "1px 7px", fontFamily: "Inter, sans-serif",
            }}>
              {unread}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unread > 0 && (
            <button
              onClick={markAll}
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", color: "#701366", background: "#faf5fa",
                border: "1px solid #e2d0e2", borderRadius: "7px", padding: "4px 9px",
                fontFamily: "Inter, sans-serif", cursor: "pointer",
              }}
            >
              <CheckCheck size={11} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#c9a8c9", fontSize: "18px", lineHeight: 1, padding: "0 2px",
            }}
          >×</button>
        </div>
      </div>

      {/* list */}
      <div style={{ maxHeight: "380px", overflowY: "auto", padding: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "11px 12px", borderRadius: "12px", cursor: "pointer",
                background: n.read ? "#fafafa" : "#fdf5fd",
                border: n.read ? "1.5px solid #f0ecf0" : "1.5px solid #e2c8e2",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c9a8d0"}
              onMouseLeave={e => e.currentTarget.style.borderColor = n.read ? "#f0ecf0" : "#e2c8e2"}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                background: n.read ? "#f5eef5" : "linear-gradient(135deg, #701366, #9c1e8e)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {n.icon === "bell"
                  ? <Bell size={12} color={n.read ? "#a07aa0" : "white"} />
                  : <Info size={12} color={n.read ? "#a07aa0" : "white"} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "12.5px", color: "#2d1a2d", margin: "0 0 2px",
                  fontFamily: "Inter, sans-serif", lineHeight: "1.35",
                }}>
                  <span style={{ fontWeight: n.read ? 500 : 600 }}>{n.sender}</span>
                  {n.message
                    ? <span style={{ fontWeight: 400, color: "#666" }}> — {n.message}</span>
                    : ""}
                </p>
                <p style={{ fontSize: "10.5px", color: "#b09ab0", fontFamily: "Inter, sans-serif", margin: 0 }}>
                  {n.time}
                </p>
              </div>

              {!n.read && (
                <div style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#701366", flexShrink: 0, marginTop: "5px",
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;
  const bellRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingTop: "16px",
        marginBottom: "32px",
        width: "100%",
        minWidth: 0,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>

        {/* Notification Bell */}
        <div ref={bellRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            aria-label="Notifications"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", cursor: "pointer",
              background: "white", color: "#701366",
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
              transition: "background 0.15s, color 0.15s, transform 0.15s",
              position: "relative", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: "-3px", right: "-3px",
                background: "#e91e63", color: "white",
                fontSize: "9px", fontWeight: 600,
                width: "16px", height: "16px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid white", pointerEvents: "none",
              }}>{unread}</span>
            )}
          </button>

          {dropdownOpen && (
            <NotifDropdown
              notifications={notifications}
              setNotifications={setNotifications}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>

        {/* Settings */}
        <button
          aria-label="Settings"
          onClick={() => navigate("/Settings")}
          style={{
            width: "36px", height: "36px",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", border: "none", cursor: "pointer",
            background: "white", color: "#701366",
            boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            transition: "background 0.15s, color 0.15s, transform 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Settings size={20} />
        </button>

      </div>
    </header>
  );
}

export default Navbar;