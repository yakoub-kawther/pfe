import { useState, useEffect } from "react";
import Teacher_layout from "../../layouts/Teacher_layout";
import { Send } from "lucide-react";
import { apiFetch } from "../../services/api";

const NOTIFICATION_TYPES = [
  { label: "Schedule Change",  value: "schedule_change" },
  { label: "Payment Reminder", value: "payment_reminder" },
  { label: "Absence Alert",    value: "absence_alert" },
  { label: "Meeting",          value: "meeting" },
  { label: "General",          value: "general" },
];

// Teacher can only send to their own students (via class or specific)
const RECIPIENTS = [
  { label: "All My Students", value: "all_my_students" },
  { label: "Entire Class",    value: "class"            },
  { label: "Specific Student", value: "specific"        },
];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label style={{ fontSize: "14px", fontWeight: 500, color: "#701366", fontFamily: "Inter, sans-serif" }}>
      {label}
    </label>
    {children}
  </div>
);

const inputCls = {
  width: "100%", border: "1.5px solid #e2d0e2", borderRadius: "10px",
  padding: "10px 14px", fontSize: "13.5px", color: "#701366",
  fontFamily: "Inter, sans-serif", backgroundColor: "#fff",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const emptyForm = { notification_type: "", target: "", title: "", body: "" };

// ─── Searchable list ──────────────────────────────────────────
const SelectorList = ({ items, selectedIds, onToggle, searchPlaceholder, renderLabel, single = false }) => {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item =>
    renderLabel(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text" placeholder={searchPlaceholder} value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...inputCls, marginBottom: "8px", cursor: "text" }}
        onFocus={e => { e.target.style.borderColor = "#701366"; e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,0.08)"; }}
        onBlur={e  => { e.target.style.borderColor = "#e2d0e2"; e.target.style.boxShadow = "none"; }}
      />
      <div style={{ maxHeight: "180px", overflowY: "auto", border: "1.5px solid #e2d0e2", borderRadius: "10px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "12px 14px", fontSize: "13px", color: "#c9a8c9", fontFamily: "Inter, sans-serif" }}>No results found.</div>
        ) : filtered.map(item => {
          const isSelected = single ? selectedIds[0] === item.id : selectedIds.includes(item.id);
          return (
            <div key={item.id} onClick={() => onToggle(item.id)} style={{ padding: "9px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "Inter, sans-serif", color: "#701366", background: isSelected ? "#f8e0f8" : "white", borderBottom: "1px solid #f0e0f0", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" }}>
              <span>{renderLabel(item)}</span>
              {isSelected && <span style={{ fontSize: "12px", color: "#701366", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p style={{ fontSize: "11px", color: "#701366", fontFamily: "Inter, sans-serif", marginTop: "6px" }}>
          {single ? "1 selected" : `${selectedIds.length} selected`}
        </p>
      )}
    </div>
  );
};

const BroadcastInfo = ({ label }) => (
  <div style={{ padding: "12px 16px", background: "#f8e0f8", borderRadius: "10px", fontSize: "13px", color: "#701366", fontFamily: "Inter, sans-serif" }}>
    📢 This notification will be sent to <strong>{label}</strong>.
  </div>
);

export default function Notifications_teacher() {
  const [form,          setForm]          = useState(emptyForm);
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState("");

  // Teacher's own active classes
  const [myClasses,     setMyClasses]     = useState([]);
  const [selectedClass, setSelectedClass] = useState([]);

  // Students in teacher's classes
  const [myStudents,    setMyStudents]    = useState([]);
  const [selectedIds,   setSelectedIds]   = useState([]);

  const [teacherId,     setTeacherId]     = useState(null);

  const resetExtras = () => { setSelectedIds([]); setSelectedClass([]); };

  // ── Fetch teacher ID and their active classes on mount ────
  useEffect(() => {
    apiFetch("/account/me/")
      .then(r => r.json())
      .then(me => {
        const pid = me?.person_id;
        setTeacherId(pid);
        if (!pid) return;
        // fetch only this teacher's active classes
        return apiFetch(`/academic/classes/?teacher=${pid}&status=active`);
      })
      .then(r => r?.json())
      .then(data => {
        if (!data) return;
        setMyClasses(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(() => {});
  }, []);

  // ── Fetch students when target changes ────────────────────
  useEffect(() => {
    resetExtras();
    if (!teacherId) return;

    if (form.target === "specific" || form.target === "all_my_students") {
      // Collect all students from teacher's classes
      Promise.all(
        myClasses.map(cls =>
          apiFetch(`/inscriptions/?class_id=${cls.id}&status=confirmed`)
            .then(r => r.json())
            .then(data => Array.isArray(data) ? data : (data.results ?? []))
            .catch(() => [])
        )
      ).then(results => {
        // Flatten and deduplicate students
        const allStudents = results.flat();
        const seen = new Set();
        const unique = allStudents.filter(s => {
          const id = s.student?.person?.id ?? s.student?.id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setMyStudents(unique);
      });
    }
  }, [form.target, myClasses, teacherId]);

  const focus = (e) => { e.target.style.borderColor = "#701366"; e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,0.08)"; };
  const blur  = (e) => { e.target.style.borderColor = "#e2d0e2"; e.target.style.boxShadow = "none"; };

  const toggleStudent = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleClass   = (id) => setSelectedClass(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSend = async () => {
    if (!form.notification_type || !form.target || !form.title || !form.body) {
      setError("Please fill in all fields."); return;
    }
    if (form.target === "specific" && selectedIds.length === 0) {
      setError("Please select at least one student."); return;
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
        target           : form.target === "all_my_students" ? "specific" : form.target,
        ...(form.target === "specific"       && { receiver_ids: selectedIds }),
        ...(form.target === "all_my_students" && { receiver_ids: myStudents.map(s => s.student?.person?.id ?? s.student?.id) }),
        ...(form.target === "class"          && { class_id: selectedClass[0] }),
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
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setError("");
    setSuccess(false);
    resetExtras();
  };

  const renderTargetSelector = () => {
    switch (form.target) {
      case "specific":
        return (
          <Field label="Select Student">
            <SelectorList
              items={myStudents}
              selectedIds={selectedIds}
              onToggle={toggleStudent}
              searchPlaceholder="Search student..."
              renderLabel={s => {
                const p = s.student?.person ?? {};
                return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown";
              }}
            />
          </Field>
        );
      case "class":
        return (
          <Field label="Select Class">
            <SelectorList
              items={myClasses}
              selectedIds={selectedClass}
              onToggle={toggleClass}
              searchPlaceholder="Search class..."
              renderLabel={c => c.name}
              single
            />
          </Field>
        );
      case "all_my_students":
        return <BroadcastInfo label="all your students" />;
      default:
        return null;
    }
  };

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #701366, #9c1e8e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={16} color="white" />
            </div>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
              Send Notification
            </h2>
          </div>
          <p style={{ fontSize: "12px", color: "#a07aa0", fontFamily: "Inter, sans-serif", marginLeft: "46px" }}>
            Send notifications to your students or classes.
          </p>
        </div>

        {/* Banners */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "12px 20px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", border: "1px solid #bbf7d0", fontFamily: "Inter, sans-serif" }}>
            ✓ Notification sent successfully!
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        {/* Card */}
        <div style={{ background: "white", borderRadius: "20px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(112,19,102,0.07)", border: "1px solid #f0e0f0", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Type + Recipients */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <Field label="Notification Type">
              <select style={{ ...inputCls, cursor: "pointer" }} value={form.notification_type}
                onChange={e => setForm({ ...form, notification_type: e.target.value })}
                onFocus={focus} onBlur={blur}>
                <option value="" disabled>Select type</option>
                {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <Field label="Send To">
              <select style={{ ...inputCls, cursor: "pointer" }} value={form.target}
                onChange={e => setForm({ ...form, target: e.target.value })}
                onFocus={focus} onBlur={blur}>
                <option value="" disabled>Select recipients</option>
                {RECIPIENTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Dynamic selector */}
          {form.target && renderTargetSelector()}

          {/* Title */}
          <Field label="Title">
            <input type="text" placeholder="Enter notification title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ ...inputCls, cursor: "text" }} onFocus={focus} onBlur={blur} />
          </Field>

          {/* Message */}
          <Field label="Message">
            <textarea placeholder="Write your message here…"
              value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
              rows={5} style={{ ...inputCls, resize: "none", lineHeight: "1.55", cursor: "text" }}
              onFocus={focus} onBlur={blur} />
          </Field>

          <p style={{ fontSize: "11px", color: "#c9a8c9", fontFamily: "Inter, sans-serif", marginTop: "-12px", textAlign: "right" }}>
            {form.body.length} characters
          </p>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "4px" }}>
            <button onClick={handleCancel}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px solid #e2d0e2", color: "#701366", background: "white", borderRadius: "10px", padding: "9px 20px", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#701366"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2d0e2"}>
              Cancel
            </button>
            <button onClick={handleSend} disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #701366, #9c1e8e)", color: "white", border: "none", borderRadius: "10px", padding: "9px 24px", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s", boxShadow: "0 4px 12px rgba(112,19,102,0.25)" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}>
              <Send size={13} />
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>

        </div>
      </div>
    </Teacher_layout>
  );
}