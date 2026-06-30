import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { apiFetch } from "../services/api";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

// Map NotificationReceiver object → flat shape the UI needs
const mapNotif = (nr) => ({
  id:         nr.id,
  is_read:    nr.is_read,
  sender:     nr.sender?.username ?? "System",  
  message:    nr.body             ?? "",         
  created_at: nr.sent_at          ?? "",         
});

export default function NotifDropdown() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch when opened
  useEffect(() => {
    if (!open) return;
    let active = true;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const r    = await apiFetch("/notifications/");
        const data = await r.json();
        console.log("notifications raw:", JSON.stringify(data, null, 2))
        if (!active) return;
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setNotifications(list.map(mapNotif));
      } catch {
        // keep whatever was there before on error
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { active = false; };
  }, [open]);

  const unread = notifications.filter(n => !n.is_read).length;

  // Optimistic updates — fire & forget, UI updates instantly
  const markRead = (id) => {
    apiFetch(`/notifications/${id}/read/`, { method: "POST" }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    apiFetch("/notifications/read-all/", { method: "POST" }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>

      {/* Bell button */}
      <button
        onClick={() => { console.log("bell clicked"); setOpen(o => !o); }}
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
            {unread > 9 ? "9+" : unread}
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
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "white", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ height: "12px", width: "70%", background: "#f3e8f9", borderRadius: "6px", animation: "pulse 1.4s infinite" }} />
                  <div style={{ height: "10px", width: "40%", background: "#f3e8f9", borderRadius: "6px", animation: "pulse 1.4s infinite" }} />
                </div>
              ))
            ) : notifications.length === 0 ? (
              <p style={{ textAlign: "center", color: "#701366", fontSize: "13px", opacity: 0.6, margin: "16px 0" }}>No notifications</p>
            ) : notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  display: "flex", gap: "12px", padding: "12px",
                  borderRadius: "12px", cursor: n.is_read ? "default" : "pointer",
                  background: n.is_read ? "rgba(255,255,255,0.5)" : "white",
                  boxShadow: n.is_read ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "background 0.15s",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ marginTop: "2px", flexShrink: 0, color: "#701366" }}>
                  <Bell style={{ width: "14px", height: "14px" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "#1f2937", lineHeight: "1.4", margin: 0 }}>
                    <span style={{ fontWeight: 700 }}>{n.sender}</span>
                    {n.message ? ` ${n.message}` : ""}
                  </p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px", marginBottom: 0 }}>
                    {formatTime(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#701366", marginTop: "4px", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          {!loading && unread > 0 && (
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
          )}

        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}