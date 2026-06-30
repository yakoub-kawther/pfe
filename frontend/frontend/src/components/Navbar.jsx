import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, CheckCheck } from "lucide-react";
import { apiFetch } from "../services/api";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

const mapNotif = (nr) => ({
  id:      nr.id,
  is_read: nr.is_read,
  sender:  nr.sender?.username ?? "System",
  message: nr.body  ?? nr.title ?? "",
  time:    formatTime(nr.sent_at),
});

function NotifDropdown({ notifications, loading, onMarkRead, onMarkAll, onClose }) {
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      width: "340px", background: "white", borderRadius: "18px",
      boxShadow: "0 8px 32px rgba(112,19,102,0.15), 0 2px 8px rgba(0,0,0,0.08)",
      border: "1.5px solid #f0e0f0", zIndex: 999, overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 12px", borderBottom: "1px solid #f5eef5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#701366", fontFamily: "Inter, sans-serif" }}>Notifications</span>
          {unread > 0 && (
            <span style={{ background: "#701366", color: "white", fontSize: "10px", fontWeight: 400, borderRadius: "99px", padding: "1px 7px", fontFamily: "Inter, sans-serif" }}>
              {unread}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unread > 0 && (
            <button onClick={onMarkAll} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#701366", background: "#faf5fa", border: "1px solid #e2d0e2", borderRadius: "7px", padding: "4px 9px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
              <CheckCheck size={11} /> Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#c9a8c9", fontSize: "18px", lineHeight: 1, padding: "0 2px" }}>×</button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: "380px", overflowY: "auto", padding: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "#fafafa", border: "1.5px solid #f0ecf0", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "12px", width: "70%", background: "#f3e8f9", borderRadius: "6px" }} />
                <div style={{ height: "10px", width: "40%", background: "#f3e8f9", borderRadius: "6px" }} />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <p style={{ textAlign: "center", color: "#b48ab0", fontSize: "13px", margin: "20px 0" }}>No notifications</p>
          ) : notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && onMarkRead(n.id)}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "11px 12px", borderRadius: "12px", cursor: n.is_read ? "default" : "pointer",
                background: n.is_read ? "#fafafa" : "#fdf5fd",
                border: `1.5px solid ${n.is_read ? "#f0ecf0" : "#e2c8e2"}`,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.borderColor = "#c9a8d0"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = n.is_read ? "#f0ecf0" : "#e2c8e2"; }}
            >
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0, background: n.is_read ? "#f5eef5" : "linear-gradient(135deg, #701366, #9c1e8e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={12} color={n.is_read ? "#a07aa0" : "white"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12.5px", color: "#2d1a2d", margin: "0 0 2px", fontFamily: "Inter, sans-serif", lineHeight: "1.35" }}>
                  <span style={{ fontWeight: n.is_read ? 500 : 600 }}>{n.sender}</span>
                  {n.message ? <span style={{ fontWeight: 400, color: "#666" }}> — {n.message}</span> : ""}
                </p>
                <p style={{ fontSize: "10.5px", color: "#b09ab0", fontFamily: "Inter, sans-serif", margin: 0 }}>{n.time}</p>
              </div>
              {!n.is_read && (
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#701366", flexShrink: 0, marginTop: "5px" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Navbar({ role = "admin" }) {
  const navigate = useNavigate();
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [notifications, setNotifications] = useState([]);  
  const [loading,       setLoading]       = useState(false);
  const bellRef = useRef(null);

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // ── Fetch notifications ───────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    let active = true;

    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const r    = await apiFetch("/notifications/");
        const data = await r.json();
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (active) setNotifications(list.map(mapNotif));  
      } catch {}
      finally {
        if (active) setLoading(false);
      }
    };

    fetchNotifs();
    return () => { active = false; };
  }, [dropdownOpen]);

  const unread = notifications.filter(n => !n.is_read).length;

  const markRead = (id) => {
  apiFetch(`/notifications/${id}/read/`, { method: "POST" }).catch(() => {});
  setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
};

  const markAll = () => {
    apiFetch("/notifications/read-all/", { method: "POST" }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: "16px", marginBottom: "32px", width: "100%", minWidth: 0, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>

        {/* Bell */}
        <div ref={bellRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            aria-label="Notifications"
            onClick={() => setDropdownOpen(o => !o)}
            style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", cursor: "pointer", background: "white", color: "#701366", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "background 0.15s, color 0.15s, transform 0.15s", position: "relative", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: "-3px", right: "-3px", background: "#e91e63", color: "white", fontSize: "9px", fontWeight: 600, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", pointerEvents: "none" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <NotifDropdown
              notifications={notifications}
              loading={loading}
              onMarkRead={markRead}
              onMarkAll={markAll}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>

        {/* Settings */}
        <button
          aria-label="Settings"
          onClick={() => navigate(
            role === "secretary" ? "/Settings_secretary" :
            role === "teacher"   ? "/Settings_teacher"   :
            role === "student"   ? "/Settings_student"   :
            "/Settings"
          )}
          style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", cursor: "pointer", background: "white", color: "#701366", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "background 0.15s, color 0.15s, transform 0.15s", flexShrink: 0 }}
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