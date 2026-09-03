import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  UserPlus, CreditCard, Bell, ChevronRight,
  Users, GraduationCap, Wallet, Hourglass, TrendingUp, TrendingDown, CalendarX,
} from "lucide-react";
import {
  BarChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Bar, Cell, Area, AreaChart,
} from "recharts";
import { apiFetch } from "../../services/api";


const DIST_COLORS = ["#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6"];

// Cycled by index onto today's classes since the backend doesn't return a color
const CLASS_PALETTE = [
  { bg: "#fce4ec", sc: "#c2185b", mc: "#e91e63" },
  { bg: "#fffde7", sc: "#f9a825", mc: "#f57f17" },
  { bg: "#e3f2fd", sc: "#1565c0", mc: "#1976d2" },
  { bg: "#e8f5e9", sc: "#2e7d32", mc: "#388e3c" },
];

const card = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #f0f0f5",
  boxShadow: "0 1px 3px rgba(120,80,180,0.07)",
  boxSizing: "border-box",
};

/* ─── Stat Card ── */
const StatCard = ({ Icon, iconColor, iconBg, value, label, loading, error }) => (
  <div
    style={{
      ...card,
      padding: "1.1rem 1rem",
      minHeight: "80px",
      fontSize: "clamp(0.9rem, 1vw, 1.2rem)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: "1 1 0",
      minWidth: 0,
      transition: "box-shadow 0.18s, transform 0.18s",
      cursor: "default",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(120,80,180,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(120,80,180,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: iconBg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={16} color={iconColor} strokeWidth={1.8} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: "clamp(1rem, 1.3vw, 1.4rem)", fontFamily: "Inter, sans-serif", fontWeight: 700, color: error ? "#d1455c" : "#1a1a2e", lineHeight: 1 }}>
        {error ? "—" : loading ? "…" : value}
      </div>
      <div style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.85rem)", color: "#9e9eb8", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    </div>
  </div>
);

/* ─── Donut ── */
const AttendanceDonut = ({ pct = 80 }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const pDash = (pct / 100) * circ;
  const aDash = ((100 - pct) / 100) * circ;
  return (
    <div style={{ position: "relative", width: "clamp(90px, 8vw, 140px)",height: "clamp(90px, 8vw, 140px)", margin: "4px auto", flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3e8ff" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#a855f7" strokeWidth="10"
          strokeDasharray={`${pDash} ${circ - pDash}`} strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#fde68a" strokeWidth="10"
          strokeDasharray={`${aDash} ${circ - aDash}`} strokeDashoffset={-pDash} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{ fontSize: "clamp(14px, 1.2vw, 20px)", fontWeight: 600, color: "#1a1a2e", lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "clamp(10px, 0.8vw, 14px)", color: "#9e9eb8", marginTop: 2, fontWeight: 500 }}>Attendance</span>
      </div>
    </div>
  );
};

/* ─── Empty state for Daily Overview ── */
const NoClassesToday = () => (
  <div style={{
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "1.25rem 0",
    color: "#9e9eb8",
  }}>
    <CalendarX size={22} strokeWidth={1.6} />
    <div style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.9rem)", fontWeight: 500 }}>No classes scheduled today</div>
  </div>
);

/* ─── Fetcher (outside component, so identity is stable) ── */
const fetchDashboardStats = async () => {
  const [studentsRes, teachersRes, pendingRes, paidRes, todayRes, classesRes, growthRes, attendanceRes] = await Promise.all([
    apiFetch("/persons/students/"),
    apiFetch("/persons/teachers/"),
    apiFetch("/payments/pending/"),
    apiFetch("/payments/?status=paid&page=1"),
    apiFetch("/academic/schedules/today/"),
    apiFetch("/academic/classes/"),
    apiFetch("/inscriptions/growth/?months=6"),
    apiFetch("/attendance/overview/"),
  ]);

  if (!studentsRes.ok || !teachersRes.ok || !pendingRes.ok || !paidRes.ok || !todayRes.ok || !classesRes.ok || !growthRes.ok || !attendanceRes.ok) {
    throw new Error("One or more dashboard requests failed.");
  }

  const [students, teachers, pending, paid, todaySchedules, classes, growth, attendanceOverview] = await Promise.all([
    studentsRes.json(),
    teachersRes.json(),
    pendingRes.json(),
    paidRes.json(),
    todayRes.json(),
    classesRes.json(),
    growthRes.json(),
    attendanceRes.json(),
  ]);

  const stats = {
    totalStudents: Array.isArray(students) ? students.length : 0,
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
    paidPayments: paid.count ?? 0,
    pendingPayments: Array.isArray(pending) ? pending.length : 0,
  };

  // ── Daily Overview ──
  const scheduleList = Array.isArray(todaySchedules) ? todaySchedules : todaySchedules.results || [];
  const todayClasses = scheduleList.map((s, i) => ({
    subject: s.subject,
    teacher: s.teacher_name,
    days: s.day_of_week.charAt(0).toUpperCase() + s.day_of_week.slice(1),
    time: `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`,
    room: s.classroom_name,
    ...CLASS_PALETTE[i % CLASS_PALETTE.length],
  }));

  // ── Distribution by language: aggregated client-side from /academic/classes/ ──
  const classList = Array.isArray(classes) ? classes : classes.results || [];
  const counts = {};
  classList.forEach((c) => {
    const lang = c.language_name || "Unknown";
    counts[lang] = (counts[lang] || 0) + 1;
  });
  const distributionData = Object.entries(counts).map(([lang, count]) => ({ lang, count }));

  // ── Student Growth: running "active students" headcount from /inscriptions/growth/ ──
  const growthList = Array.isArray(growth) ? growth : growth.results || [];
  const growthData = growthList.map((g) => ({
    month: new Date(g.month + "T00:00:00").toLocaleString("en-US", { month: "short" }),
    students: g.total,
  }));
  let growthPct = null;
  if (growthList.length >= 2) {
    const prev = growthList[growthList.length - 2].total;
    const curr = growthList[growthList.length - 1].total;
    growthPct = prev === 0 ? null : ((curr - prev) / Math.abs(prev)) * 100;
  }

  // ── Attendance: current week overview from /attendance/overview/ ──
  const attendance = {
    present: attendanceOverview.present ?? 0,
    absent: attendanceOverview.absent ?? 0,
    total: attendanceOverview.total ?? 0,
    percent_present: attendanceOverview.percent_present ?? 0,
  };

  return { stats, todayClasses, distributionData, growthData, growthPct, attendance };
};

/* ─── Dashboard ── */
const Dashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  const stats            = data?.stats ?? { totalStudents: 0, totalTeachers: 0, paidPayments: 0, pendingPayments: 0 };
  const todayClasses      = data?.todayClasses ?? [];
  const distributionData  = data?.distributionData ?? [];
  const growthData        = data?.growthData ?? [];
  const growthPct         = data?.growthPct ?? null;
  const attendance        = data?.attendance ?? { present: 0, absent: 0, total: 0, percent_present: 0 };
  const error             = queryError?.message ?? null;

  return (
    <DashboardLayout>
      <div style={{
        padding: "0.625rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
      }}>

        {error && (
          <div style={{
            ...card,
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
            color: "#d1455c",
            background: "#fff5f6",
            border: "1px solid #ffd9de",
          }}>
            Couldn't load live dashboard stats: {error}
          </div>
        )}

        {/* ── Row 1: [Stats + Quick Actions] | [Welcome Back] ── */}
<div style={{ display: "flex", gap: "clamp(6px, 1vw, 14px)" }}>
          {/* LEFT: Stats + Quick Actions — natural sizes, no stretching */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>

            {/* Stats — live data from the backend */}
            <div style={{ display: "flex",fontSize: "1rem", gap: 6, minWidth: 0 }}>
              <StatCard Icon={Users}         iconColor="#7c3aed" iconBg="#f3f0ff" value={stats.totalStudents}   label="Total Students"  loading={loading} error={error} />
              <StatCard Icon={GraduationCap} iconColor="#2563eb" iconBg="#eff6ff" value={stats.totalTeachers}   label="Total Teachers"  loading={loading} error={error} />
              <StatCard Icon={Wallet}        iconColor="#16a34a" iconBg="#f0fdf4" value={stats.paidPayments}    label="Paid Payment"    loading={loading} error={error} />
              <StatCard Icon={Hourglass}     iconColor="#d97706" iconBg="#fffbeb" value={stats.pendingPayments} label="Pending Payment" loading={loading} error={error} />
            </div>

            {/* Quick Actions — original size, not stretched */}
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
                  { label: "Add Student",       Icon: UserPlus,   color: "#7c3aed", bg: "#f3f0ff", path: "/Add_student"   },
                  { label: "Record Payment",    Icon: CreditCard, color: "#d97706", bg: "#fffbeb", path: "/Fees"          },
                  { label: "Send Notification", Icon: Bell,       color: "#0ea5e9", bg: "#f0f9ff", path: "/Notifications" },
                ].map(({ label, Icon, color, bg, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: bg, border: "none", borderRadius: 8,
                      cursor: "pointer", padding: "6px 0.7rem",
                      fontSize: "0.875rem", fontWeight: 600, color,
                      flexShrink: 0, whiteSpace: "nowrap",
                      transition: "filter 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(0.96)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <Icon size={13} strokeWidth={2} /> {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Welcome Back — height driven by left column */}
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
            <div style={{ fontSize: "0.5rem", fontWeight: 500, color: "#9e9eb8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginTop: 4 }}>WELCOME BACK</div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", minHeight: 0 }}>
              <img
                src="/src/assets/welcomeback.svg"
                alt="Welcome Back"
                style={{ width: "100%", maxHeight: 140, objectFit: "contain", objectPosition: "bottom center", display: "block" }}
              />
            </div>
          </div>

        </div>

        {/* ── Row 2: Daily Overview — live from /academic/schedules/today/ ── */}
        <div style={{ flexShrink: 0, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "clamp(6px, 1vw, 10px)", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: "clamp(0.75rem, 1vw, 1rem)", fontWeight: 600, color: "#1a1a2e" }}>Daily Overview</div>
            <button onClick={() => navigate("/Time_table")} style={{
              display: "flex", alignItems: "center", gap: 2,
              background: "none", border: "none", cursor: "pointer",
              padding: 0, fontSize: "clamp(0.65rem, 0.8vw, 0.65rem)", fontWeight: 500, color: "#701366",
              flexShrink: 0,
            }}>
              View Timetable <ChevronRight size={11} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {!loading && todayClasses.length === 0 && <NoClassesToday />}
            {todayClasses.map((cls, i) => (
              <div key={i} style={{
                borderRadius: 10, background: cls.bg,
               padding: "clamp(6px, 0.8vw, 10px)", border: "1px solid rgba(0,0,0,0.04)",
                boxSizing: "border-box", minWidth: 0,
              }}>
                <div style={{ fontSize: "clamp(0.6rem, 0.75vw, 0.85rem)", fontWeight: 600, color: cls.sc, marginBottom: 5 }}>{cls.subject}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2.5, fontSize: "clamp(0.65rem, 0.8vw, 0.9rem)"}}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, color: cls.mc, fontWeight: 500 }}>
                    <GraduationCap size={9} strokeWidth={2} /> {cls.teacher}
                  </div>
                  <div style={{ color: cls.mc, fontWeight: 400 }}>{cls.days}</div>
                  <div style={{ color: "#374151", fontWeight: 600 }}>{cls.time}</div>
                  <div style={{ color: "#9ca3af" }}>{cls.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Charts ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, minWidth: 0 }}>

          {/* Attendance — live weekly overview from /attendance/overview/ */}
          <div style={{ ...card, padding: "10px 12px", display: "flex", flexDirection: "column", height: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexShrink: 0 }}>
              <div style={{ fontSize: "clamp(10px, 0.8vw, 14px)", fontWeight: 600, color: "#1a1a2e" }}>Attendance</div>
              <div style={{ fontSize: "0.625rem", color: "#9e9eb8" }}>This week</div>
            </div>
            {!loading && attendance.total === 0 ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 4, color: "#9e9eb8",
              }}>
                <CalendarX size={20} strokeWidth={1.6} />
                <div style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)", fontWeight: 500 }}>No attendance marked this week</div>
              </div>
            ) : (
              <>
                <AttendanceDonut pct={attendance.percent_present} />
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "clamp(10px, 0.8vw, 14px)", color: "#701366" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#701366", display: "inline-block", flexShrink: 0 }} />
                    Present ({attendance.present})
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "clamp(10px, 0.8vw, 14px)", color: "#701366" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fde68a", display: "inline-block", flexShrink: 0 }} />
                    Absent ({attendance.absent})
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Student Growth — live "active students" headcount from /inscriptions/growth/ */}
          <div style={{ ...card, padding: "10px 12px", display: "flex", flexDirection: "column",height: "clamp(200px, 22vh, 260px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2, flexShrink: 0 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a1a2e" }}>Student Growth</div>
              <div style={{ fontSize: "0.5rem", color: "#9e9eb8", background: "#f5f5f9", padding: "1px 5px", borderRadius: 4 }}>Monthly</div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 7, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 9, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "3px 7px" }} />
                  <Area type="monotone" dataKey="students" stroke="#a855f7" strokeWidth={2}
                    fill="url(#gGrad)" dot={false} activeDot={{ r: 3, fill: "#a855f7", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {growthPct !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 500,
                color: growthPct >= 0 ? "#16a34a" : "#d1455c", marginTop: 3, flexShrink: 0,
              }}>
                {growthPct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(1)}% this month
              </div>
            )}
          </div>

          {/* Distribution by language — live from /academic/classes/ */}
          <div style={{ ...card, padding: "10px 12px", display: "flex", flexDirection: "column", height: "clamp(200px, 22vh, 260px)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 2, flexShrink: 0 }}>Distribution by language</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} barSize={14} barCategoryGap="35%" margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                  <XAxis dataKey="lang" tick={{ fontSize: "0.5rem", fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: "0.625rem", borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "3px 7px" }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {distributionData.map((_, i) => <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;