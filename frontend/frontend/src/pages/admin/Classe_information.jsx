import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { apiFetch } from "../../services/api";
import {
  Search, SquarePen, Check, ArrowLeft,
  BookOpen, Clock, CheckCircle, Users, GraduationCap,
} from "lucide-react";

const T = {
  purple:      "#701366",
  purplePale:  "#F7EFF6",
  purpleBorder:"#E8D0E4",
  text:        "#2D1028",
  textMid:     "#7A4F74",
  textMuted:   "#B08DAA",
  bg:          "#FAF5F9",
  border:      "#EDE0EB",
  green:       "#14794A",
  greenBg:     "#EAF7F0",
  greenBorder: "#C2EDD9",
  amber:       "#A06B00",
  amberBg:     "#FFF7E6",
  amberBorder: "#F5D9A0",
  radius:      "14px",
  radiusSm:    "9px",
  shadow:      "0 1px 4px rgba(107,31,94,0.07), 0 4px 16px rgba(107,31,94,0.04)",
};

const Label = ({ children }) => (
  <span style={{ display:"block", fontSize:"10.5px", fontWeight:400, color:T.textMuted, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"6px" }}>
    {children}
  </span>
);

const Field = ({ label, children }) => (
  <div><Label>{label}</Label>{children}</div>
);

const inputStyle = (disabled) => ({
  width:"100%", boxSizing:"border-box",
  border:`1.5px solid ${disabled ? T.border : T.purpleBorder}`,
  borderRadius:T.radiusSm, padding:"9px 12px",
  fontSize:"13px", color:disabled ? T.textMid : T.text,
  background:disabled ? T.bg : "#fff",
  fontFamily:"'Inter', sans-serif",
  outline:"none", transition:"border-color 0.18s",
  cursor:disabled ? "default" : "text", appearance:"none",
});

const SearchInput = ({ value, onChange, placeholder, width="220px" }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    <Search style={{ position:"absolute", left:"12px", width:"14px", height:"14px", color:T.textMuted, pointerEvents:"none" }} />
    <input
      type="text" value={value} onChange={onChange} placeholder={placeholder}
      style={{ width, paddingLeft:"36px", paddingRight:"14px", height:"36px", borderRadius:"20px", border:`1.5px solid ${T.border}`, outline:"none", fontSize:"13px", color:T.text, background:"#fff", fontFamily:"'Inter', sans-serif" }}
    />
  </div>
);

const Badge = ({ status }) => {
  const isOk = status === "Completed" || status === "completed";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"4px 11px", borderRadius:"20px", fontSize:"12px", background:isOk ? T.greenBg : T.amberBg, color:isOk ? T.green : T.amber, border:`1px solid ${isOk ? T.greenBorder : T.amberBorder}` }}>
      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:isOk ? "#1A9E5E" : "#D48C00" }} />
      {status}
    </span>
  );
};

const StatCard = ({ icon:Icon, label, value, colors }) => (
  <div style={{ flex:1, background:"#fff", border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"18px 20px", display:"flex", alignItems:"center", gap:"14px", boxShadow:T.shadow, minWidth:0 }}>
    <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:colors.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon style={{ width:"19px", height:"19px", color:colors.iconColor }} />
    </div>
    <div style={{ minWidth:0 }}>
      <div style={{ fontSize:"11px", color:T.textMuted, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:"3px" }}>{label}</div>
      <div style={{ fontSize:"24px", fontWeight:400, color:colors.textColor, lineHeight:1 }}>{value}</div>
    </div>
  </div>
);

