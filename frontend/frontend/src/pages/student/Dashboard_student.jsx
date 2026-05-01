import React from "react";
import { useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import {
  UserPlus, CreditCard, Bell, ChevronRight,
  BookOpen, GraduationCap, CheckCircle, Clock, Users, CalendarDays,
} from "lucide-react";
import {
  BarChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Bar, Cell,
} from "recharts";

// ─── LOGGED-IN STUDENT ─────────────────────────────────────────
const CURRENT_STUDENT = "John Doe";

// ─── ALL SESSIONS (in a real app, fetched & filtered by student ID) ──────────
const allClasses = [
  { subject: "English – A2",  teacher: "Prof. Smith",  days: "Mon & Wed", time: "8:00–10:00 AM",  room: "Salle A", students: 18, bg: "#fce4ec", sc: "#c2185b", mc: "#e91e63" },
  { subject: "English – B1",  teacher: "Prof. Smith",  days: "Tue & Thu", time: "10:00–12:00 PM", room: "Salle B", students: 14, bg: "#fce4ec", sc: "#c2185b", mc: "#e91e63" },
  { subject: "English – C1",  teacher: "Prof. Smith",  days: "Sat",       time: "9:00–11:00 AM",  room: "Salle A", students: 10, bg: "#fce4ec", sc: "#c2185b", mc: "#e91e63" },
  { subject: "Espagnol – A1", teacher: "Dr. Johnson",  days: "Tue & Thu", time: "1:00–3:00 PM",   room: "Salle C", students: 20, bg: "#fffde7", sc: "#f9a825", mc: "#f57f17" },
  { subject: "French – B1",   teacher: "Prof. Davis",  days: "Mon & Sat", time: "9:00–12:00 PM",  room: "Salle D", students: 16, bg: "#e3f2fd", sc: "#1565c0", mc: "#1976d2" },
  { subject: "German – A2",   teacher: "Dr. Martinez", days: "Wednesday", time: "2:00–5:00 PM",   room: "Salle D", students: 12, bg: "#e8f5e9", sc: "#2e7d32", mc: "#388e3c" },
];

// Sessions that belong to the current student
const myClasses = allClasses.filter((c) => c.teacher === CURRENT_STUDENT);

// ─── DERIVED STATS ─────────────────────────────────────────────
const totalClasses  = myClasses.length;
const totalStudents = myClasses.reduce((sum, c) => sum + c.students, 0);
const totalHours    = myClasses.length * 2; // rough estimate: 2h avg per session/week

// ─── SHARED CARD STYLE ─────────────────────────────────────────
const card = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #f0f0f5",
  boxShadow: "0 1px 3px rgba(120,80,180,0.07)",
  boxSizing: "border-box",
};

