import { useState, useRef, useEffect } from "react";
import Student_layout from "../../layouts/Student_layout";

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const CELL_H = 60;
const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

// Classes assigned to this teacher
const TEACHER_CLASSES = [
  { id: 1, name: "Eng-A2", language: "English", level: "A2", room: "Room A1" },
  { id: 2, name: "Eng-B1", language: "English", level: "B1", room: "Room B1" },
  { id: 3, name: "Fr-A1",  language: "French",  level: "A1", room: "Room C1" },
  { id: 4, name: "Eng-C1", language: "English", level: "C1", room: "Lab 1"   },
];

// All events — each event has a classId linking it to a class
const ALL_EVENTS = [
  // Eng-A2
  { id: 1,  classId: 1, title: "Eng-A2", dow: 0, startHour: 10, duration: 2, room: "Room A1" },
  { id: 2,  classId: 1, title: "Eng-A2", dow: 2, startHour: 10, duration: 2, room: "Room A1" },
  // Eng-B1
  { id: 3,  classId: 2, title: "Eng-B1", dow: 1, startHour: 14, duration: 2, room: "Room B1" },
  { id: 4,  classId: 2, title: "Eng-B1", dow: 3, startHour: 14, duration: 2, room: "Room B1" },
  // Fr-A1
  { id: 5,  classId: 3, title: "Fr-A1",  dow: 0, startHour: 9,  duration: 1, room: "Room C1" },
  { id: 6,  classId: 3, title: "Fr-A1",  dow: 4, startHour: 9,  duration: 1, room: "Room C1" },
  // Eng-C1
  { id: 7,  classId: 4, title: "Eng-C1", dow: 2, startHour: 11, duration: 1, room: "Lab 1"   },
  { id: 8,  classId: 4, title: "Eng-C1", dow: 4, startHour: 11, duration: 1, room: "Lab 1"   },
];

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
  const layout = new Map();
  for (const ev of dayEvs) layout.set(ev.id, { col: colAssign.get(ev.id), totalCols });
  return layout;
}

// ──────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function dowIndex(date)   { return (date.getDay() + 6) % 7; }
function pad(n)           { return String(n).padStart(2, "0"); }

