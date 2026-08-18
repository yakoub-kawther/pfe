import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";
import { Loader2, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────
const HOURS     = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const CELL_H    = 60;
const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DOW_API   = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DAY_COLORS = [
  { bg: "#e3f0ff", border: "#2196f3", tag: "#2196f3", text: "#0d47a1" },
  { bg: "#e8f5e9", border: "#43a047", tag: "#43a047", text: "#1b5e20" },
  { bg: "#fff8e1", border: "#ffb300", tag: "#ffb300", text: "#e65100" },
  { bg: "#f3e5f5", border: "#9c27b0", tag: "#9c27b0", text: "#4a148c" },
  { bg: "#fce4ec", border: "#e91e63", tag: "#e91e63", text: "#880e4f" },
  { bg: "#e0f2f1", border: "#009688", tag: "#009688", text: "#004d40" },
  { bg: "#fff3e0", border: "#ff7043", tag: "#ff7043", text: "#bf360c" },
];

/* ── Add/Edit modal input styles — copied verbatim from Classes.jsx
   (AddClassModal / EditClassModal) so both modals look identical. ── */
const inp = {
  width: "100%",
  border: "1px solid #e2d0e2",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};
const sel = { ...inp, cursor: "pointer" };

const Field = ({ label, children, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}) }}>
    {label && <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    {children}
  </div>
);

// ──────────────────────────────────────────────────────
// NORMALIZE API schedule → internal event shape
// ──────────────────────────────────────────────────────
// NOTE: `classStatus` tries a few likely field names from the API so
// completed classes can be filtered out of the calendar. If your
// `/academic/schedules/` payload exposes the related class's status
// under a different key (e.g. nested like `class_obj_detail.status`),
// update the fallbacks below to match your actual response shape.
function normalizeSchedule(s) {
  const dow       = DOW_API.indexOf(s.day_of_week.toLowerCase());
  const startHour = parseInt(s.start_time.split(":")[0], 10);
  const endHour   = parseInt(s.end_time.split(":")[0], 10);
  return {
    id       : s.id,
    title    : s.class_obj_name ?? `Class ${s.class_obj}`,
    dow,
    startHour,
    duration : endHour - startHour,
    room     : s.classroom?.name ?? s.classroom ?? "",
    classStatus: (
      s.class_status ??
      s.class_obj_status ??
      s.status ??
      s.class_obj_detail?.status ??
      ""
    ).toString().toLowerCase(),
    raw: s,
  };
}

// ──────────────────────────────────────────────────────
// OVERLAP LAYOUT HELPER
// ──────────────────────────────────────────────────────
function getEventLayout(dayEvs) {
  const sorted   = [...dayEvs].sort((a, b) => a.startHour - b.startHour);
  const colEnds  = [];
  const colAssign = new Map();

  for (const ev of sorted) {
    let placed = false;
    for (let i = 0; i < colEnds.length; i++) {
      if (colEnds[i] <= ev.startHour) {
        colAssign.set(ev.id, i);
        colEnds[i] = ev.startHour + ev.duration;
        placed = true;
        break;
      }
    }
    if (!placed) {
      colAssign.set(ev.id, colEnds.length);
      colEnds.push(ev.startHour + ev.duration);
    }
  }

  const totalCols = colEnds.length || 1;
  const layout    = new Map();
  for (const ev of dayEvs) {
    layout.set(ev.id, { col: colAssign.get(ev.id) ?? 0, totalCols });
  }
  return layout;
}

// ──────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function weekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function dowIndex(date)    { return (date.getDay() + 6) % 7; }
function pad(n)            { return String(n).padStart(2, "0"); }