// ─── STAT CARD ─────────────────────────────────────────────────
const StatCard = ({ Icon, iconColor, value, label }) => (
  <div style={{
    ...card,
    padding: "2.4rem 1rem",
    minHeight: "80px",
    fontSize: "clamp(0.9rem, 1vw, 1.2rem)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: "1 1 0",
    minWidth: 0,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: "#f3f0ff", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={14} color={iconColor} strokeWidth={1.7} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "clamp(1rem, 1.3vw, 1.4rem)", fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#1a1a2e", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.85rem)", color: "#9e9eb8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    </div>
  </div>
);

// ─── DASHBOARD ─────────────────────────────────────────────────
const Dashboard_student = () => {
  const navigate = useNavigate();

  return (
    <Student_layout>
      <div style={{
        padding: "0.625rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
      }}>

        {/* ── Row 1: [Stats + Quick Actions] | [Welcome Back] ── */}
        <div style={{ display: "flex", gap: "clamp(6px, 1vw, 14px)" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>

            {/* Stats — teacher-scoped */}
            <div style={{ display: "flex", fontSize: "1rem", gap: 6, minWidth: 0 }}>
              <StatCard Icon={BookOpen}     iconColor="#7c3aed" value={totalClasses}  label="My Classes"        />
              <StatCard Icon={Users}        iconColor="#2563eb" value={totalStudents} label="My Students"       />
              <StatCard Icon={CalendarDays} iconColor="#16a34a" value={`${totalHours}h`} label="Weekly Hours"   />
              <StatCard Icon={CheckCircle}  iconColor="#d97706" value="3"             label="Sessions Today"    />
              <StatCard Icon={Clock}        iconColor="#e11d48" value="1"             label="Upcoming Session"  />
            </div>

            {/* Quick Actions */}
            <div style={{
              ...card,
              padding: "0.625rem 1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexShrink: 0,
              alignSelf: "stretch",
            }}>
              <div style={{ fontSize: "0.625rem", fontWeight: 500, color: "#9e9eb8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
                {[
                  { label: "Attendance",        Icon: UserPlus,  color: "#7c3aed", bg: "#f3f0ff", path: "/Classes_teacher"    },
                  { label: "Notes",             Icon: CreditCard, color: "#d97706", bg: "#fffbeb", path: "/Notes_teacher"         },
                  { label: "Send Notification", Icon: Bell,      color: "#0ea5e9", bg: "#f0f9ff", path: "/Notifications_teacher" },
                ].map(({ label, Icon, color, bg, path }) => (
                  <button key={label} onClick={() => navigate(path)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: bg, border: "none", borderRadius: 8,
                    cursor: "pointer", padding: "5px 0.625rem",
                    fontSize: "0.875rem", fontWeight: 600, color,
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    <Icon size={11} strokeWidth={2} /> {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Welcome Back */}
          <div style={{
            width: 185,
            flexShrink: 0,
            borderRadius: 12,
            background: "#fff",
            border: "1px solid #f0f0f5",
            boxShadow: "0 1px 3px rgba(120,80,180,0.07)",
            padding: "12px 14px 0 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden",
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: "0.5rem", fontWeight: 500, color: "#9e9eb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Student</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginTop: 4 }}>WELCOME BACK</div>
            <div style={{ fontSize: "0.6rem", color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{CURRENT_STUDENT}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", minHeight: 0 }}>
              <img
                src="/src/assets/welcomeback.svg"
                alt="Welcome Back"
                style={{ width: "100%", maxHeight: 140, objectFit: "contain", objectPosition: "bottom center", display: "block" }}
              />
            </div>
          </div>

        </div>

        {/* ── Row 2: Daily Overview — only this teacher's sessions ── */}
        <div style={{ flexShrink: 0, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "clamp(6px, 1vw, 10px)", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: "clamp(0.75rem, 1vw, 1rem)", fontWeight: 600, color: "#1a1a2e" }}>
              My Sessions
            </div>
            <button onClick={() => navigate("/Timetable_teacher")} style={{
              display: "flex", alignItems: "center", gap: 2,
              background: "none", border: "none", cursor: "pointer",
              padding: 0, fontSize: "clamp(0.65rem, 0.8vw, 0.65rem)", fontWeight: 500, color: "#701366",
              flexShrink: 0,
            }}>
              View Timetable <ChevronRight size={11} />
            </button>
          </div>

          {myClasses.length === 0 ? (
            <div style={{ ...card, padding: "24px", textAlign: "center", color: "#9e9eb8", fontSize: "0.85rem" }}>
              No sessions assigned yet.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(myClasses.length, 4)}, 1fr)`,
              gap: 8,
            }}>
              {myClasses.map((cls, i) => (
                <div key={i} style={{
                  borderRadius: 10,
                  background: cls.bg,
                  padding: "clamp(6px, 0.8vw, 10px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}>
                  <div style={{ fontSize: "clamp(0.6rem, 0.75vw, 0.85rem)", fontWeight: 600, color: cls.sc, marginBottom: 5 }}>
                    {cls.subject}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2.5, fontSize: "clamp(0.65rem, 0.8vw, 0.9rem)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, color: cls.mc, fontWeight: 500 }}>
                      <Users size={9} strokeWidth={2} /> {cls.students} students
                    </div>
                    <div style={{ color: cls.mc, fontWeight: 400 }}>{cls.days}</div>
                    <div style={{ color: "#374151", fontWeight: 600 }}>{cls.time}</div>
                    <div style={{ color: "#9ca3af" }}>{cls.room}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Student_layout>
  );
};

export default Dashboard_student;