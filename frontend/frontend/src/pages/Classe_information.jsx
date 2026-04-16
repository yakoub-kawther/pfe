import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import {
  Search, SquarePen, Check, ArrowLeft,
  BookOpen, Clock, CheckCircle, Users, GraduationCap,
} from "lucide-react";


/* ─── Design tokens ───────────────────────────────────────────────────────── */
const T = {
  purple:     "#701366",
  purpleLight:"#701366",
  purplePale: "#F7EFF6",
  purpleBorder:"#E8D0E4",
  text:       "#2D1028",
  textMid:    "#7A4F74",
  textMuted:  "#B08DAA",
  surface:    "#FFFFFF",
  bg:         "#FAF5F9",
  border:     "#EDE0EB",
  green:      "#14794A",
  greenBg:    "#EAF7F0",
  greenBorder:"#C2EDD9",
  amber:      "#A06B00",
  amberBg:    "#FFF7E6",
  amberBorder:"#F5D9A0",
  radius:     "14px",
  radiusSm:   "9px",
  shadow:     "0 1px 4px rgba(107,31,94,0.07), 0 4px 16px rgba(107,31,94,0.04)",
};

/* ─── Shared micro-components ─────────────────────────────────────────────── */

const Label = ({ children }) => (
  <span style={{
    display: "block", fontSize: "10.5px", fontWeight: 400,
    color: T.textMuted, letterSpacing: "0.07em",
    textTransform: "uppercase", marginBottom: "6px",
  }}>
    {children}
  </span>
);

const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

const inputStyle = (disabled) => ({
  width: "100%", boxSizing: "border-box",
  border: `1.5px solid ${disabled ? T.border : T.purpleBorder}`,
  borderRadius: T.radiusSm, padding: "9px 12px",
  fontSize: "13px", color: disabled ? T.textMid : T.text,
  background: disabled ? T.bg : "#fff",
  fontFamily: "'Inter', sans-serif",
  outline: "none", transition: "border-color 0.18s",
  cursor: disabled ? "default" : "text",
  appearance: "none",
});

const SearchInput = ({ value, onChange, placeholder, width = "220px" }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    <Search style={{
      position: "absolute", left: "12px",
      width: "14px", height: "14px",
      color: T.textMuted, pointerEvents: "none",
    }} />
    <input
      type="text" value={value} onChange={onChange}
      placeholder={placeholder}
      style={{
        width, paddingLeft: "36px", paddingRight: "14px",
        height: "36px", borderRadius: "20px",
        border: `1.5px solid ${T.border}`, outline: "none",
        fontSize: "13px", color: T.text,
        background: "#fff", fontFamily: "'Inter', sans-serif",
        transition: "border-color 0.18s",
      }}
    />
  </div>
);

