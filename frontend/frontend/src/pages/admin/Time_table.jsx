import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Loader2 } from "lucide-react";

// ──────────────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api/academic";

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────
const HOURS     = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const CELL_H    = 60;
const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// maps dow index ↔ API string
const DOW_TO_STR = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const STR_TO_DOW = Object.fromEntries(DOW_TO_STR.map((d, i) => [d, i]));

const DAY_COLORS = [
  { bg: "#e3f0ff", border: "#2196f3", tag: "#2196f3", text: "#0d47a1" },
  { bg: "#e8f5e9", border: "#43a047", tag: "#43a047", text: "#1b5e20" },
  { bg: "#fff8e1", border: "#ffb300", tag: "#ffb300", text: "#e65100" },
  { bg: "#f3e5f5", border: "#9c27b0", tag: "#9c27b0", text: "#4a148c" },
  { bg: "#fce4ec", border: "#e91e63", tag: "#e91e63", text: "#880e4f" },
  { bg: "#e0f2f1", border: "#009688", tag: "#009688", text: "#004d40" },
  { bg: "#fff3e0", border: "#ff7043", tag: "#ff7043", text: "#bf360c" },
];

// ──────────────────────────────────────────────────────
// API HELPERS
// ──────────────────────────────────────────────────────

// Convert API schedule → internal event shape
function apiToEvent(schedule, classMap) {
  const startHour = parseInt(schedule.start_time.split(":")[0], 10);
  const endHour   = parseInt(schedule.end_time.split(":")[0],   10);
  return {
    id:          schedule.id,
    title:       classMap[schedule.class_obj] ?? `Class ${schedule.class_obj}`,
    classId:     schedule.class_obj,
    classroomId: schedule.classroom?.id,
    dow:         STR_TO_DOW[schedule.day_of_week] ?? 0,
    startHour,
    duration:    endHour - startHour,
    room:        schedule.classroom?.name ?? "---",
  };
}