// ──────────────────────────────────────────────────────
// EVENT POPUP (the small floating card when you click an event block —
// separate from the Add/Edit Schedule modal below)
// ──────────────────────────────────────────────────────
function EventPopup({ ev, anchorRect, onClose, onDelete, onEdit }) {
  const popupRef = useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const c = DAY_COLORS[ev.dow];
  return (
    <div ref={popupRef} style={{
      position: "fixed",
      top : anchorRect ? Math.min(anchorRect.bottom + 8, window.innerHeight - 190) : "50%",
      left: anchorRect ? Math.min(anchorRect.left,       window.innerWidth  - 240) : "50%",
      zIndex: 200,
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(112,19,102,0.16)",
      padding: "18px",
      width: 224,
      boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#701366" }}>{ev.title}</div>
          <div style={{ fontSize: "11px", color: "#701366", opacity: 0.55, marginTop: 3 }}>
            {DOW_FULL[ev.dow]} · {pad(ev.startHour)}:00 – {pad(ev.startHour + ev.duration)}:00
          </div>
          {ev.room && <div style={{ fontSize: "11px", color: "#701366", opacity: 0.55 }}>{ev.room}</div>}
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", fontSize: "18px", color: "#701366", opacity: 0.4, cursor: "pointer", lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>

      <span
        style={{
          display: "inline-block", fontSize: "10px", fontWeight: 600,
          color: c.text, background: c.bg, border: `1px solid ${c.border}55`,
          borderRadius: "999px", padding: "2px 9px", marginBottom: "14px",
        }}
      >
        {ev.room || "No room"}
      </span>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          aria-label="Edit"
          onClick={() => onEdit(ev)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "7px 0", borderRadius: "8px", border: "1px solid #701366",
            background: "white", color: "#701366", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
        >
          <SquarePen size={14} /> Edit
        </button>
        <button
          aria-label="Delete"
          onClick={() => { onDelete(ev.id); onClose(); }}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "7px 0", borderRadius: "8px", border: "1px solid #c92c2c",
            background: "white", color: "#c92c2c", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#c92c2c"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#c92c2c"; }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// EVENT BLOCK
// ──────────────────────────────────────────────────────
function tagStyle(c) {
  return { display: "inline-block", fontSize: 8, fontWeight: 500, color: "#fff", background: c.tag, borderRadius: 4, padding: "1px 4px", marginRight: 2, marginBottom: 2 };
}

function EventBlock({ ev, style, size = "sm", onClick }) {
  const c = DAY_COLORS[ev.dow];
  return (
    <div
      onClick={onClick}
      style={{ position: "absolute", ...style, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: size === "lg" ? 14 : 9, padding: size === "lg" ? "10px 14px" : "5px 7px", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${c.border}44`; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ marginBottom: 3 }}>
        <span style={tagStyle(c)}>{pad(ev.startHour)}:00</span>
        <span style={tagStyle(c)}>{pad(ev.startHour + ev.duration)}:00</span>
        {size === "lg" && ev.room && <span style={{ ...tagStyle(c), background: c.tag + "55", color: c.text }}>{ev.room}</span>}
      </div>
      <div style={{ fontSize: size === "lg" ? 14 : 10, fontWeight: 500, color: c.text, lineHeight: 1.2 }}>{ev.title}</div>
      {size === "sm" && ev.room && <div style={{ fontSize: 9, color: c.text, opacity: 0.7, marginTop: 2 }}>{ev.room}</div>}
    </div>
  );
}

// ── WEEK VIEW ──
function WeekView({ cursor, events, today, onEventClick }) {
  const ws = weekStart(cursor);
  return (
    <div style={{ display: "flex", overflowX: "auto" }}>
      <div style={{ width: 38, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map((h) => (
          <div key={h} style={{ height: CELL_H, fontSize: 10, color: "#bbb", textAlign: "right", paddingRight: 6, paddingTop: 2 }}>{pad(h)}:00</div>
        ))}
      </div>
      {Array.from({ length: 7 }, (_, di) => {
        const date   = addDays(ws, di);
        const isToday = isSameDay(date, today);
        const dayEvs  = events.filter((e) => e.dow === di);
        const layout  = getEventLayout(dayEvs);
        return (
          <div key={di} style={{ flex: 1, minWidth: 90, position: "relative" }}>
            <div style={{ height: 44, textAlign: "center", paddingBottom: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10, color: "#999" }}>{DOW_SHORT[di]}</span>
              <span style={{ fontSize: isToday ? 13 : 18, fontWeight: 500, lineHeight: 1.1, color: isToday ? "#fff" : "#333", background: isToday ? "#701366" : "transparent", borderRadius: isToday ? "50%" : 0, width: isToday ? 26 : "auto", height: isToday ? 26 : "auto", display: isToday ? "flex" : "block", alignItems: "center", justifyContent: "center" }}>{date.getDate()}</span>
            </div>
            {HOURS.map((h) => <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />)}
            {dayEvs.map((ev) => {
              const { col, totalCols } = layout.get(ev.id);
              const widthPct = 100 / totalCols;
              return (
                <EventBlock key={ev.id} ev={ev}
                  style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 4, left: `calc(${col * widthPct}% + 2px)`, width: `calc(${widthPct}% - 4px)`, height: ev.duration * CELL_H - 8 }}
                  onClick={(e) => onEventClick(ev, e)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── DAY VIEW ──
function DayView({ cursor, events, today, onEventClick }) {
  const di      = dowIndex(cursor);
  const isToday = isSameDay(cursor, today);
  const dayEvs  = events.filter((e) => e.dow === di);
  const layout  = getEventLayout(dayEvs);
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 52, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map((h) => <div key={h} style={{ height: CELL_H, fontSize: 11, color: "#bbb", textAlign: "right", paddingRight: 8, paddingTop: 2 }}>{pad(h)}:00</div>)}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ height: 44, display: "flex", alignItems: "flex-end", paddingBottom: 8, paddingLeft: 8, gap: 8 }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#701366" }}>{DOW_FULL[di]}</span>
          <span style={{ fontSize: "0.85rem", color: "#999" }}>{cursor.getDate()} {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}{isToday ? " · Today" : ""}</span>
        </div>
        {HOURS.map((h) => <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />)}
        {dayEvs.map((ev) => {
          const { col, totalCols } = layout.get(ev.id);
          const widthPct = 100 / totalCols;
          return (
            <EventBlock key={ev.id} ev={ev} size="lg"
              style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 6, left: `calc(${col * widthPct}% + 6px)`, width: `calc(${widthPct}% - 12px)`, height: ev.duration * CELL_H - 12 }}
              onClick={(e) => onEventClick(ev, e)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── MONTH VIEW ──
function MonthView({ cursor, events, today, onEventClick }) {
  const year       = cursor.getFullYear();
  const month      = cursor.getMonth();
  const firstDay   = new Date(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0);
  const startDow   = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#f0eaf8", borderRadius: 10, overflow: "hidden" }}>
      {DOW_SHORT.map((d) => (
        <div key={d} style={{ background: "white", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#701366", padding: "8px 2px 6px", letterSpacing: "0.05em" }}>{d}</div>
      ))}
      {Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startDow + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} style={{ background: "#faf8fd", minHeight: 90 }} />;
        const cellDate = new Date(year, month, dayNum);
        const di       = (cellDate.getDay() + 6) % 7;
        const isToday  = isSameDay(cellDate, today);
        const c        = DAY_COLORS[di];
        const dayEvs   = events.filter((e) => e.dow === di);
        return (
          <div key={i} style={{ background: isToday ? "#fdf6fc" : "white", minHeight: 90, padding: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: isToday ? "#fff" : "#444", background: isToday ? "#701366" : "transparent", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>{dayNum}</div>
            {dayEvs.slice(0, 3).map((ev) => (
              <div key={ev.id} onClick={(e) => onEventClick(ev, e)}
                style={{ fontSize: 8, fontWeight: 500, borderRadius: 4, padding: "1px 5px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: c.bg, color: c.text, border: `1px solid ${c.border}55`, cursor: "pointer" }}
              >
                {pad(ev.startHour)} {ev.title}
              </div>
            ))}
            {dayEvs.length > 3 && <div style={{ fontSize: 8, color: "#999", paddingLeft: 2 }}>+{dayEvs.length - 3} more</div>}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// ADD / EDIT SCHEDULE MODAL
// Rebuilt to match Classes.jsx's AddClassModal / EditClassModal exactly:
// same 20px-radius card, same header/× close, same Field/inp/sel
// components, same grid layout and footer button styling.
// ──────────────────────────────────────────────────────
function EventModal({ initial, onClose, onSave, classes, classrooms, loadingOptions }) {
  const isEdit = !!initial;

  const [form, setForm] = useState(
    initial ? {
      class_obj : String(initial.raw.class_obj),
      classroom : String(initial.raw.classroom?.id ?? initial.raw.classroom),
      day       : initial.raw.day_of_week,
      startHour : String(initial.startHour),
      endHour   : String(initial.startHour + initial.duration),
    } : {
      class_obj: "", classroom: "", day: "", startHour: "8", endHour: "9",
    }
  );

  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");

  const [availableRooms, setAvailableRooms] = useState(classrooms);
  const [loadingRooms,   setLoadingRooms]   = useState(false);

  useEffect(() => {
    if (!form.day || !form.startHour || !form.endHour) return;
    setLoadingRooms(true);
    apiFetch(
      `/academic/schedules/available_classrooms/?day_of_week=${form.day}&start_time=${pad(form.startHour)}:00&end_time=${pad(form.endHour)}:00`
    )
      .then((r) => r.json())
      .then((data) => setAvailableRooms(Array.isArray(data) ? data : classrooms))
      .catch(() => setAvailableRooms(classrooms))
      .finally(() => setLoadingRooms(false));
  }, [form.day, form.startHour, form.endHour, classrooms]);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.class_obj || !form.day || !form.classroom) { setError("All fields are required."); return; }
    if (parseInt(form.endHour) <= parseInt(form.startHour)) { setError("End time must be after start time."); return; }

    setSaving(true);
    setError("");
    try {
      const body = {
        class_obj  : parseInt(form.class_obj),
        classroom  : parseInt(form.classroom),
        day_of_week: form.day,
        start_time : `${pad(form.startHour)}:00`,
        end_time   : `${pad(form.endHour)}:00`,
      };

      const res = isEdit
        ? await apiFetch(`/academic/schedules/${initial.id}/`, { method: "PATCH", body })
        : await apiFetch("/academic/schedules/",              { method: "POST",  body });

      if (!res.ok) {
        const data = await res.json();
        let msg = "Failed to save. Please try again.";
        if (Array.isArray(data) && data.length > 0) msg = data[0];
        else if (typeof data === "string") msg = data;
        else if (data?.error) msg = data.error;
        else if (data?.detail) msg = data.detail;
        else if (typeof data === "object") { const first = Object.values(data)[0]; msg = Array.isArray(first) ? first[0] : String(first); }
        setError(msg);
        return;
      }

      const saved = await res.json();
      onSave(normalizeSchedule(saved));

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(112,19,102,0.18)", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", margin: 0 }}>
            {isEdit ? "Edit Schedule" : "Add New Schedule"}
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", color: "#701366", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "18px" }}>
            {error}
          </div>
        )}

        {loadingOptions ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0", color: "#701366", opacity: 0.6 }}>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px" }}>Loading options...</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

            <Field label="Class" full>
              <select style={sel} value={form.class_obj} onChange={handle("class_obj")}>
                <option value="">Select class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name ?? c.class_name ?? `Class ${c.id}`}</option>
                ))}
              </select>
            </Field>

            <Field label="Day">
              <select style={sel} value={form.day} onChange={handle("day")}>
                <option value="">Select day…</option>
                {DOW_API.map((d, i) => <option key={d} value={d}>{DOW_FULL[i]}</option>)}
              </select>
            </Field>

            <Field label="Classroom" >
              <select style={sel} value={form.classroom} onChange={handle("classroom")}>
                <option value="">
                  {loadingRooms ? "Checking availability…" : "Select classroom…"}
                </option>
                {availableRooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>

            <Field label="Start Time">
              <select style={sel} value={form.startHour} onChange={handle("startHour")}>
                {HOURS.map((h) => <option key={h} value={h}>{pad(h)}:00</option>)}
              </select>
            </Field>

            <Field label="End Time">
              <select style={sel} value={form.endHour} onChange={handle("endHour")}>
                {HOURS.filter((h) => h > parseInt(form.startHour)).map((h) => <option key={h} value={h}>{pad(h)}:00</option>)}
              </select>
            </Field>

          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#701366"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#e2d0e2"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: saving ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: saving ? "not-allowed" : "pointer", fontWeight: "600" }}
            onMouseEnter={(e) => { if (!saving) e.target.style.background = "#5a0f52"; }}
            onMouseLeave={(e) => { if (!saving) e.target.style.background = "#701366"; }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────
export default function Time_table() {
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [view,         setView]         = useState("Week");
  const [showModal,    setShowModal]    = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [popup,        setPopup]        = useState(null);

  const [classes,        setClasses]        = useState([]);
  const [classrooms,     setClassrooms]     = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const todayRef = new Date(); todayRef.setHours(0, 0, 0, 0);
  const [today]  = useState(todayRef);
  const [cursor, setCursor] = useState(new Date(todayRef));

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await apiFetch("/academic/schedules/");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      // Hide schedules whose class has already finished — completed
      // classes shouldn't clutter the live timetable. See the
      // `classStatus` field-name assumptions in normalizeSchedule above.
      setEvents(list.map(normalizeSchedule).filter((ev) => ev.classStatus !== "completed"));
    } catch (err) {
      setError(err.message || "Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const fetchOptions = useCallback(async (currentClassId = null) => {
    setLoadingOptions(true);
    try {
      const [cRes, rRes] = await Promise.all([
        apiFetch("/academic/classes/?status=scheduled"),
        apiFetch("/academic/classrooms/"),
      ]);
      const cData = await cRes.json();
      const rData = await rRes.json();
      let classList = Array.isArray(cData) ? cData : (cData.results ?? []);

      if (currentClassId && !classList.some((c) => String(c.id) === String(currentClassId))) {
        try {
          const curRes = await apiFetch(`/academic/classes/${currentClassId}/`);
          if (curRes.ok) {
            const curClass = await curRes.json();
            classList = [curClass, ...classList];
          }
        } catch {
          // ignore — edit modal will just be missing that one option
        }
      }

      setClasses(classList);
      setClassrooms(Array.isArray(rData) ? rData : (rData.results ?? []));
    } catch {
      // silently fail — modal will show empty dropdowns
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const handleEventClick = (ev, e) => {
    e.stopPropagation();
    setPopup({ ev, rect: e.currentTarget.getBoundingClientRect() });
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/academic/schedules/${id}/`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    }
  };

  const handleEditRequest = (ev) => {
    setPopup(null);
    setEditingEvent(ev);
    fetchOptions(ev.raw.class_obj);
    setShowModal(true);
  };

  const handleSave = (normalizedEvent) => {
    if (normalizedEvent.classStatus === "completed") {
      // Just-saved schedule belongs to a class that's already completed
      // (shouldn't normally happen, but guard against showing it anyway).
      setEvents((prev) => prev.filter((e) => e.id !== normalizedEvent.id));
    } else if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === normalizedEvent.id ? normalizedEvent : e)));
    } else {
      setEvents((prev) => [...prev, normalizedEvent]);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const navigate = (dir) => {
    setCursor((prev) => {
      if (view === "Week")  return addDays(prev, dir * 7);
      if (view === "Day")   return addDays(prev, dir);
      if (view === "Month") return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return prev;
    });
  };

  const getNavLabel = () => {
    if (view === "Week") {
      const ws = weekStart(cursor);
      const we = addDays(ws, 6);
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0,3)} ${we.getFullYear()}`;
    }
    if (view === "Day") return `${DOW_FULL[dowIndex(cursor)]}, ${cursor.getDate()} ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  };

  // ── Shared button styles — copied 1:1 from Classes.jsx's pagination
  // iconBtn/pageBtn pattern, reused here for the date-nav chevrons and
  // the Week/Day/Month view switcher so both pages feel identical. ──
  const iconBtn = {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #701366",
    background: "white",
    color: "#701366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  };

  const viewTabBtn = (active) => ({
    padding: "6px 16px",
    height: "32px",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1px solid #701366",
    background: active ? "#701366" : "white",
    color: active ? "white" : "#701366",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Page Title — matches Classes.jsx */}
        <div style={{ marginBottom: "4px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#701366",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Timetable
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#701366",
            opacity: 0.55,
            margin: "4px 0 0",
          }}>
            View and manage class schedules
          </p>
        </div>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setCursor(new Date(today))}
              style={viewTabBtn(false)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              Today
            </button>

            <button
              style={iconBtn}
              onClick={() => navigate(-1)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: "14px", fontWeight: 600, color: "#701366", minWidth: "210px", textAlign: "center" }}>
              {getNavLabel()}
            </span>

            <button
              style={iconBtn}
              onClick={() => navigate(1)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* View tabs — outlined pills, same border/radius/height as
                the pagination iconBtn on Classes.jsx for visual parity */}
            <div style={{ display: "flex", gap: "8px" }}>
              {["Week", "Day", "Month"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={viewTabBtn(view === v)}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Add — icon-only "+", identical to Classes.jsx's Add Class button */}
            <button
              onClick={() => { setEditingEvent(null); fetchOptions(); setShowModal(true); }}
              aria-label="Add Schedule"
              style={{
                width: "38px", height: "38px", flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: "10px", background: "#701366", color: "white",
                border: "2px solid #701366", cursor: "pointer",
                transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 8px rgba(112,19,102,.13)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(112,19,102,.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(112,19,102,.13)"; }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Calendar card */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "16px", overflow: "hidden", boxSizing: "border-box" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: "#701366", opacity: 0.6 }}>
              <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "14px" }}>Loading timetable…</span>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#dc2626", fontSize: "14px" }}>{error}</div>
          ) : (
            <>
              {view === "Week"  && <WeekView  cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
              {view === "Day"   && <DayView   cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
              {view === "Month" && <MonthView cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
            </>
          )}
        </div>

        {popup && (
          <EventPopup
            ev={popup.ev} anchorRect={popup.rect}
            onClose={() => setPopup(null)}
            onDelete={handleDelete}
            onEdit={handleEditRequest}
          />
        )}

        {showModal && (
          <EventModal
            initial={editingEvent}
            onClose={() => { setShowModal(false); setEditingEvent(null); }}
            onSave={handleSave}
            classes={classes}
            classrooms={classrooms}
            loadingOptions={loadingOptions}
          />
        )}

      </div>
    </DashboardLayout>
  );
}