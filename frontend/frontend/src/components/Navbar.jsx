import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, CheckCheck, Send, X, Search } from "lucide-react";
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

// ─── Compose / Send dropdown ───────────────────────────────────
const NOTIFICATION_TYPES = [
  { label: "Schedule Change",  value: "schedule_change" },
  { label: "Payment Reminder", value: "payment_reminder" },
  { label: "Absence Alert",    value: "absence_alert" },
  { label: "Meeting",          value: "meeting" },
  { label: "Salary",           value: "salary" },
  { label: "General",          value: "general" },
];

const RECIPIENTS = [
  { label: "All Students",   value: "all_students" },
  { label: "All Teachers",   value: "all_teachers" },
  { label: "Entire Class",   value: "class" },
  { label: "Specific Users", value: "specific" },
];

const emptyForm = { notification_type: "", target: "", title: "", body: "" };

const composeInput = {
  width: "100%", border: "1.5px solid #e2d0e2", borderRadius: "9px",
  padding: "8px 11px", fontSize: "12.5px", color: "#701366",
  fontFamily: "Inter, sans-serif", backgroundColor: "#fff",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const composeFocus = (e) => { e.target.style.borderColor = "#701366"; e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,0.08)"; };
const composeBlur  = (e) => { e.target.style.borderColor = "#e2d0e2"; e.target.style.boxShadow = "none"; };

const ComposeField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: 500, color: "#701366", fontFamily: "Inter, sans-serif" }}>{label}</label>
    {children}
  </div>
);

