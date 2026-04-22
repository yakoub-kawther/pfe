import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const ReadField = ({ label, value, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label && (
      <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide font-Inter">
        {label}
      </label>
    )}
    <div
      style={{
        width          : "100%",
        border         : "1px solid #e2d0e2",
        borderRadius   : "8px",
        padding        : "10px 14px",
        fontSize       : "14px",
        color          : "#701366",
        boxSizing      : "border-box",
        fontFamily     : "Inter, sans-serif",
        backgroundColor: "#faf5fa",
        minHeight      : "40px",
      }}
    >
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3
      className="text-[#701366] font-Inter font-semibold"
      style={{ fontSize: "15px", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f8e0f8" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Teacher_profile = () => {
  const { state } = useLocation();
  const location  = useLocation();
  const navigate  = useNavigate();
  const teacher   = state?.teacher;

  const person   = teacher?.employee?.person ?? {};
  const employee = teacher?.employee         ?? {};

  const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
  const initial  = person.first_name?.charAt(0)?.toUpperCase() || "T";
  const status   = (employee.status ?? "").toLowerCase();

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-[#701366] opacity-50">
          No teacher data found. Please go back and select a teacher.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Row 1 — Title */}
        <h1 className="text-3xl text-[#701366] font-Inter font-semibold" style={{ marginBottom: "15px" }}>
          Teacher Profile
        </h1>

        {/* Row 2 — Tabs + Buttons */}
        <div className="flex items-center justify-between mb-8">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#f8e0f8] p-1 rounded-xl">
            {teacherTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path, { state: { teacher } })}
                style={{
                  padding     : "6px 18px",
                  borderRadius: "10px",
                  fontSize    : "13px",
                  fontFamily  : "Inter, sans-serif",
                  fontWeight  : "500",
                  cursor      : "pointer",
                  border      : "none",
                  transition  : "all 0.2s",
                  background  : location.pathname === tab.path ? "#701366" : "transparent",
                  color       : location.pathname === tab.path ? "#fff"    : "#701366",
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/Teachers")}
              style={{
                padding   : "8px 20px", borderRadius: "8px",
                border    : "1.5px solid #e2d0e2", background: "#fff",
                color     : "#701366", fontSize: "13px",
                fontFamily: "Inter, sans-serif", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Back
            </button>
            <button
              onClick={() => navigate("/Edit_teacher", { state: { teacher } })}
              style={{
                padding   : "8px 24px", borderRadius: "8px",
                border    : "1.5px solid #701366", background: "#701366",
                color     : "#fff", fontSize: "13px",
                fontFamily: "Inter, sans-serif", cursor: "pointer",
                transition: "all 0.2s", fontWeight: "500",
              }}
              onMouseEnter={e => { e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { e.target.style.background = "#701366"; }}
            >
              Edit
            </button>
          </div>
        </div>

        {/* Row 3 — Cards grid */}
        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start" }}>

          {/* LEFT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>

            <Card title="Basic Information">

              {/* Avatar + name + status */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="flex items-center justify-center rounded-full bg-[#f8e0f8] text-[#701366] font-Inter text-xl font-semibold"
                  style={{ width: "52px", height: "52px", flexShrink: 0 }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-[#701366] font-Inter font-medium text-base leading-tight">
                    {fullName || "—"}
                  </p>
                  <span
                    style={{
                      display      : "inline-flex",
                      alignItems   : "center",
                      gap          : "5px",
                      padding      : "4px 12px",
                      borderRadius : "20px",
                      fontSize     : "11px",
                      fontWeight   : "600",
                      fontFamily   : "Inter, sans-serif",
                      marginTop    : "4px",
                      letterSpacing: "0.03em",
                      background   : status === "active" ? "#dcfce7" : "#fee2e2",
                      color        : status === "active" ? "#15803d" : "#b91c1c",
                      border       : `1px solid ${status === "active" ? "#bbf7d0" : "#fecaca"}`,
                    }}
                  >
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                      background: status === "active" ? "#16a34a" : "#dc2626",
                    }} />
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField label="First Name" value={person.first_name} />
                <ReadField label="Last Name"  value={person.last_name} />
                <ReadField label="Gender"     value={person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : null} />
                <ReadField label="Hire Date"  value={employee.hire_date} />
                <ReadField label="Position"   value={employee.position?.name} />

                {/* Head Teacher badge */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide font-Inter">
                    Head Teacher
                  </label>
                  <div style={{ padding: "4px 0" }}>
                    <span
                      style={{
                        display      : "inline-flex",
                        alignItems   : "center",
                        gap          : "5px",
                        padding      : "4px 12px",
                        borderRadius : "20px",
                        fontSize     : "11px",
                        fontWeight   : "600",
                        fontFamily   : "Inter, sans-serif",
                        letterSpacing: "0.03em",
                        background   : teacher.is_head_teacher ? "#f8e0f8" : "#f3f4f6",
                        color        : teacher.is_head_teacher ? "#701366"  : "#6b7280",
                        border       : `1px solid ${teacher.is_head_teacher ? "#e9b8e9" : "#e5e7eb"}`,
                      }}
                    >
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                        background: teacher.is_head_teacher ? "#701366" : "#9ca3af",
                      }} />
                      {teacher.is_head_teacher ? "Head Teacher" : "Not Head Teacher"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Teaching Information */}
            <Card title="Teaching Information">
              <div className="flex flex-col" style={{ gap: "18px" }}>
                <ReadField label="Language" value={teacher.language ? `Language ${teacher.language}` : null} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide font-Inter">
                    Qualifications
                  </label>
                  <div
                    style={{
                      width          : "100%",
                      border         : "1px solid #e2d0e2",
                      borderRadius   : "8px",
                      padding        : "10px 14px",
                      fontSize       : "14px",
                      color          : "#701366",
                      boxSizing      : "border-box",
                      fontFamily     : "Inter, sans-serif",
                      backgroundColor: "#faf5fa",
                      minHeight      : "80px",
                      lineHeight     : "1.6",
                    }}
                  >
                    {teacher.qualifications || <span style={{ color: "#c9a8c9" }}>—</span>}
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>

            <Card title="Login / Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField label="Username" value={teacher.username || null} />
                <ReadField label="Password" value="••••••••" />
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField label="Phone"   value={person.phone} />
                <ReadField label="Email"   value={person.email} />
                <ReadField label="Address" value={person.address} full />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teacher_profile;