// ──────────────────────────────────────────────────────
// INFO POPUP — read only
// ──────────────────────────────────────────────────────
function EventPopup({ ev, anchorRect, onClose }) {
  const popupRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (popupRef.current && !popupRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const c = DAY_COLORS[ev.dow];
  return (
    <div ref={popupRef} style={{
      position: "fixed",
      top:  anchorRect ? Math.min(anchorRect.bottom + 8, window.innerHeight - 160) : "50%",
      left: anchorRect ? Math.min(anchorRect.left,       window.innerWidth  - 230) : "50%",
      zIndex: 200, background: "white", borderRadius: 14,
      boxShadow: "0 8px 32px rgba(112,19,102,0.18)",
      padding: "16px", width: 220, border: `2px solid ${c.border}33`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{ev.title}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{DOW_FULL[ev.dow]}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{pad(ev.startHour)}:00 – {pad(ev.startHour + ev.duration)}:00</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>📍 {ev.room}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: c.border, marginTop: 12 }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────
// EVENT BLOCK
// ──────────────────────────────────────────────────────
function EventBlock({ ev, style, size = "sm", onClick }) {
  const c = DAY_COLORS[ev.dow];
  return (
    <div onClick={onClick} style={{
      position: "absolute", ...style,
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: size === "lg" ? 14 : 9,
      padding: size === "lg" ? "10px 14px" : "5px 7px",
      overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s",
    }}
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
              <span style={{ fontSize: isToday ? 13 : 18, fontWeight: 500, lineHeight: 1.1, color: isToday ? "#fff" : "#333", background: isToday ? "#701366" : "transparent", borderRadius: isToday ? "50%" : 0, width: isToday ? 26 : "auto", height: isToday ? 26 : "auto", display: isToday ? "flex" : "block", alignItems: "center", justifyContent: "center" }}>{date.getDate()}</span>
            </div>
            {HOURS.map(h => <div key={h} style={{ height: CELL_H, borderTop: "1px solid #f0eaf8" }} />)}
            {dayEvs.map(ev => {
              const { col, totalCols } = layout.get(ev.id);
              const w = 100 / totalCols;
              return <EventBlock key={ev.id} ev={ev} style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 4, left: `calc(${col * w}% + 2px)`, width: `calc(${w}% - 4px)`, height: ev.duration * CELL_H - 8 }} onClick={e => onEventClick(ev, e)} />;
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
  const dayEvs  = events.filter(e => e.dow === di);
  const layout  = getEventLayout(dayEvs);
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
          return <EventBlock key={ev.id} ev={ev} size="lg" style={{ top: 44 + (ev.startHour - HOURS[0]) * CELL_H + 6, left: `calc(${col * w}% + 6px)`, width: `calc(${w}% - 12px)`, height: ev.duration * CELL_H - 12 }} onClick={e => onEventClick(ev, e)} />;
        })}
      </div>
    </div>
  );
}

// ── MONTH VIEW ──
function MonthView({ cursor, events, today, onEventClick }) {
  const year  = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay   = new Date(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0);
  const startDow   = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#f0eaf8", borderRadius: 10, overflow: "hidden" }}>
      {DOW_SHORT.map(d => <div key={d} style={{ background: "white", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#701366", padding: "8px 2px 6px", letterSpacing: "0.05em" }}>{d}</div>)}
      {Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startDow + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={i} style={{ background: "#faf8fd", minHeight: 90 }} />;
        const cellDate = new Date(year, month, dayNum);
        const di      = (cellDate.getDay() + 6) % 7;
        const isToday = isSameDay(cellDate, today);
        const c       = DAY_COLORS[di];
        const dayEvs  = events.filter(e => e.dow === di);
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
// MAIN COMPONENT
// ──────────────────────────────────────────────────────
export default function Time_table_student() {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [view,   setView]   = useState("Week");
  const [popup,  setPopup]  = useState(null);

  const todayRef = new Date(); todayRef.setHours(0, 0, 0, 0);
  const [today]  = useState(todayRef);
  const [cursor, setCursor] = useState(new Date(todayRef));

  // Filter events to only the selected class
  const events = selectedClassId
    ? ALL_EVENTS.filter(e => e.classId === selectedClassId)
    : [];

  const selectedClass = TEACHER_CLASSES.find(c => c.id === selectedClassId);

  const handleEventClick = (ev, e) => {
    e.stopPropagation();
    setPopup({ ev, rect: e.currentTarget.getBoundingClientRect() });
  };

  const navigate = (dir) => {
    setCursor(prev => {
      if (view === "Week")  return addDays(prev, dir * 7);
      if (view === "Day")   return addDays(prev, dir * 1);
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

  const levelColors = { A1: "#e0f2fe", A2: "#dbeafe", B1: "#ede9fe", B2: "#fae8ff", C1: "#fce7f3", C2: "#ffe4e6" };
  const levelText   = { A1: "#0369a1", A2: "#1d4ed8", B1: "#7c3aed", B2: "#a21caf", C1: "#be185d", C2: "#be123c" };

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto",fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="flex items-center justify-between mb-8">

            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
          Time table
          </h2>
        </div>

        {/* ── CLASS SELECTOR ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#b48ab0", marginBottom: 12 }}>Select a class to view its timetable</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TEACHER_CLASSES.map(cls => {
              const isSelected = selectedClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  style={{
                    padding: "10px 20px", borderRadius: 12, cursor: "pointer",
                    border: isSelected ? "2px solid #701366" : "2px solid #f0d8ee",
                    background: isSelected ? "#701366" : "white",
                    boxShadow: isSelected ? "0 4px 14px rgba(112,19,102,0.2)" : "0 1px 4px rgba(112,19,102,0.06)",
                    transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? "white" : "#701366" }}>{cls.name}</div>
                    <div style={{ fontSize: 11, color: isSelected ? "#f0d8ee" : "#b48ab0", marginTop: 2 }}>{cls.language} · {cls.room}</div>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
                    background: isSelected ? "rgba(255,255,255,0.2)" : (levelColors[cls.level] || "#f3f4f6"),
                    color: isSelected ? "white" : (levelText[cls.level] || "#374151"),
                  }}>
                    {cls.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── TIMETABLE — shown only after a class is selected ── */}
        {!selectedClass ? (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f5e0f3", padding: "60px 24px", textAlign: "center", color: "#b48ab0", fontSize: 14 }}>
            Select a class above to view its Timetable
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setCursor(new Date(today))}
                  style={{ fontSize: "0.78rem", color: "#701366", cursor: "pointer", border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "3px 10px", fontWeight: 400 }}
                >
                  Today
                </button>
                <button onClick={() => navigate(-1)} style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>‹</button>
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#333", minWidth: 200, textAlign: "center" }}>{getNavLabel()}</span>
                <button onClick={() => navigate(1)}  style={{ border: "1.5px solid #e0d6f0", background: "white", borderRadius: 8, padding: "2px 10px", fontSize: "1rem", color: "#701366", cursor: "pointer" }}>›</button>
              </div>

              <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 10, padding: 3, border: "1.5px solid #e0d6f0" }}>
                {["Week", "Day", "Month"].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ ...btnBase, background: view === v ? "#701366" : "transparent", color: view === v ? "white" : "#888" }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Calendar card */}
            <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(112,19,102,0.07)", padding: 16, overflow: "hidden" }}>
              {view === "Week"  && <WeekView  cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
              {view === "Day"   && <DayView   cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
              {view === "Month" && <MonthView cursor={cursor} events={events} today={today} onEventClick={handleEventClick} />}
            </div>
          </>
        )}

        {popup && (
          <EventPopup ev={popup.ev} anchorRect={popup.rect} onClose={() => setPopup(null)} />
        )}

      </div>
    </Student_layout>
  );
}