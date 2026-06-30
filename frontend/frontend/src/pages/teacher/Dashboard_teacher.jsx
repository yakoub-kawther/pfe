import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import { apiFetch } from "../../services/api";
import {
  UserPlus, CreditCard, Bell, ChevronRight,
  BookOpen, GraduationCap, CheckCircle, Clock, Users, CalendarDays, Loader2,
} from "lucide-react";

// ─── Shared card style ────────────────────────────────────────
const card = {
  background: "#fff", borderRadius: 12,
  border: "1px solid #f0f0f5",
  boxShadow: "0 1px 3px rgba(120,80,180,0.07)",
  boxSizing: "border-box",
};

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ Icon, iconColor, value, label }) => (
  <div style={{ ...card, padding: "2.4rem 1rem", minHeight: "80px", fontSize: "clamp(0.9rem,1vw,1.2rem)", display: "flex", alignItems: "center", gap: 8, flex: "1 1 0", minWidth: 0 }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f3f0ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={14} color={iconColor} strokeWidth={1.7} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "clamp(1rem,1.3vw,1.4rem)", fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#1a1a2e", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "clamp(0.65rem,0.8vw,0.85rem)", color: "#9e9eb8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    </div>
  </div>
);

// ─── Class colors ─────────────────────────────────────────────
const CLASS_COLORS = [
  { bg: "#fce4ec", sc: "#c2185b", mc: "#e91e63" },
  { bg: "#fffde7", sc: "#f9a825", mc: "#f57f17" },
  { bg: "#e3f2fd", sc: "#1565c0", mc: "#1976d2" },
  { bg: "#e8f5e9", sc: "#2e7d32", mc: "#388e3c" },
  { bg: "#f3e5f5", sc: "#6a1b9a", mc: "#8e24aa" },
  { bg: "#e0f7fa", sc: "#00695c", mc: "#00897b" },
];

export default function Dashboard_teacher() {
  const navigate = useNavigate();

  const [me,       setMe]       = useState(null);
  const [teacher,  setTeacher]  = useState(null);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
  const load = async () => {
    try {
      const meRes  = await apiFetch("/account/me/");
      const meData = await meRes.json();
      console.log("me:", JSON.stringify(meData));
      setMe(meData);

      const personId = meData?.person_id;
      console.log("personId:", personId);
      if (!personId) return;

      const tRes  = await apiFetch(`/persons/teachers/${personId}/`);
      const tData = await tRes.json();
      console.log("teacher:", JSON.stringify(tData).slice(0, 300));
      setTeacher(tData);

      const cRes  = await apiFetch(`/academic/classes/?teacher=${personId}`);
      const cData = await cRes.json();
      console.log("classes:", JSON.stringify(cData).slice(0, 300));
      setClasses(Array.isArray(cData) ? cData : (cData.results ?? []));

    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

  // ── Derived data ─────────────────────────────────────────────
  const person      = teacher?.employee?.person ?? {};
  const firstName   = person.first_name ?? "";
  const fullName = (me?.full_name ?? `${firstName}`.trim()) || "Teacher";
  const totalClasses   = classes.length;
  const totalStudents  = classes.reduce((sum, c) => sum + (c.student_count ?? c.students ?? 0), 0);

  if (loading) return (
    <Teacher_layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "10px", color: "#701366", fontFamily: "Inter, sans-serif" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        Loading dashboard...
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </Teacher_layout>
  );

  return (
    <Teacher_layout>
      <div style={{ padding: "0.625rem 0.75rem", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", width: "100%", minWidth: 0 }}>

        {/* ── Row 1: Stats + Quick Actions | Welcome Back ── */}
        <div style={{ display: "flex", gap: "clamp(6px,1vw,14px)" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>

            {/* Stats */}
            <div style={{ display: "flex", fontSize: "1rem", gap: 6, minWidth: 0 }}>
              <StatCard Icon={BookOpen}     iconColor="#7c3aed" value={totalClasses}   label="My Classes"       />
              <StatCard Icon={Users}        iconColor="#2563eb" value={totalStudents}  label="My Students"      />
              <StatCard Icon={CalendarDays} iconColor="#16a34a" value={`${totalClasses * 2}h`} label="Weekly Hours" />
              <StatCard Icon={CheckCircle}  iconColor="#d97706" value={teacher?.is_head_teacher ? "Yes" : "No"} label="Head Teacher" />
              <StatCard Icon={GraduationCap} iconColor="#e11d48" value={teacher?.language?.language_name ?? "—"} label="Language" />
            </div>

            {/* Quick Actions */}
            <div style={{ ...card, padding: "0.625rem 1rem", display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0, alignSelf: "stretch" }}>
              <div style={{ fontSize: "0.625rem", fontWeight: 500, color: "#9e9eb8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
                {[
                  { label: "Attendance",        Icon: UserPlus,  color: "#7c3aed", bg: "#f3f0ff", path: "/Classes_teacher"       },
                  { label: "Notes",             Icon: CreditCard, color: "#d97706", bg: "#fffbeb", path: "/Notes_teacher"         },
                  { label: "Send Notification", Icon: Bell,      color: "#0ea5e9", bg: "#f0f9ff", path: "/Notifications_teacher" },
                ].map(({ label, Icon, color, bg, path }) => (
                  <button key={label} onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: 6, background: bg, border: "none", borderRadius: 8, cursor: "pointer", padding: "5px 0.625rem", fontSize: "0.875rem", fontWeight: 600, color, flexShrink: 0, whiteSpace: "nowrap" }}>
                    <Icon size={11} strokeWidth={2} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Welcome Back */}
          <div style={{ width: 185, flexShrink: 0, borderRadius: 12, background: "#fff", border: "1px solid #f0f0f5", boxShadow: "0 1px 3px rgba(120,80,180,0.07)", padding: "12px 14px 0 14px", display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "hidden", boxSizing: "border-box" }}>
            <div style={{ fontSize: "0.5rem", fontWeight: 500, color: "#9e9eb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Teacher</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginTop: 4 }}>WELCOME BACK</div>
            <div style={{ fontSize: "0.6rem", color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{fullName}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", minHeight: 0 }}>
              <img
                src="/src/assets/welcomeback.svg"
                alt="Welcome Back"
                style={{ width: "100%", maxHeight: 140, objectFit: "contain", objectPosition: "bottom center", display: "block" }}
              />
            </div>
          </div>
        </div>

        {/* ── Row 2: My Classes ── */}
        <div style={{ flexShrink: 0, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "clamp(6px,1vw,10px)", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: "clamp(0.75rem,1vw,1rem)", fontWeight: 600, color: "#1a1a2e" }}>My Classes</div>
            <button onClick={() => navigate("/Classes_teacher")} style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "clamp(0.65rem,0.8vw,0.65rem)", fontWeight: 500, color: "#701366", flexShrink: 0 }}>
              View All <ChevronRight size={11} />
            </button>
          </div>

          {classes.length === 0 ? (
            <div style={{ ...card, padding: "24px", textAlign: "center", color: "#9e9eb8", fontSize: "0.85rem", fontFamily: "Inter, sans-serif" }}>
              No classes assigned yet.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(classes.length, 4)}, 1fr)`, gap: 8 }}>
              {classes.map((cls, i) => {
                const clr = CLASS_COLORS[i % CLASS_COLORS.length];
                return (
                  <div key={cls.id ?? i} style={{ borderRadius: 10, background: clr.bg, padding: "clamp(6px,0.8vw,10px)", border: "1px solid rgba(0,0,0,0.04)", boxSizing: "border-box", minWidth: 0 }}>
                    <div style={{ fontSize: "clamp(0.6rem,0.75vw,0.85rem)", fontWeight: 600, color: clr.sc, marginBottom: 5 }}>
                      {cls.name ?? "—"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2.5, fontSize: "clamp(0.65rem,0.8vw,0.9rem)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, color: clr.mc, fontWeight: 500 }}>
                        <Users size={9} strokeWidth={2} /> {cls.student_count ?? "—"} students
                      </div>
                      <div style={{ color: clr.mc, fontWeight: 400 }}>{cls.level?.level_name ?? "—"}</div>
<div style={{ color: "#9ca3af" }}>{cls.language?.language_name ?? "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Teacher_layout>
  );
}