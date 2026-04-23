import { useState, useRef, useEffect } from "react";
import { Bell, Info } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: "bell", sender: "Dr hamza",                    message: "We don't have a session today",       time: "2h",                read: false },
  { id: 2, icon: "bell", sender: "Updated the Classroom",       message: "English C2 to room 4",                time: "6h",                read: false },
  { id: 3, icon: "info", sender: "Dr amine",                    message: "you have a test of english Tomorrow",  time: "Today 9:36 am",     read: true  },
  { id: 4, icon: "info", sender: "Emily Tyler",                 message: "don't forget the test of espagnol",   time: "Tomorrow",          read: true  },
  { id: 5, icon: "bell", sender: "Updated the prgrm of spanish",message: "",                                    time: "Tomorrow",          read: true  },
  { id: 6, icon: "bell", sender: "Blake Silve",                 message: "we repport the session of french",    time: "Sep 12 | 10:54 am", read: true  },
];

export default function NotifDropdown() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const ref                               = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread     = notifications.filter((n) => !n.read).length;
  const markRead   = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = ()  => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>

      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          width: "36px", height: "36px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%", border: "none", cursor: "pointer",
          background: "white", color: "#701366",
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
          transition: "background 0.15s, color 0.15s, transform 0.15s",
          position: "relative",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
      >
        <Bell style={{ width: "20px", height: "20px", flexShrink: 0 }} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            width: "16px", height: "16px",
            background: "#ef4444", color: "white",
            fontSize: "9px", fontWeight: 700,
            borderRadius: "50%", border: "2px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", flexShrink: 0,
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "44px", right: 0,
          width: "288px",
          background: "#fce8fc",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: "16px",
          zIndex: 50,
          border: "1px solid #e8b4e8",
          boxSizing: "border-box",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontWeight: 700, color: "#701366", fontSize: "14px" }}>Notifications</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: "20px", height: "20px", flexShrink: 0,
                borderRadius: "50%", border: "none", cursor: "pointer",
                background: "#701366", color: "white", fontSize: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#5a0f52"}
              onMouseLeave={e => e.currentTarget.style.background = "#701366"}
            >✕</button>
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "288px", overflowY: "auto", paddingRight: "4px" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex", gap: "12px", padding: "12px",
                  borderRadius: "12px", cursor: "pointer",
                  background: n.read ? "rgba(255,255,255,0.5)" : "white",
                  boxShadow: n.read ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "background 0.15s",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ marginTop: "2px", flexShrink: 0, color: "#701366" }}>
                  {n.icon === "bell"
                    ? <Bell style={{ width: "14px", height: "14px" }} />
                    : <Info style={{ width: "14px", height: "14px" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "#1f2937", lineHeight: "1.4", margin: 0 }}>
                    <span style={{ fontWeight: 700 }}>{n.sender}</span>
                    {n.message ? ` ${n.message}` : ""}
                  </p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px", marginBottom: 0 }}>{n.time}</p>
                </div>
                {!n.read && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#701366", marginTop: "4px", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <button
            onClick={markAllRead}
            style={{
              marginTop: "12px", width: "100%",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", color: "#701366", fontWeight: 600,
              textAlign: "center",
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Mark all as read
          </button>

        </div>
      )}
    </div>
  );
}