const TableShell = ({ headers, children, empty }) => (
  <div style={{ background:"#fff", borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:"hidden", boxShadow:T.shadow, overflowX:"auto" }}>
    <table style={{ width:"100%", minWidth:"400px", borderCollapse:"collapse", fontSize:"13px" }}>
      <thead>
        <tr style={{ background:T.purplePale, borderBottom:`1px solid ${T.purpleBorder}` }}>
          {headers.map((h,i) => (
            <th key={i} style={{ padding:"12px 20px", textAlign:"left", color:T.purple, fontWeight:500, fontSize:"11.5px", letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children || (
          <tr><td colSpan={headers.length} style={{ textAlign:"center", padding:"40px", color:T.textMuted, fontSize:"13px" }}>{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const Tr = ({ children }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr style={{ borderTop:`1px solid ${T.border}`, background:hov ? T.purplePale : "#fff", transition:"background 0.13s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </tr>
  );
};

const Td = ({ children, muted, mono }) => (
  <td style={{ padding:"12px 20px", color:muted ? T.textMid : T.text, fontFamily:mono ? "'DM Sans', sans-serif" : "'Inter', sans-serif", fontSize:mono ? "12.5px" : "13.5px", whiteSpace:"nowrap" }}>
    {children}
  </td>
);

const TABS = [
  { key:"details",  label:"Class Details", icon:GraduationCap },
  { key:"students", label:"Students",      icon:Users },
  { key:"sessions", label:"Sessions",      icon:BookOpen },
];

const TabBar = ({ active, onChange }) => (
  <div style={{ display:"flex", gap:"4px", background:T.purplePale, borderRadius:"12px", padding:"4px", border:`1px solid ${T.purpleBorder}`, width:"fit-content", flexWrap:"wrap" }}>
    {TABS.map(({ key, label, icon:Icon }) => {
      const on = active === key;
      return (
        <button key={key} onClick={() => onChange(key)} style={{ display:"flex", alignItems:"center", gap:"7px", padding:"8px 18px", borderRadius:"9px", border:"none", cursor:"pointer", background:on ? T.purple : "transparent", color:on ? "#fff" : T.textMid, fontSize:"13px", fontFamily:"'Inter', sans-serif", transition:"all 0.18s", whiteSpace:"nowrap" }}>
          <Icon style={{ width:"14px", height:"14px" }} />{label}
        </button>
      );
    })}
  </div>
);

const Btn = ({ onClick, icon:Icon, children, filled }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 18px", borderRadius:T.radiusSm, border:`1.5px solid ${filled ? T.purple : T.purpleBorder}`, background:filled ? T.purple : "#fff", color:filled ? "#fff" : T.purple, fontSize:"13px", fontFamily:"'Inter', sans-serif", cursor:"pointer", transition:"all 0.16s", whiteSpace:"nowrap" }}>
  {Icon && <Icon style={{ width:"14px", height:"14px" }} />}{children}
  </button>
);

const Classe_information = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;
  console.log("cls from state:", JSON.stringify(cls, null, 2));

  const [tab,       setTab]       = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  // ── API data ──────────────────────────────────────────────
  const [students,  setStudents]  = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels,    setLevels]    = useState([]);

  const [search,        setSearch]    = useState("");
  const [sessionSearch, setSesSearch] = useState("");

  // ── Form ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:        cls?.name       || "",
    status:      cls?.status     || "active",
    start_date:  cls?.start_date || "",  
    language_id: cls?.language?.id || "",
    level_id:    cls?.level?.id    || "",
    teacher_id:  "",
  });

  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  // ── Fetch class ───────────────────────────────────────────
  const fetchClass = useCallback(async () => {
    if (!cls?.id) return;
    try {
      const res  = await apiFetch(`/academic/classes/${cls.id}/`);
      const data = await res.json();
      setForm({
        name:        data.name          || "",
        status:      data.status        || "active",
        start_date:  data.start_date    || "",   // ✅ correct field name
        language_id: data.language?.id  || "",
        level_id:    data.level?.id     || "",
        teacher_id:  data.teacher_id    || "",   // pk from backend
      });
    } catch {}
  }, [cls?.id]);

  // ── Fetch students ────────────────────────────────────────
const fetchStudents = useCallback(async () => {
  if (!cls?.id) return;
  try {
    const res  = await apiFetch(`/inscriptions/?class_id=${cls.id}&status=confirmed`);
    const data = await res.json();
    console.log("Students:", JSON.stringify(data, null, 2)); // 👈
    setStudents(Array.isArray(data) ? data : (data.results ?? []));
  } catch {}
}, [cls?.id]);

  // ── Fetch sessions ────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    if (!cls?.id) return;
    try {
      const res  = await apiFetch(`/academic/sessions/?class_obj=${cls.id}`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : (data.results ?? []));
    } catch {}
  }, [cls?.id]);

  // ── Fetch dropdowns ───────────────────────────────────────
  useEffect(() => {
    fetchClass();
    fetchStudents();
    fetchSessions();

    apiFetch("/persons/teachers/")
      .then(r => r.json())
      .then(d => setTeachers(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {});

    apiFetch("/academic/languages/")
      .then(r => r.json())
      .then(d => setLanguages(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {});

    apiFetch("/academic/levels/")
      .then(r => r.json())
      .then(d => setLevels(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {});
  }, [fetchClass, fetchStudents, fetchSessions]);

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name:       form.name,
        status:     form.status,
        start_date: form.start_date || null,
        language:   Number(form.language_id) || null,  // ✅ ClassCreateSerializer uses 'language'
        level:      Number(form.level_id)    || null,  // ✅ not 'level_id'
        teacher:    Number(form.teacher_id)  || null,  // ✅ not 'teacher_id'
      };

      const res  = await apiFetch(`/academic/classes/${cls.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.detail || JSON.stringify(data)); return; }
      setIsEditing(false);
      fetchClass();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────
// Fix the filter
const filteredStudents = students.filter(s => {
  const name = (s.student_name ?? "").toLowerCase();
  return name.includes(search.toLowerCase());
});


  const filteredSessions = sessions.filter(s => {
    const q = sessionSearch.toLowerCase();
    return (s.session_date || "").includes(q) || (s.status || "").toLowerCase().includes(q);
  });

  const completedCount = sessions.filter(s => s.status === "Completed" || s.status === "completed").length;
  const remainingCount = sessions.length - completedCount;

  // Teacher display name
  const teacherLabel = (t) => {
    const p = t?.employee?.person ?? {};
    return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || `Teacher ${t?.employee?.person_id}`;
  };

  const wrap = { width:"100%", boxSizing:"border-box", padding:"32px clamp(12px, 2.5vw, 36px) 60px", fontFamily:"'Inter', sans-serif" };
  const card = { background:"#fff", borderRadius:T.radius, border:`1px solid ${T.border}`, padding:"28px", boxShadow:T.shadow };

  return (
    <DashboardLayout>
      <div style={wrap}>

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"36px", height:"36px", borderRadius:"50%", border:`1.5px solid ${T.purpleBorder}`, background:"#fff", cursor:"pointer", flexShrink:0 }}>
              <ArrowLeft style={{ width:"15px", height:"15px", color:T.purple }} />
            </button>
            <div>
              <p style={{ margin:0, fontSize:"12px", color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em" }}>Classes</p>
              <h1 style={{ margin:0, fontSize:"22px", fontWeight:500, color:T.text, lineHeight:1.2 }}>{form.name || "—"}</h1>
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {isEditing ? (
              <>
                <Btn onClick={() => { setIsEditing(false); setError(null); fetchClass(); }} icon={ArrowLeft}>Discard</Btn>
                <Btn onClick={handleSave} icon={Check} filled>{saving ? "Saving..." : "Save Changes"}</Btn>
              </>
            ) : (
              <Btn onClick={() => setIsEditing(true)} icon={SquarePen} filled>Edit Class</Btn>
            )}
          </div>
        </div>

        {error && (
          <div style={{ color:"#dc2626", background:"#fee2e2", borderRadius:"8px", padding:"10px 16px", marginBottom:"16px", fontSize:"13px" }}>
            {error}
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{ marginBottom:"24px", overflowX:"auto" }}>
          <TabBar active={tab} onChange={setTab} />
        </div>

        {/* ══ TAB: Details ════════════════════════════════════ */}
        {tab === "details" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* General */}
            <div style={card}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"22px", paddingBottom:"16px", borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:T.purplePale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <GraduationCap style={{ width:"16px", height:"16px", color:T.purple }} />
                </div>
                <h2 style={{ margin:0, fontSize:"16px", fontWeight:450, color:T.text }}>General Information</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap:"24px" }}>
                <Field label="Class Name">
                  <input style={inputStyle(!isEditing)} value={form.name} onChange={handle("name")} disabled={!isEditing} placeholder="Class name" />
                </Field>
                <Field label="Status">
                  <select style={{ ...inputStyle(!isEditing), cursor:isEditing ? "pointer" : "default" }} value={form.status} onChange={handle("status")} disabled={!isEditing}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
                {/* ✅ correct field: start_date */}
                <Field label="Start Date">
                  <input type="date" style={inputStyle(!isEditing)} value={form.start_date} onChange={handle("start_date")} disabled={!isEditing} />
                </Field>
              </div>
            </div>

            {/* Academic */}
            <div style={card}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"22px", paddingBottom:"16px", borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:T.purplePale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BookOpen style={{ width:"16px", height:"16px", color:T.purple }} />
                </div>
                <h2 style={{ margin:0, fontSize:"16px", fontWeight:450, color:T.text }}>Academic Settings</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap:"24px" }}>

                {/* ✅ language_name */}
                <Field label="Language">
                  <select style={{ ...inputStyle(!isEditing), cursor:isEditing ? "pointer" : "default" }} value={form.language_id} onChange={handle("language_id")} disabled={!isEditing}>
                    <option value="">Select language</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.language_name}</option>
                    ))}
                  </select>
                </Field>

                {/* ✅ level_name */}
                <Field label="Level">
                  <select style={{ ...inputStyle(!isEditing), cursor:isEditing ? "pointer" : "default" }} value={form.level_id} onChange={handle("level_id")} disabled={!isEditing}>
                    <option value="">Select level</option>
                    {levels.map(l => (
                      <option key={l.id} value={l.id}>{l.level_name}</option>
                    ))}
                  </select>
                </Field>

                {/* ✅ teacher from API with person name */}
                <Field label="Teacher">
                  <select style={{ ...inputStyle(!isEditing), cursor:isEditing ? "pointer" : "default" }} value={form.teacher_id} onChange={handle("teacher_id")} disabled={!isEditing}>
                    <option value="">Select teacher</option>
                    {teachers.map(t => (
                      <option key={t.employee?.person_id} value={t.employee?.person_id}>
                        {teacherLabel(t)}
                      </option>
                    ))}
                  </select>
                </Field>

              </div>
            </div>

            {!isEditing && (
              <p style={{ margin:0, fontSize:"12px", color:T.textMuted, padding:"11px 16px", borderRadius:T.radiusSm, background:T.purplePale, border:`1px dashed ${T.purpleBorder}`, display:"inline-block" }}>
                Click <strong>Edit Class</strong> to modify these details.
              </p>
            )}
          </div>
        )}

        {/* ══ TAB: Students ════════════════════════════════════ */}
        {tab === "students" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:T.purplePale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users style={{ width:"15px", height:"15px", color:T.purple }} />
                </div>
                <span style={{ fontSize:"16px", fontWeight:450, color:T.text }}>Students</span>
                <span style={{ fontSize:"12px", color:T.purple, background:T.purplePale, border:`1px solid ${T.purpleBorder}`, borderRadius:"20px", padding:"2px 10px" }}>
                  {filteredStudents.length}
                </span>
              </div>
              <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student…" />
            </div>
            <TableShell headers={["#", "First Name", "Last Name"]} empty="No students found.">
             // Fix the table rows
{filteredStudents.length > 0 && filteredStudents.map((s, i) => (
  <Tr key={i}>
    <Td muted mono>{String(i+1).padStart(2,"0")}</Td>
    <Td>{s.student_name?.split(" ")[0] || "—"}</Td>
    <Td muted>{s.student_name?.split(" ").slice(1).join(" ") || "—"}</Td>
  </Tr>
))}
            </TableShell>
          </div>
        )}

        {/* ══ TAB: Sessions ════════════════════════════════════ */}
        {tab === "sessions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <StatCard icon={BookOpen}    label="Total Sessions" value={sessions.length} colors={{ iconBg:"#F0E8F7", iconColor:T.purple,     textColor:T.purple }} />
              <StatCard icon={CheckCircle} label="Completed"      value={completedCount}  colors={{ iconBg:T.greenBg, iconColor:"#1A9E5E",  textColor:T.green  }} />
              <StatCard icon={Clock}       label="Remaining"      value={remainingCount}  colors={{ iconBg:T.amberBg, iconColor:"#D48C00",  textColor:T.amber  }} />
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:T.purplePale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BookOpen style={{ width:"15px", height:"15px", color:T.purple }} />
                </div>
                <span style={{ fontSize:"16px", fontWeight:450, color:T.text }}>Session List</span>
              </div>
              <SearchInput value={sessionSearch} onChange={e => setSesSearch(e.target.value)} placeholder="Search sessions…" />
            </div>
            <TableShell headers={["Session Date", "Status"]} empty="No sessions found.">
              {filteredSessions.length > 0 && filteredSessions.map((s, i) => (
                <Tr key={i}>
                  <Td muted mono>{s.session_date || "—"}</Td>
                  <Td><Badge status={s.status} /></Td>
                </Tr>
              ))}
            </TableShell>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Classe_information;