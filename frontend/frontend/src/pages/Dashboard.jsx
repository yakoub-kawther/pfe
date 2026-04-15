import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  UserPlus, CreditCard, Bell, ChevronRight,
  Users, GraduationCap, CheckCircle, Clock, AlertCircle, TrendingUp,
} from "lucide-react";
import {
  BarChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer,Bar,Cell, Area, AreaChart,
} from "recharts";

/* ─── Data ───────────────────────────────────────────────────── */
const studentGrowthData = [
  { month: "Apr 10", students: 50 },
  { month: "Apr 11", students: 65 },
  { month: "Apr 12", students: 72 },
  { month: "Apr 13", students: 68 },
  { month: "Apr 14", students: 85 },
  { month: "Apr 15", students: 78 },
  { month: "Apr 16", students: 95 },
];

const distributionData = [
  { lang: "French",   count: 110 },
  { lang: "English",  count: 95  },
  { lang: "Espagnol", count: 70  },
  { lang: "German",   count: 45  },
  { lang: "Italy",    count: 15  },
  { lang: "Other",    count: 10  },
];

const DIST_COLORS = ["#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6"];

const todayClasses = [
  { subject:"English – A2",  teacher:"Prof. Smith",  days:"Mon & Wed", time:"8:00–10:30 AM", room:"Salle A", bg:"#fce4ec", sc:"#c2185b", mc:"#e91e63" },
  { subject:"Espagnol – A1", teacher:"Dr. Johnson",  days:"Tue & Thu", time:"1:30–3:30 PM",  room:"Salle C", bg:"#fffde7", sc:"#f9a825", mc:"#f57f17" },
  { subject:"French – B1",   teacher:"Prof. Davis",  days:"Mon & Sat", time:"9:00–12:30 PM", room:"Salle D", bg:"#e3f2fd", sc:"#1565c0", mc:"#1976d2" },
  { subject:"German – A2",   teacher:"Dr. Martinez", days:"Wednesday", time:"2:00–5:00 PM",  room:"Salle D", bg:"#e8f5e9", sc:"#2e7d32", mc:"#388e3c" },
];