// Compact searchable list — used for the "Entire Class" (single-select) picker.
const CompactSelectorList = ({ items, selectedIds, onToggle, searchPlaceholder, renderLabel, single = false }) => {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item =>
    renderLabel(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...composeInput, marginBottom: "6px" }}
        onFocus={composeFocus} onBlur={composeBlur}
      />
      <div style={{ maxHeight: "110px", overflowY: "auto", border: "1.5px solid #e2d0e2", borderRadius: "9px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "10px 12px", fontSize: "12px", color: "#c9a8c9", fontFamily: "Inter, sans-serif" }}>
            No results found.
          </div>
        ) : filtered.map(item => {
          const isSelected = single ? selectedIds[0] === item.id : selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                padding: "7px 12px", fontSize: "12px", cursor: "pointer",
                fontFamily: "Inter, sans-serif", color: "#701366",
                background: isSelected ? "#f8e0f8" : "white",
                borderBottom: "1px solid #f0e0f0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>{renderLabel(item)}</span>
              {isSelected && <span style={{ fontSize: "11px", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p style={{ fontSize: "10px", color: "#701366", fontFamily: "Inter, sans-serif", marginTop: "5px" }}>
          {single ? "1 selected" : `${selectedIds.length} selected`}
        </p>
      )}
    </div>
  );
};

// Deterministic avatar color from a username, for the specific-user picker.
const AVATAR_COLORS = ["#701366", "#9c1e8e", "#c2185b", "#7b1fa2", "#5e35b1", "#00897b", "#e64a19", "#5d4037"];
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Enhanced searchable list for picking specific users — avatars, search icon, tidy selection state.
const UserSelectorList = ({ items, selectedIds, onToggle, searchPlaceholder = "Search by username..." }) => {
  const [search, setSearch] = useState("");
  const filtered = items.filter(u => (u.username ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <Search size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#c9a8c9", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...composeInput, paddingLeft: "30px" }}
          onFocus={composeFocus} onBlur={composeBlur}
        />
      </div>

      <div style={{ maxHeight: "160px", overflowY: "auto", border: "1.5px solid #e2d0e2", borderRadius: "12px", padding: "5px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "14px 12px", fontSize: "12px", color: "#c9a8c9", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            No users found.
          </div>
        ) : filtered.map(u => {
          const isSelected = selectedIds.includes(u.id);
          const initial = u.username?.[0]?.toUpperCase() ?? "?";
          return (
            <div
              key={u.id}
              onClick={() => onToggle(u.id)}
              style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "7px 8px", borderRadius: "9px", cursor: "pointer",
                background: isSelected ? "#f8e0f8" : "transparent",
                transition: "background 0.12s", marginBottom: "2px",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#faf5fa"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                background: isSelected ? "linear-gradient(135deg, #701366, #9c1e8e)" : stringToColor(u.username || "?"),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "11px", fontWeight: 600, fontFamily: "Inter, sans-serif",
              }}>
                {initial}
              </div>
              <span style={{ flex: 1, fontSize: "12.5px", color: "#2d1a2d", fontFamily: "Inter, sans-serif", fontWeight: isSelected ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.username}
              </span>
              <div style={{
                width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                border: `1.5px solid ${isSelected ? "#701366" : "#d8c0d8"}`,
                background: isSelected ? "#701366" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSelected && <span style={{ color: "white", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <span style={{ display: "inline-block", fontSize: "10.5px", color: "#701366", fontFamily: "Inter, sans-serif", fontWeight: 500, background: "#f8e0f8", padding: "3px 9px", borderRadius: "99px", marginTop: "7px" }}>
          {selectedIds.length} selected
        </span>
      )}
    </div>
  );
};

function SendNotifDropdown({ onClose, onSent }) {
  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [users, setUsers]                 = useState([]);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [classes, setClasses]             = useState([]);
  const [selectedClass, setSelectedClass] = useState([]);

  const resetExtras = () => { setSelectedIds([]); setSelectedClass([]); };

  useEffect(() => {
    resetExtras();
    if (form.target === "specific") {
      apiFetch("/account/accounts/")
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : (data.results ?? [])))
        .catch(() => {});
    }
    if (form.target === "class") {
      apiFetch("/academic/classes/")
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.results ?? []);
          // Only active classes can receive a notification.
          setClasses(list.filter(c => c.is_active));
        })
        .catch(() => {});
    }
  }, [form.target]);

  const toggleUser  = (id) => setSelectedIds(prev  => prev.includes(id)  ? prev.filter(i => i !== id)  : [...prev, id]);
  const toggleClass = (id) => setSelectedClass(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSend = async () => {
    if (!form.notification_type || !form.target || !form.title || !form.body) {
      setError("Please fill in all fields."); return;
    }
    if (form.target === "specific" && selectedIds.length === 0) {
      setError("Please select at least one user."); return;
    }
    if (form.target === "class" && selectedClass.length === 0) {
      setError("Please select a class."); return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const body = {
        notification_type: form.notification_type,
        title            : form.title,
        body             : form.body,
        target           : form.target,
        ...(form.target === "specific" && { receiver_ids: selectedIds }),
        ...(form.target === "class"    && { class_id: selectedClass[0] }),
      };

      const res = await apiFetch("/notifications/send/", { method: "POST", body });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.detail || "Failed to send notification.");
        return;
      }

      setSuccess(true);
      setForm(emptyForm);
      resetExtras();
      onSent?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderTargetSelector = () => {
    switch (form.target) {
      case "specific":
        return (
          <ComposeField label="Select Users">
            <UserSelectorList
              items={users} selectedIds={selectedIds} onToggle={toggleUser}
            />
          </ComposeField>
        );
      case "class":
        return (
          <ComposeField label="Select Class">
            {classes.length === 0 ? (
              <p style={{ fontSize: "11.5px", color: "#b48ab0", fontFamily: "Inter, sans-serif", margin: 0 }}>
                No active classes available.
              </p>
            ) : (
              <CompactSelectorList
                items={classes} selectedIds={selectedClass} onToggle={toggleClass}
                searchPlaceholder="Search by class name..." renderLabel={c => c.name} single
              />
            )}
          </ComposeField>
        );
      default: return null;
    }
  };

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      width: "340px", background: "white", borderRadius: "18px",
      boxShadow: "0 8px 32px rgba(112,19,102,0.15), 0 2px 8px rgba(0,0,0,0.08)",
      border: "1.5px solid #f0e0f0", zIndex: 999, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: "1px solid #f5eef5" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#701366", fontFamily: "Inter, sans-serif" }}>Send Notification</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#c9a8c9", padding: "0 2px", display: "flex" }}>
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ maxHeight: "440px", overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>

        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "9px 12px", borderRadius: "9px", fontSize: "12px", border: "1px solid #bbf7d0", fontFamily: "Inter, sans-serif" }}>
            ✓ Sent successfully!
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "9px 12px", borderRadius: "9px", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        <ComposeField label="Notification Type">
          <select style={{ ...composeInput, cursor: "pointer" }} value={form.notification_type}
            onChange={e => setForm({ ...form, notification_type: e.target.value })}
            onFocus={composeFocus} onBlur={composeBlur}>
            <option value="" disabled>Select type</option>
            {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </ComposeField>

        <ComposeField label="Recipients">
          <select style={{ ...composeInput, cursor: "pointer" }} value={form.target}
            onChange={e => setForm({ ...form, target: e.target.value })}
            onFocus={composeFocus} onBlur={composeBlur}>
            <option value="" disabled>Select recipients</option>
            {RECIPIENTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </ComposeField>

        {form.target && renderTargetSelector()}

        <ComposeField label="Title">
          <input type="text" placeholder="Notification title"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            style={composeInput} onFocus={composeFocus} onBlur={composeBlur} />
        </ComposeField>

        <ComposeField label="Message">
          <textarea placeholder="Write your message…"
            value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
            rows={3} style={{ ...composeInput, resize: "none", lineHeight: "1.5" }}
            onFocus={composeFocus} onBlur={composeBlur} />
        </ComposeField>

        <button onClick={handleSend} disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #701366, #9c1e8e)", color: "white", border: "none",
            borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontFamily: "Inter, sans-serif",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            boxShadow: "0 3px 10px rgba(112,19,102,0.25)", alignSelf: "flex-end",
          }}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
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

  // Compose ("Send Notification") dropdown — only rendered for these roles.
  const canSend = ["admin", "secretary", "teacher"].includes(role);
  const [composeOpen, setComposeOpen] = useState(false);
  const composeRef = useRef(null);

  // ── Close on outside click (both dropdowns share this) ────
  useEffect(() => {
    if (!dropdownOpen && !composeOpen) return;
    const handler = (e) => {
      if (dropdownOpen && bellRef.current && !bellRef.current.contains(e.target)) setDropdownOpen(false);
      if (composeOpen && composeRef.current && !composeRef.current.contains(e.target)) setComposeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen, composeOpen]);

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
      if (active) setNotifications(list.map(mapNotif));   // <-- overwrites blindly
    } catch {}
    finally { if (active) setLoading(false); }
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

  const openBell = () => {
    setComposeOpen(false);
    setDropdownOpen(o => !o);
  };

  const openCompose = () => {
    setDropdownOpen(false);
    setComposeOpen(o => !o);
  };

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: "16px", marginBottom: "32px", width: "100%", minWidth: 0, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>

        {/* Send / Compose */}
        {canSend && (
          <div ref={composeRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              aria-label="Send Notification"
              onClick={openCompose}
              style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", cursor: "pointer", background: "white", color: "#701366", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "background 0.15s, color 0.15s, transform 0.15s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Send size={18} />
            </button>

            {composeOpen && (
              <SendNotifDropdown
                onClose={() => setComposeOpen(false)}
                onSent={() => { /* dropdown shows its own success state */ }}
              />
            )}
          </div>
        )}

        {/* Bell */}
        <div ref={bellRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            aria-label="Notifications"
            onClick={openBell}
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