// Convert form state → API payload
function formToApi(form) {
  const start = parseInt(form.startHour, 10);
  const end   = start + parseInt(form.duration, 10);
  return {
    class_obj:   parseInt(form.classId,     10),
    classroom:   parseInt(form.classroomId, 10),
    day_of_week: DOW_TO_STR[parseInt(form.day, 10)],
    start_time:  `${String(start).padStart(2, "0")}:00:00`,
    end_time:    `${String(end).padStart(2, "0")}:00:00`,
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

  const totalCols = colEnds.length;
  const layout    = new Map();
  for (const ev of dayEvs) layout.set(ev.id, { col: colAssign.get(ev.id), totalCols });
  return layout;
}

// ──────────────────────────────────────────────────────
// DATE HELPERS
// ──────────────────────────────────────────────────────
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
function weekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function dowIndex(date) { return (date.getDay() + 6) % 7; }
function pad(n)         { return String(n).padStart(2, "0"); }

// ──────────────────────────────────────────────────────
// EVENT POPUP
// ──────────────────────────────────────────────────────
function EventPopup({ ev, anchorRect, onClose, onDelete, onEdit, deleting }) {
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const c = DAY_COLORS[ev.dow];

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top:  anchorRect ? Math.min(anchorRect.bottom + 8, window.innerHeight - 200) : "50%",
        left: anchorRect ? Math.min(anchorRect.left,       window.innerWidth  - 240) : "50%",
        zIndex: 200, background: "white", borderRadius: 14,
        boxShadow: "0 8px 32px rgba(112,19,102,0.18)",
        padding: 16, width: 220, border: `2px solid ${c.border}33`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{ev.title}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
            {DOW_FULL[ev.dow]} · {pad(ev.startHour)}:00 – {pad(ev.startHour + ev.duration)}:00
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>{ev.room}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ height: 3, borderRadius: 2, background: c.border, marginBottom: 12 }} />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onEdit(ev)}
          style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "1.5px solid #701366", background: "white", color: "#701366", fontSize: 12, cursor: "pointer" }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(ev.id)}
          disabled={deleting}
          style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "1.5px solid #e91e63", background: "#fce4ec", color: "#880e4f", fontSize: 12, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          {deleting ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : null}
          Delete
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// EVENT BLOCK
// ──────────────────────────────────────────────────────
function EventBlock({ ev, style, size = "sm", onClick }) {
  const c = DAY_COLORS[ev.dow];
  return (
    <div
      onClick={onClick}
      style={{ position: "absolute", ...style, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: size === "lg" ? 14 : 9, padding: size === "lg" ? "10px 14px" : "5px 7px", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${c.border}44`; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none";                      e.currentTarget.style.transform = "scale(1)"; }}
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
function tagStyle(c) {
  return { display: "inline-block", fontSize: 8, fontWeight: 500, color: "#fff", background: c.tag, borderRadius: 4, padding: "1px 4px", marginRight: 2, marginBottom: 2 };
}

// ── WEEK VIEW ──
function WeekView({ cursor, events, today, onEventClick }) {
  const ws = weekStart(cursor);
  return (
    <div style={{ display: "flex", overflowX: "auto" }}>
      <div style={{ width: 38, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map(h => <div key={h} style={{ height: CELL_H, fontSize: 10, color: "#bbb", textAlign: "right", paddingRight: 6, paddingTop: 2 }}>{pad(h)}:00</div>)}
      </div>
      {Array.from({ length: 7 }, (_, di) => {
        const date   = addDays(ws, di);
        const isToday = isSameDay(date, today);
        const dayEvs = events.filter(e => e.dow === di);
        const layout = getEventLayout(dayEvs);
        return (
          <div key={di} style={{ flex: 1, minWidth: 90, position: "relative" }}>
            <div style={{ height: 44, textAlign: "center", paddingBottom: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10, color: "#999" }}>{DOW_SHORT[di]}</span>
              <span style={{ fontSize: isToday ? 13 : 18, fontWeight: 500, lineHeight: 1.1, color: isToday ? "#fff" : "#333", background: isToday ? "#701366" : "transparent", borderRadius: isToday ? "50%" : 0, width: isToday ? 26 : "auto", height: isToday ? 26 : "auto", display: isToday ? "flex" : "block", alignItems: "center", justifyContent: "center" }}>
                {date.getDate()}
              </span>
            </div>
            {HOURS.map(h => <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />)}
            {dayEvs.map(ev => {
              const { col, totalCols } = layout.get(ev.id);
              const w = 100 / totalCols;
              return (
                <EventBlock key={ev.id} ev={ev}
                  style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 4, left: `calc(${col * w}% + 2px)`, width: `calc(${w}% - 4px)`, height: ev.duration * CELL_H - 8 }}
                  onClick={e => onEventClick(ev, e)}
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
  const di     = dowIndex(cursor);
  const isToday = isSameDay(cursor, today);
  const dayEvs = events.filter(e => e.dow === di);
  const layout = getEventLayout(dayEvs);
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 52, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map(h => <div key={h} style={{ height: CELL_H, fontSize: 11, color: "#bbb", textAlign: "right", paddingRight: 8, paddingTop: 2 }}>{pad(h)}:00</div>)}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ height: 44, display: "flex", alignItems: "flex-end", paddingBottom: 8, paddingLeft: 8, gap: 8 }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#701366" }}>{DOW_FULL[di]}</span>
          <span style={{ fontSize: "0.85rem", color: "#999" }}>{cursor.getDate()} {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}{isToday ? " · Today" : ""}</span>
        </div>
        {HOURS.map(h => <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />)}
        {dayEvs.map(ev => {
          const { col, totalCols } = layout.get(ev.id);
          const w = 100 / totalCols;
          return (
            <EventBlock key={ev.id} ev={ev} size="lg"
              style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 6, left: `calc(${col * w}% + 6px)`, width: `calc(${w}% - 12px)`, height: ev.duration * CELL_H - 12 }}
              onClick={e => onEventClick(ev, e)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── MONTH VIEW ──
function MonthView({ cursor, events, today, onEventClick }) {
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startDow  = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#f0eaf8", borderRadius: 10, overflow: "hidden" }}>
      {DOW_SHORT.map(d => <div key={d} style={{ background: "white", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#701366", padding: "8px 2px 6px", letterSpacing: "0.05em" }}>{d}</div>)}
      {Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startDow + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} style={{ background: "#faf8fd", minHeight: 90 }} />;
        const cellDate = new Date(year, month, dayNum);
        const di       = (cellDate.getDay() + 6) % 7;
        const isToday  = isSameDay(cellDate, today);
        const c        = DAY_COLORS[di];
        const dayEvs   = events.filter(e => e.dow === di);
        return (
          <div key={i} style={{ background: isToday ? "#fdf6fc" : "white", minHeight: 90, padding: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: isToday ? "#fff" : "#444", background: isToday ? "#701366" : "transparent", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>{dayNum}</div>
            {dayEvs.slice(0, 3).map(ev => (
              <div key={ev.id} onClick={e => onEventClick(ev, e)} style={{ fontSize: 8, fontWeight: 500, borderRadius: 4, padding: "1px 5px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: c.bg, color: c.text, border: `1px solid ${c.border}55`, cursor: "pointer" }}>
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
// ADD / EDIT EVENT MODAL  (connected to API)
// ──────────────────────────────────────────────────────
function EventModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;

  const [form, setForm] = useState(
    isEdit
      ? { classId: String(initial.classId), day: String(initial.dow), startHour: String(initial.startHour), duration: String(initial.duration), classroomId: String(initial.classroomId ?? "") }
      : { classId: "", day: "", startHour: "8", duration: "1", classroomId: "" }
  );

  const [classes,    setClasses]    = useState([]);    // [{ id, name }]
  const [classrooms, setClassrooms] = useState([]);    // available classrooms
  const [loadingClasses,    setLoadingClasses]    = useState(true);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Fetch classes once on mount
  useEffect(() => {
    fetch(`${API_BASE}/classes/`)
      .then(r => r.json())
      .then(data => setClasses(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setError("Failed to load classes."))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Fetch available classrooms whenever day / time changes
  useEffect(() => {
    if (form.day === "" || !form.startHour || !form.duration) return;

    const start = parseInt(form.startHour, 10);
    const end   = start + parseInt(form.duration, 10);
    const day   = DOW_TO_STR[parseInt(form.day, 10)];
    const params = new URLSearchParams({
      day_of_week: day,
      start_time:  `${String(start).padStart(2, "0")}:00:00`,
      end_time:    `${String(end).padStart(2, "0")}:00:00`,
    });

    setLoadingClassrooms(true);
    setForm(f => ({ ...f, classroomId: "" })); // reset selection when time changes

    fetch(`${API_BASE}/schedules/available_classrooms/?${params}`)
      .then(r => r.json())
      .then(data => setClassrooms(Array.isArray(data) ? data : []))
      .catch(() => setClassrooms([]))
      .finally(() => setLoadingClassrooms(false));
  }, [form.day, form.startHour, form.duration]);

  const handleSave = async () => {
    if (!form.classId || form.day === "" || !form.classroomId) {
      setError("Please fill in all fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = formToApi(form);
      const url    = isEdit ? `${API_BASE}/schedules/${initial.id}/` : `${API_BASE}/schedules/`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
  const body = await res.json();
  const firstValue = Object.values(body)?.[0];
  const message =
    body?.error ||
    body?.non_field_errors?.[0] ||
    (Array.isArray(firstValue) ? firstValue[0] : firstValue) ||  // ✅ handle both string and array
    "Something went wrong.";
  setError(message);
  return;
}

      const saved    = await res.json();
      const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]));
      onSave(apiToEvent(saved, classMap));
    } catch  {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle  = { width: "100%", border: "1.5px solid #e0d6f0", borderRadius: 10, padding: "9px 12px", fontSize: 11.5, marginBottom: 12, outline: "none", color: "#1a1a2e", background: "white", boxSizing: "border-box" };
  const labelStyle  = { fontSize: 10, fontWeight: 500, color: "#701366", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "white", borderRadius: 18, padding: 24, width: 340, boxShadow: "0 8px 40px rgba(112,19,102,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: "1.3rem", color: "#701366", marginBottom: 16, fontWeight: 500 }}>
          {isEdit ? "Edit Class" : "Add Class"}
        </div>

        {/* Class */}
        <label style={labelStyle}>Class</label>
        {loadingClasses ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "#999", fontSize: 12 }}>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Loading classes…
          </div>
        ) : (
          <select style={inputStyle} value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        {/* Day */}
        <label style={labelStyle}>Day</label>
        <select style={inputStyle} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
          <option value="">Select day…</option>
          {DOW_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>

        {/* Start Hour */}
        <label style={labelStyle}>Start Hour</label>
        <select style={inputStyle} value={form.startHour} onChange={e => setForm({ ...form, startHour: e.target.value })}>
          {HOURS.map(h => <option key={h} value={h}>{pad(h)}:00</option>)}
        </select>

        {/* Duration */}
        <label style={labelStyle}>Duration</label>
        <select style={inputStyle} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
          {[1, 2, 3].map(d => <option key={d} value={d}>{d} hour{d > 1 ? "s" : ""}</option>)}
        </select>

        {/* Classroom — loaded from available_classrooms */}
        <label style={labelStyle}>
          Classroom
          {loadingClassrooms && <span style={{ marginLeft: 6, fontSize: 9, color: "#999" }}>checking availability…</span>}
        </label>
        <select
          style={{ ...inputStyle, opacity: loadingClassrooms ? 0.5 : 1 }}
          value={form.classroomId}
          onChange={e => setForm({ ...form, classroomId: e.target.value })}
          disabled={loadingClassrooms || form.day === ""}
        >
          <option value="">
            {form.day === "" ? "Select a day first…" : classrooms.length === 0 ? "No classrooms available" : "Select classroom…"}
          </option>
          {classrooms.map(r => <option key={r.id} value={r.id}>{r.name} (cap. {r.capacity})</option>)}
        </select>

        {error && <div style={{ color: "#b91c1c", fontSize: 11, marginBottom: 8 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button onClick={onClose} style={{ border: "1.5px solid #701366", color: "#701366", background: "white", borderRadius: 10, padding: "7px 18px", fontSize: 11, cursor: "pointer" }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: "#701366", color: "white", border: "1.5px solid #701366", borderRadius: 10, padding: "7px 18px", fontSize: 11.5, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
          >
            {saving && <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />}
            {isEdit ? "Update" : "Save"}
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
  const [loadingPage,  setLoadingPage]  = useState(true);
  const [pageError,    setPageError]    = useState(null);
  const [view,         setView]         = useState("Week");
  const [showModal,    setShowModal]    = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [popup,        setPopup]        = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  const todayRef = new Date();
  todayRef.setHours(0, 0, 0, 0);
  const [today]  = useState(todayRef);
  const [cursor, setCursor] = useState(new Date(todayRef));

  // ── Load schedules on mount ──
  const loadSchedules = useCallback(async () => {
    setLoadingPage(true);
    setPageError(null);
    try {
      // Fetch schedules and classes in parallel
      const [schedRes, classRes] = await Promise.all([
        fetch(`${API_BASE}/schedules/`),
        fetch(`${API_BASE}/classes/`),
      ]);
      if (!schedRes.ok)  throw new Error(`Schedules error: ${schedRes.status}`);
      if (!classRes.ok)  throw new Error(`Classes error: ${classRes.status}`);

      const schedData = await schedRes.json();
      const classData = await classRes.json();

      const schedules = Array.isArray(schedData) ? schedData : (schedData.results ?? []);
      const classes   = Array.isArray(classData) ? classData : (classData.results ?? []);

      // Build id → name map for classes
      const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]));

      setEvents(schedules.map(s => apiToEvent(s, classMap)));
    } catch (err) {
      setPageError(err.message || "Failed to load timetable.");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  // ── Delete ──
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      setPopup(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Save (create or update) from modal ──
  const handleSave = (updatedEvent) => {
    setEvents(prev =>
      editingEvent
        ? prev.map(e => e.id === updatedEvent.id ? updatedEvent : e)
        : [...prev, updatedEvent]
    );
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleEventClick   = (ev, e) => { e.stopPropagation(); setPopup({ ev, rect: e.currentTarget.getBoundingClientRect() }); };
  const handleEditRequest  = (ev)     => { setPopup(null); setEditingEvent(ev); setShowModal(true); };

  const navigate = (dir) => {
    setCursor(prev => {
      if (view === "Week")  return addDays(prev, dir * 7);
      if (view === "Day")   return addDays(prev, dir);
      if (view === "Month") return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return prev;
    });
  };

  const getNavLabel = () => {
    if (view === "Week") {
      const ws = weekStart(cursor), we = addDays(ws, 6);
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0,3)} ${we.getFullYear()}`;
    }
    if (view === "Day") return `${DOW_FULL[dowIndex(cursor)]}, ${cursor.getDate()} ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  };

  const btnBase = { padding: "4px 12px", borderRadius: 7, border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all .15s" };

  return (
    <DashboardLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ fontSize: "1.6rem", color: "#701366", marginBottom: 16 }}>Timetable</h1>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setCursor(new Date(today))} style={{ fontSize: "0.78rem", color: "#701366", cursor: "pointer", border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "3px 10px" }}>Today</button>
          <button onClick={() => navigate(-1)} style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#333", minWidth: 200, textAlign: "center" }}>{getNavLabel()}</span>
          <button onClick={() => navigate(1)}  style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>›</button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 10, padding: 3, border: "1.5px solid #e0d6f0" }}>
            {["Week", "Day", "Month"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ ...btnBase, background: view === v ? "#701366" : "transparent", color: view === v ? "white" : "#888" }}>{v}</button>
            ))}
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
            style={{ background: "#701366", color: "white", border: "1.5px solid #701366", borderRadius: 10, padding: "7px 16px", fontSize: "0.82rem", cursor: "pointer" }}
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(112,19,102,0.07)", padding: 16, overflow: "hidden", minHeight: 400 }}>
        {loadingPage ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 8, color: "#701366", opacity: 0.6 }}>
            <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 14 }}>Loading timetable…</span>
          </div>
        ) : pageError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
            <span style={{ color: "#b91c1c", fontSize: 14 }}>{pageError}</span>
            <button onClick={loadSchedules} style={{ border: "1.5px solid #701366", color: "#701366", background: "white", borderRadius: 8, padding: "6px 16px", fontSize: 12, cursor: "pointer" }}>Retry</button>
          </div>
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
          deleting={deletingId === popup.ev.id}
        />
      )}

      {showModal && (
        <EventModal
          initial={editingEvent}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}