const card = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #f0f0f5",
  boxShadow: "0 1px 3px rgba(120,80,180,0.07)",
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ Icon , iconColor, value, label }) => (
  <div style={{ ...card, padding:"8px 10px", display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
    <div style={{ width:30, height:30, borderRadius:8, background:"#f3f0ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={14} color={iconColor} strokeWidth={1.7} />
    </div>
    <div style={{ minWidth:0 }}>
      <div style={{ fontSize:14, fontWeight:700, color:"#1a1a2e", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:9, color:"#9e9eb8", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</div>
    </div>
  </div>
);

/* ─── Donut ──────────────────────────────────────────────────── */
const AttendanceDonut = ({ pct = 80 }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const pDash = (pct / 100) * circ;
  const aDash = ((100 - pct) / 100) * circ;
  return (
    <div style={{ position:"relative", width:90, height:90, margin:"4px auto" }}>
      <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3e8ff" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#a855f7" strokeWidth="10"
          strokeDasharray={`${pDash} ${circ-pDash}`} strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#fde68a" strokeWidth="10"
          strokeDasharray={`${aDash} ${circ-aDash}`} strokeDashoffset={-pDash} strokeLinecap="round" />
      </svg>
      {/* Text rendered OUTSIDE the rotated SVG so it stays upright and readable */}
      <div style={{
        position:"absolute", inset:0,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        pointerEvents:"none",
      }}>
        <span style={{ fontSize:16, fontWeight:800, color:"#1a1a2e", lineHeight:1 }}>{pct}%</span>
        <span style={{ fontSize:8, color:"#9e9eb8", marginTop:2, fontWeight:500 }}>Attendance</span>
      </div>
    </div>
  );
};

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div style={{
        padding:"10px 12px",
        height:"100vh",
        overflow:"hidden",
        display:"flex",
        flexDirection:"column",
        gap:8,
        boxSizing:"border-box",
      }}>

        {/* ── Row 1: Stats + Welcome ───────────────────── */}
        <div style={{ display:"flex", gap:8, alignItems:"stretch", flexShrink:0 }}>
          <div style={{ display:"flex", gap:6, flex:1 }}>
            <StatCard Icon={Users}          iconColor="#7c3aed" value="345" label="Total Students" />
            <StatCard Icon={GraduationCap} iconColor="#2563eb" value="18"  label="Total Teachers" />
            <StatCard Icon={CheckCircle}   iconColor="#16a34a" value="245" label="Paid Payment" />
            <StatCard Icon={Clock}         iconColor="#d97706" value="23"  label="Pending Payment" />
            <StatCard Icon={AlertCircle}   iconColor="#e11d48" value="8"   label="Overdue Payment" />
          </div>

          <div style={{
            width:160, flexShrink:0, borderRadius:12,
            background:"linear-gradient(135deg,#6b21a8 0%,#9333ea 100%)",
            padding:"10px 12px", display:"flex", flexDirection:"column",
            justifyContent:"space-between", position:"relative", overflow:"hidden",
            boxShadow:"0 3px 12px rgba(147,51,234,0.22)",
          }}>
            <div style={{ position:"absolute", bottom:-20, right:-20, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.12)" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:8, fontWeight:600, color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Admin</div>
              <div style={{ fontSize:13, fontWeight:800, color:"#fff", marginTop:2, lineHeight:1.2 }}>WELCOME BACK</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:2 }}>ZkyLingua Dashboard</div>
            </div>
            <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"flex-end" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GraduationCap size={16} color="white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Quick Actions ─────────────────────── */}
        <div style={{ ...card, padding:"6px 14px", flexShrink:0 }}>
          <div style={{ fontSize:8, fontWeight:700, color:"#9e9eb8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Quick Actions</div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            {[
              { label:"Add Student",       Icon:UserPlus,  color:"#7c3aed", path:"/Add_student" },
              { label:"Record Payment",    Icon:CreditCard,color:"#d97706", path:"/Fees" },
              { label:"Send Notification", Icon:Bell,      color:"#0ea5e9", path:"/Notifications" },
            ]
            .map(({ label, Icon, color, path }) => (
              <button key={label} onClick={() => navigate(path)} style={{
                display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
                cursor:"pointer", padding:0, fontSize:11, fontWeight:600, color,
              }}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Row 3: Daily Overview ────────────────────── */}
        <div style={{ flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#1a1a2e" }}>Daily Overview</div>
            <button onClick={() => navigate("/timetable")} style={{
              display:"flex", alignItems:"center", gap:2, background:"none", border:"none",
              cursor:"pointer", padding:0, fontSize:10, fontWeight:600, color:"#9333ea",
            }}>
              View Timetable <ChevronRight size={11} />
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {todayClasses.map((cls, i) => (
              <div key={i} style={{ borderRadius:10, background:cls.bg, padding:"8px 10px", border:"1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:10, fontWeight:700, color:cls.sc, marginBottom:5 }}>{cls.subject}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:2.5, fontSize:9 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:3, color:cls.mc, fontWeight:500 }}>
                    <GraduationCap size={9} strokeWidth={2} /> {cls.teacher}
                  </div>
                  <div style={{ color:cls.mc, fontWeight:500 }}>{cls.days}</div>
                  <div style={{ color:"#374151", fontWeight:700 }}>{cls.time}</div>
                  <div style={{ color:"#9ca3af" }}>{cls.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 4: Charts ────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, flex:1, minHeight:0 }}>

          {/* Attendance */}
          <div style={{ ...card, padding:"10px 12px", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#1a1a2e" }}>Attendance</div>
              <div style={{ fontSize:9, color:"#9e9eb8" }}>Apr 2025</div>
            </div>
            <AttendanceDonut pct={80} />
            <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:8 }}>
              {[["#a855f7","Present"],["#fde68a","Absent"]].map(([bg,lbl]) => (
                <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:"#6b7280" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:bg, display:"inline-block" }} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Student Growth */}
          <div style={{ ...card, padding:"10px 12px", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#1a1a2e" }}>Student Growth</div>
              <div style={{ fontSize:8, color:"#9e9eb8", background:"#f5f5f9", padding:"1px 5px", borderRadius:4 }}>Monthly</div>
            </div>
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowthData} margin={{ top:4, right:2, left:2, bottom:0 }}>
                  <defs>
                    <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize:7, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize:9, borderRadius:6, border:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", padding:"3px 7px" }} />
                  <Area type="monotone" dataKey="students" stroke="#a855f7" strokeWidth={2}
                    fill="url(#gGrad)" dot={false} activeDot={{ r:3, fill:"#a855f7", strokeWidth:0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:9, fontWeight:700, color:"#16a34a", marginTop:3 }}>
              <TrendingUp size={10} /> +19% this month
            </div>
          </div>

          {/* Distribution */}
          <div style={{ ...card, padding:"10px 12px", display:"flex", flexDirection:"column" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#1a1a2e", marginBottom:2 }}>Distribution by language</div>
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} barSize={10} barCategoryGap="35%" margin={{ top:4, right:2, left:2, bottom:0 }}>
                  <XAxis dataKey="lang" tick={{ fontSize:7, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize:9, borderRadius:6, border:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", padding:"3px 7px" }} />
                  <Bar dataKey="count" radius={[3,3,0,0]}>
                    {distributionData.map((_,i) => <Cell key={i} fill={DIST_COLORS[i%DIST_COLORS.length]} />)}
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