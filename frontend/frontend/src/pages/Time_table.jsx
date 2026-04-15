import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const CELL_H = 60;
const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DAY_COLORS = [
  { bg: "#e3f0ff", border: "#2196f3", tag: "#2196f3", text: "#0d47a1" },
  { bg: "#e8f5e9", border: "#43a047", tag: "#43a047", text: "#1b5e20" },
  { bg: "#fff8e1", border: "#ffb300", tag: "#ffb300", text: "#e65100" },
  { bg: "#f3e5f5", border: "#9c27b0", tag: "#9c27b0", text: "#4a148c" },
  { bg: "#fce4ec", border: "#e91e63", tag: "#e91e63", text: "#880e4f" },
  { bg: "#e0f2f1", border: "#009688", tag: "#009688", text: "#004d40" },
  { bg: "#fff3e0", border: "#ff7043", tag: "#ff7043", text: "#bf360c" },
];

// Master list of available classes
const CLASS_OPTIONS = [
  "English A1", "English A2", "English B1", "English B2", "English C1", "English C2",
  "French A1", "French A2", "French B1", "French B2", "French C1",
  "Spanish A1", "Spanish A2", "Spanish B1", "Spanish B2", "Spanish C1",
  "Italian A1", "Italian A2", "Italian B1", "Italian B2",
  "German A1", "German A2", "German B1", "German B2",
  "Arabic A1", "Arabic A2", "Arabic B1",
];

const ROOM_OPTIONS = ["Room A1", "Room A2", "Room B1", "Room B2", "Room C1", "Lab 1"];

const INITIAL_EVENTS = [
  { id: 1,  title: "Spanish B1",  dow: 0, startHour: 8,  duration: 2, room: "Room A1" },
  { id: 2,  title: "Italian A1",  dow: 1, startHour: 9,  duration: 1, room: "Room B1" },
  { id: 3,  title: "French A1",   dow: 1, startHour: 15, duration: 2, room: "Room C1" },
  { id: 4,  title: "Italian A2",  dow: 3, startHour: 12, duration: 1, room: "Room A2" },
  { id: 5,  title: "German B2",   dow: 4, startHour: 11, duration: 1, room: "Room B2" },
  { id: 6,  title: "English C1",  dow: 3, startHour: 15, duration: 1, room: "Lab 1"   },
  { id: 7,  title: "English A2",  dow: 0, startHour: 10, duration: 2, room: "Room A1" },
  { id: 8,  title: "Spanish A1",  dow: 2, startHour: 14, duration: 2, room: "Room B1" },
  { id: 9,  title: "French B2",   dow: 5, startHour: 15, duration: 2, room: "Room C1" },
  { id: 10, title: "Spanish B2",  dow: 6, startHour: 16, duration: 2, room: "Room A2" },
];

// ──────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function dowIndex(date) {
  return (date.getDay() + 6) % 7;
}
function pad(n) {
  return String(n).padStart(2, "0");
}

