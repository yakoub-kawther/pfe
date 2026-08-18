import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const thStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  fontWeight: 500,
  textAlign : "center",
  whiteSpace: "nowrap",
  color     : "#701366",
};

const tdStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  color     : "#701366",
  whiteSpace: "nowrap",
  textAlign : "center",
};

const statusStyle = (status) => {
  let background = "#fdecea";
  let color      = "#c92c2c";
  if (status === "active") {
    background = "#e6f7ec";
    color      = "#1a7f4b";
  } else if (status === "completed") {
    background = "#f3e6fb";
    color      = "#701366";
  }
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background,
    color,
    textTransform: "capitalize",
  };
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function Classes_teacher() {
  const { state }  = useLocation();
  const navigate    = useNavigate();
  const teacher     = state?.teacher;
  const teacherId   = teacher?.employee?.person_id;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  useEffect(() => {
    if (!teacherId) return;

    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/academic/classes/?teacher=${teacherId}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        setError(err.message || "Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [teacherId]);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Teachers")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Teacher Classes
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={teacherTabs} />
        </div>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, width: "20%" }}>Name</th>
                <th style={{ ...thStyle, width: "18%" }}>Level</th>
                <th style={{ ...thStyle, width: "20%" }}>Language</th>
                <th style={{ ...thStyle, width: "15%" }}>Start Date</th>
                <th style={{ ...thStyle, width: "27%" }}>Status</th>
              </tr>
            </thead>
            <tbody>

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading classes...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#ef4444", fontSize: "14px" }}>
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && classes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No classes found for this teacher.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && !error && classes.map((cls) => {
                const status = (cls.status ?? "").toLowerCase();
                return (
                  <tr
                    key={cls.id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={tdStyle}>{cls.name         || "---"}</td>
                    <td style={tdStyle}>{cls.level_name    ?? "---"}</td>
                    <td style={tdStyle}>{cls.language_name ?? "---"}</td>
                    <td style={tdStyle}>{cls.start_date              || "---"}</td>
                    <td style={tdStyle}>
                      <span style={statusStyle(status)}>
                        {status || "---"}
                      </span>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}