const Badge = ({ status }) => {
  const isOk = status === "Completed";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 11px", borderRadius: "20px",
      fontSize: "12px", fontWeight: 400,
      background: isOk ? T.greenBg : T.amberBg,
      color:      isOk ? T.green   : T.amber,
      border:     `1px solid ${isOk ? T.greenBorder : T.amberBorder}`,
    }}>
      <span style={{
        width: "5px", height: "5px", borderRadius: "50%",
        background: isOk ? "#1A9E5E" : "#D48C00",
      }} />
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, colors }) => (
  <div style={{
    flex: 1, background: "#fff", border: `1px solid ${T.border}`,
    borderRadius: T.radius, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: "14px",
    boxShadow: T.shadow,
  }}>
    <div style={{
      width: "42px", height: "42px", borderRadius: "12px",
      background: colors.iconBg, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon style={{ width: "19px", height: "19px", color: colors.iconColor }} />
    </div>
    <div>
      <div style={{ fontSize: "11px", color: T.textMuted, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 400, color: colors.textColor, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const allStudents = [
  { firstName: "Yousra", lastName: "Zt" },
  { firstName: "Liam", lastName: "Smith" },
  { firstName: "Emma", lastName: "Brown" },
  { firstName: "Noah", lastName: "Martin" },
  { firstName: "Olivia", lastName: "Davis" },
  { firstName: "James", lastName: "Lee" },
  { firstName: "Ava", lastName: "Johnson" },
  { firstName: "Sophia", lastName: "Wilson" },
  { firstName: "Lucas", lastName: "Taylor" },
  { firstName: "Mia", lastName: "Anderson" },
];

const mockSessions = [
  { session: "Session 1",  date: "2024-01-10", status: "Completed" },
  { session: "Session 2",  date: "2024-01-17", status: "Completed" },
  { session: "Session 3",  date: "2024-01-24", status: "Completed" },
  { session: "Session 4",  date: "2024-01-31", status: "Not Completed" },
  { session: "Session 5",  date: "2024-02-07", status: "Not Completed" },
  { session: "Session 6",  date: "2024-02-14", status: "Not Completed" },
];

const TOTAL_SESSIONS  = 6;
const completedCount  = mockSessions.filter(s => s.status === "Completed").length;
const remainingCount  = TOTAL_SESSIONS - completedCount;

/* ─── Table shell ─────────────────────────────────────────────────────────── */

const TableShell = ({ headers, children, empty }) => (
  <div style={{
    background: "#fff", borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    overflow: "hidden", boxShadow: T.shadow,
  }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead>
        <tr style={{ background: T.purplePale, borderBottom: `1px solid ${T.purpleBorder}` }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: "12px 20px", textAlign: "left",
              color: T.purple, fontWeight: 500, fontSize: "11.5px",
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children || (
          <tr>
            <td colSpan={headers.length} style={{
              textAlign: "center", padding: "40px",
              color: T.textMuted, fontSize: "13px",
            }}>{empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const Tr = ({ children }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr
      style={{ borderTop: `1px solid ${T.border}`, background: hov ? T.purplePale : "#fff", transition: "background 0.13s" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </tr>
  );
};

const Td = ({ children, muted, mono }) => (
  <td style={{
    padding: "12px 20px",
    color: muted ? T.textMid : T.text,
    fontFamily: mono ? "'DM Sans', sans-serif" : "'Inter', sans-serif",
    fontSize: mono ? "12.5px" : "13.5px",
  }}>{children}</td>
);

/* ─── Tab bar ─────────────────────────────────────────────────────────────── */

const TABS = [
  { key: "details",  label: "Class Details", icon: GraduationCap },
  { key: "students", label: "Students",       icon: Users },
  { key: "sessions", label: "Sessions",       icon: BookOpen },
];

const TabBar = ({ active, onChange }) => (
  <div style={{
    display: "flex", gap: "4px",
    background: T.purplePale,
    borderRadius: "12px", padding: "4px",
    border: `1px solid ${T.purpleBorder}`,
    width: "fit-content",
  }}>
    {TABS.map(({ key, label, icon: Icon }) => {
      const on = active === key;
      return (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "8px 18px", borderRadius: "9px",
            border: "none", cursor: "pointer",
            background: on ? T.purple : "transparent",
            color: on ? "#fff" : T.textMid,
            fontSize: "13px", fontWeight: on ? 400 : 400,
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.18s",
          }}
        >
          <Icon style={{ width: "14px", height: "14px" }} />
          {label}
        </button>
      );
    })}
  </div>
);

/* ─── Btn ─────────────────────────────────────────────────────────────────── */

const Btn = ({ onClick, icon: Icon, children, filled, small }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: small ? "7px 14px" : "9px 18px",
      borderRadius: T.radiusSm,
      border: `1.5px solid ${filled ? T.purple : T.purpleBorder}`,
      background: filled ? T.purple : "#fff",
      color: filled ? "#fff" : T.purple,
      fontSize: "13px", fontWeight: 350,
      fontFamily: "'Inter', sans-serif",
      cursor: "pointer", transition: "all 0.16s",
    }}
  >
    {Icon && <Icon style={{ width: "14px", height: "14px" }} />}
    {children}
  </button>
);

/* ─── Main component ──────────────────────────────────────────────────────── */

const Classe_information = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  const [tab,         setTab]         = useState("details");
  const [isEditing,   setIsEditing]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [sessionSearch, setSesSearch] = useState("");

  const [form, setForm] = useState({
    classId:      cls?.name        || "C-001",
    className:    cls?.name        || "Advanced B2",
    status:       cls?.status?.text || "Active",
    startingDate: cls?.startingDate || "",
    language:     cls?.language    || "English",
    level:        cls?.level       || "B2",
    teacher:      cls?.teacher     || "Mr Ahmed",
  });

  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const filteredStudents = allStudents.filter(({ firstName, lastName }) =>
    `${firstName} ${lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSessions = mockSessions.filter(({ session, date, status }) => {
    const q = sessionSearch.toLowerCase();
    return session.toLowerCase().includes(q) || date.includes(q) || status.toLowerCase().includes(q);
  });

  /* ── layout constants */
  const wrap = {
    width: "100%", boxSizing: "border-box",
    padding: "32px 36px 60px",
    fontFamily: "'Inter', sans-serif",
  };

  const card = {
    background: "#fff", borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    padding: "28px", boxShadow: T.shadow,
  };

  return (
    <DashboardLayout>
      <div style={wrap}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "28px",
        }}>
          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "50%",
                border: `1.5px solid ${T.purpleBorder}`,
                background: "#fff", cursor: "pointer", flexShrink: 0,
              }}
            >
              <ArrowLeft style={{ width: "15px", height: "15px", color: T.purple }} />
            </button>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: T.textMuted, fontWeight: 400, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Classes
              </p>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 500, color: T.text, lineHeight: 1.2 }}>
                {form.className}
              </h1>
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {isEditing ? (
              <>
                <Btn
                  onClick={() => setIsEditing(false)}
                  icon={ArrowLeft}
                >Discard</Btn>
                <Btn
                  onClick={() => { setIsEditing(false); console.log("Saved:", form); }}
                  icon={Check}
                  filled
                >Save Changes</Btn>
              </>
            ) : (
              <Btn onClick={() => setIsEditing(true)} icon={SquarePen} filled>
                Edit Class
              </Btn>
            )}
          </div>
        </div>

        {/* ── Tab bar ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <TabBar active={tab} onChange={setTab} />
        </div>

        {/* ══ TAB: Class Details ════════════════════════════════════════ */}
        {tab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* ── General Info card ── */}
            <div style={card}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "22px", paddingBottom: "16px",
                borderBottom: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: T.purplePale, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <GraduationCap style={{ width: "16px", height: "16px", color: T.purple }} />
                </div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 450, color: T.text }}>
                  General Information
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px" }}>
                <Field label="Class ID">
                  <input style={inputStyle(!isEditing)} value={form.classId}
                    onChange={handle("classId")} disabled={!isEditing} placeholder="C-001" />
                </Field>
                <Field label="Class Name">
                  <input style={inputStyle(!isEditing)} value={form.className}
                    onChange={handle("className")} disabled={!isEditing} placeholder="Advanced B2" />
                </Field>
                <Field label="Status">
                  <select style={{ ...inputStyle(!isEditing), cursor: isEditing ? "pointer" : "default" }}
                    value={form.status} onChange={handle("status")} disabled={!isEditing}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>
                <Field label="Starting Date">
                  <input type="date" style={inputStyle(!isEditing)} value={form.startingDate}
                    onChange={handle("startingDate")} disabled={!isEditing} />
                </Field>
              </div>
            </div>

            {/* ── Academic Settings card ── */}
            <div style={card}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "22px", paddingBottom: "16px",
                borderBottom: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: T.purplePale, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <BookOpen style={{ width: "16px", height: "16px", color: T.purple }} />
                </div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 450, color: T.text }}>
                  Academic Settings
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                <Field label="Language">
                  <select style={{ ...inputStyle(!isEditing), cursor: isEditing ? "pointer" : "default" }}
                    value={form.language} onChange={handle("language")} disabled={!isEditing}>
                    <option>English</option>
                    <option>French</option>
                    <option>Arabic</option>
                    <option>Spanish</option>
                  </select>
                </Field>
                <Field label="Level">
                  <select style={{ ...inputStyle(!isEditing), cursor: isEditing ? "pointer" : "default" }}
                    value={form.level} onChange={handle("level")} disabled={!isEditing}>
                    {["A1","A2","B1","B2","C1","C2"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Teacher">
                  <select style={{ ...inputStyle(!isEditing), cursor: isEditing ? "pointer" : "default" }}
                    value={form.teacher} onChange={handle("teacher")} disabled={!isEditing}>
                    <option>Mr Ahmed</option>
                    <option>Mme Sara</option>
                    <option>Mr Karim</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Edit hint */}
            {!isEditing && (
              <p style={{
                margin: 0, fontSize: "12px", color: T.textMuted,
                padding: "11px 16px", borderRadius: T.radiusSm,
                background: T.purplePale, border: `1px dashed ${T.purpleBorder}`,
                display: "inline-block",
              }}>
                Click <strong>Edit Class</strong> to modify these details.
              </p>
            )}
          </div>
        )}

        {/* ══ TAB: Students ════════════════════════════════════════════ */}
        {tab === "students" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: T.purplePale, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Users style={{ width: "15px", height: "15px", color: T.purple }} />
                </div>
                <span style={{ fontSize: "16px", fontWeight: 450, color: T.text }}>
                  Students
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: 400, color: T.purple,
                  background: T.purplePale, border: `1px solid ${T.purpleBorder}`,
                  borderRadius: "20px", padding: "2px 10px", fontFamily: "'Inter', sans-serif",
                }}>
                  {filteredStudents.length}
                </span>
              </div>
              <SearchInput
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student…"
              />
            </div>

            {/* Table */}
            <TableShell
              headers={["#", "First Name", "Last Name"]}
              empty="No students found."
              fontFamily="'Inter', sans-serif"
            >
              {filteredStudents.length > 0 && filteredStudents.map((s, i) => (
                <Tr key={i}>
                  <Td muted mono>{String(i + 1).padStart(2, "0")}</Td>
                  <Td>{s.firstName}</Td>
                  <Td muted>{s.lastName}</Td>
                </Tr>
              ))}
            </TableShell>
          </div>
        )}

        {/* ══ TAB: Sessions ════════════════════════════════════════════ */}
        {tab === "sessions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Stats */}
            <div style={{ display: "flex", gap: "12px" }}>
              <StatCard
                icon={BookOpen}
                label="Total Sessions"
                value={TOTAL_SESSIONS}
                colors={{ iconBg: "#F0E8F7", iconColor: T.purple, textColor: T.purple }}
              />
              <StatCard
                icon={CheckCircle}
                label="Completed"
                value={completedCount}
                colors={{ iconBg: T.greenBg, iconColor: "#1A9E5E", textColor: T.green }}
              />
              <StatCard
                icon={Clock}
                label="Remaining"
                value={remainingCount}
                colors={{ iconBg: T.amberBg, iconColor: "#D48C00", textColor: T.amber }}
              />
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: T.purplePale, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <BookOpen style={{ width: "15px", height: "15px", color: T.purple }} />
                </div>
                <span style={{ fontSize: "16px", fontWeight: 450, color: T.text }}>
                  Session List
                </span>
              </div>
              <SearchInput
                value={sessionSearch}
                onChange={e => setSesSearch(e.target.value)}
                placeholder="Search sessions…"
              />
            </div>

            {/* Table */}
            <TableShell
              headers={["Session", "Date", "Status"]}
              empty="No sessions found."
            >
              {filteredSessions.length > 0 && filteredSessions.map((s, i) => (
                <Tr key={i}>
                  <Td>{s.session}</Td>
                  <Td muted mono>{s.date}</Td>
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