// ──────────────────────────────────────────────────────
// EVENT POPUP (click on event (Edit / Delete))
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
    <div
      ref={popupRef}
      style={{
        position: "fixed",
        top: anchorRect ? Math.min(anchorRect.bottom + 8, window.innerHeight - 180) : "50%",
        left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 230) : "50%",
        zIndex: 200,
        background: "white",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(112,19,102,0.18)",
        padding: "16px",
        width: 220,
        border: `2px solid ${c.border}33`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{ev.title}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
            {DOW_FULL[ev.dow]} · {pad(ev.startHour)}:00 – {pad(ev.startHour + ev.duration)}:00
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>{ev.room}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}
        >×</button>
      </div>

      {/* Color accent bar */}
      <div style={{ height: 3, borderRadius: 2, background: c.border, marginBottom: 12 }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onEdit(ev)}
          style={{
            flex: 1, padding: "7px 0", borderRadius: 9, border: `1.5px solid #701366`,
            background: "white", color: "#701366", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
           Edit
        </button>
        <button
          onClick={() => { onDelete(ev.id); onClose(); }}
          style={{
            flex: 1, padding: "7px 0", borderRadius: 9, border: "1.5px solid #e91e63",
            background: "#fce4ec", color: "#880e4f", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
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
      style={{
        position: "absolute",
        ...style,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: size === "lg" ? 14 : 9,
        padding: size === "lg" ? "10px 14px" : "5px 7px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${c.border}44`; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ marginBottom: 3 }}>
        <span style={tagStyle(c)}>{pad(ev.startHour)}:00</span>
        <span style={tagStyle(c)}>{pad(ev.startHour + ev.duration)}:00</span>
        {size === "lg" && ev.room && (
          <span style={{ ...tagStyle(c), background: c.tag + "55", color: c.text }}>{ev.room}</span>
        )}
      </div>
      <div style={{ fontSize: size === "lg" ? 14 : 10, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>
        {ev.title}
      </div>
      {size === "sm" && ev.room && (
        <div style={{ fontSize: 9, color: c.text, opacity: 0.7, marginTop: 2 }}>{ev.room}</div>
      )}
    </div>
  );
}

function tagStyle(c) {
  return {
    display: "inline-block", fontSize: 8, fontWeight: 700, color: "#fff",
    background: c.tag, borderRadius: 4, padding: "1px 4px", marginRight: 2, marginBottom: 2,
  };
}

// ── WEEK VIEW ──
function WeekView({ cursor, events, today, onEventClick }) {
  const ws = weekStart(cursor);
  return (
    <div style={{ display: "flex", overflowX: "auto" }}>
      <div style={{ width: 38, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map((h) => (
          <div key={h} style={{ height: CELL_H, fontSize: 10, color: "#bbb", textAlign: "right", paddingRight: 6, paddingTop: 2 }}>
            {pad(h)}:00
          </div>
        ))}
      </div>
      {Array.from({ length: 7 }, (_, di) => {
        const date = addDays(ws, di);
        const isToday = isSameDay(date, today);
        const dayEvs = events.filter((e) => e.dow === di);
        return (
          <div key={di} style={{ flex: 1, minWidth: 90, position: "relative" }}>
            <div style={{ height: 44, textAlign: "center", paddingBottom: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10, color: "#999", fontWeight: 500 }}>{DOW_SHORT[di]}</span>
              <span style={{
                fontSize: isToday ? 13 : 18, fontWeight: 700, lineHeight: 1.1,
                color: isToday ? "#fff" : "#333",
                background: isToday ? "#701366" : "transparent",
                borderRadius: isToday ? "50%" : 0,
                width: isToday ? 26 : "auto", height: isToday ? 26 : "auto",
                display: isToday ? "flex" : "block",
                alignItems: "center", justifyContent: "center",
              }}>{date.getDate()}</span>
            </div>
            {HOURS.map((h) => (
              <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />
            ))}
            {dayEvs.map((ev) => (
              <EventBlock
                key={ev.id} ev={ev}
                style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 4, left: 3, right: 3, height: ev.duration * CELL_H - 8 }}
                onClick={(e) => onEventClick(ev, e)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── DAY VIEW ──
function DayView({ cursor, events, today, onEventClick }) {
  const di = dowIndex(cursor);
  const isToday = isSameDay(cursor, today);
  const dayEvs = events.filter((e) => e.dow === di);
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 52, flexShrink: 0 }}>
        <div style={{ height: 44 }} />
        {HOURS.map((h) => (
          <div key={h} style={{ height: CELL_H, fontSize: 11, color: "#bbb", textAlign: "right", paddingRight: 8, paddingTop: 2 }}>
            {pad(h)}:00
          </div>
        ))}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ height: 44, display: "flex", alignItems: "flex-end", paddingBottom: 8, paddingLeft: 8, gap: 8 }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#701366" }}>{DOW_FULL[di]}</span>
          <span style={{ fontSize: "0.85rem", color: "#999" }}>
            {cursor.getDate()} {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            {isToday ? " · Today" : ""}
          </span>
        </div>
        {HOURS.map((h) => (
          <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />
        ))}
        {dayEvs.map((ev) => (
          <EventBlock
            key={ev.id} ev={ev} size="lg"
            style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 6, left: 12, right: 12, height: ev.duration * CELL_H - 12 }}
            onClick={(e) => onEventClick(ev, e)}
          />
        ))}
      </div>
    </div>
  );
}

// ── MONTH VIEW ──
function MonthView({ cursor, events, today, onEventClick }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#f0eaf8", borderRadius: 10, overflow: "hidden" }}>
      {DOW_SHORT.map((d) => (
        <div key={d} style={{ background: "white", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#701366", padding: "8px 2px 6px", letterSpacing: "0.05em" }}>
          {d}
        </div>
      ))}
      {Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startDow + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} style={{ background: "#faf8fd", minHeight: 90 }} />;
        const cellDate = new Date(year, month, dayNum);
        const di = (cellDate.getDay() + 6) % 7;
        const isToday = isSameDay(cellDate, today);
        const c = DAY_COLORS[di];
        const dayEvs = events.filter((e) => e.dow === di);
        return (
          <div key={i} style={{ background: isToday ? "#fdf6fc" : "white", minHeight: 90, padding: 4 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: isToday ? "#fff" : "#444",
              background: isToday ? "#701366" : "transparent",
              borderRadius: "50%", width: 20, height: 20,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3,
            }}>{dayNum}</div>
            {dayEvs.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                onClick={(e) => onEventClick(ev, e)}
                style={{
                  fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "1px 5px",
                  marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  background: c.bg, color: c.text, border: `1px solid ${c.border}55`, cursor: "pointer",
                }}
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
// ADD / EDIT EVENT MODAL
// ──────────────────────────────────────────────────────
function EventModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { title: initial.title, day: String(initial.dow), startHour: String(initial.startHour), duration: String(initial.duration), room: initial.room }
      : { title: "", day: "", startHour: "8", duration: "1", room: "" }
  );

  const handleSave = () => {
    if (!form.title || form.day === "" || !form.room) return;
    onSave({
      ...(initial || {}),
      id: initial ? initial.id : Date.now(),
      title: form.title,
      dow: parseInt(form.day),
      startHour: parseInt(form.startHour),
      duration: parseInt(form.duration),
      room: form.room,
    });
  };

  const inputStyle = {
    width: "100%", border: "1.5px solid #e0d6f0", borderRadius: 10,
    padding: "9px 12px", fontSize: 13, marginBottom: 12, outline: "none",
    color: "#1a1a2e", background: "white", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: "#701366", marginBottom: 4,
    textTransform: "uppercase", letterSpacing: "0.05em", display: "block",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "white", borderRadius: 18, padding: 24, width: 340, boxShadow: "0 8px 40px rgba(112,19,102,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: "1.3rem", color: "#701366", marginBottom: 16, fontWeight: 700 }}>
          {isEdit ? " Edit Class" : " Add Class"}
        </div>

        <label style={labelStyle}>Class</label>
        <select style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
          <option value="">Select class…</option>
          {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={labelStyle}>Day</label>
        <select style={inputStyle} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          <option value="">Select day…</option>
          {DOW_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>

        <label style={labelStyle}>Start Hour</label>
        <select style={inputStyle} value={form.startHour} onChange={(e) => setForm({ ...form, startHour: e.target.value })}>
          {HOURS.map((h) => <option key={h} value={h}>{pad(h)}:00</option>)}
        </select>

        <label style={labelStyle}>Duration</label>
        <select style={inputStyle} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
          {[1, 2, 3].map((d) => <option key={d} value={d}>{d} hour{d > 1 ? "s" : ""}</option>)}
        </select>

        <label style={labelStyle}>Classroom</label>
        <select style={inputStyle} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
          <option value="">Select classroom…</option>
          {ROOM_OPTIONS.map((r) => <option key={r}>{r}</option>)}
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{ border: "1.5px solid #701366", color: "#701366", background: "white", borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ background: "#701366", color: "white", border: "1.5px solid #701366", borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
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
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [view, setView] = useState("Week");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [popup, setPopup] = useState(null); // { ev, rect }

  const todayRef = new Date();
  todayRef.setHours(0, 0, 0, 0);
  const [today] = useState(todayRef);
  const [cursor, setCursor] = useState(new Date(todayRef));

  const handleEventClick = (ev, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup({ ev, rect });
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEditRequest = (ev) => {
    setPopup(null);
    setEditingEvent(ev);
    setShowModal(true);
  };

  const handleSave = (ev) => {
    if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
    } else {
      setEvents((prev) => [...prev, ev]);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const navigate = (dir) => {
    setCursor((prev) => {
      if (view === "Week")  return addDays(prev, dir * 7);
      if (view === "Day")   return addDays(prev, dir * 1);
      if (view === "Month") return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return prev;
    });
  };

  const getNavLabel = () => {
    if (view === "Week") {
      const ws = weekStart(cursor);
      const we = addDays(ws, 6);
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0, 3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0, 3)} ${we.getFullYear()}`;
    }
    if (view === "Day") {
      return `${DOW_FULL[dowIndex(cursor)]}, ${cursor.getDate()} ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    }
    return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  };

  const btnBase = { padding: "4px 12px", borderRadius: 7, border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all .15s" };

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.6rem", color: "#701366", marginBottom: 16 }}>
        Timetable
      </h1>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setCursor(new Date(today))}
            style={{ fontSize: "0.78rem", color: "#701366", cursor: "pointer", border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "3px 10px", fontWeight: 500 }}
          >
            Today
          </button>
          <button onClick={() => navigate(-1)} style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333", minWidth: 200, textAlign: "center" }}>{getNavLabel()}</span>
          <button onClick={() => navigate(1)}  style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>›</button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 10, padding: 3, border: "1.5px solid #e0d6f0" }}>
            {["Week", "Day", "Month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{ ...btnBase, background: view === v ? "#701366" : "transparent", color: view === v ? "white" : "#888" }}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
            style={{ background: "#701366", color: "white", font:"item" ,border: "1.5px solid #701366", borderRadius: 10, padding: "7px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(112,19,102,0.07)", padding: 16, overflow: "hidden" }}>
        {view === "Week"  && <WeekView  cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
        {view === "Day"   && <DayView   cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
        {view === "Month" && <MonthView cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
      </div>

      {/* Event popup (click on event) */}
      {popup && (
        <EventPopup
          ev={popup.ev}
          anchorRect={popup.rect}
          onClose={() => setPopup(null)}
          onDelete={handleDelete}
          onEdit={handleEditRequest}
        />
      )}

      {/* Add / Edit modal */}
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