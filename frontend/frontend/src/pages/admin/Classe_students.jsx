import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";
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

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function Classe_students() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");

  const fetchStudents = useCallback(async () => {
    if (!cls?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/inscriptions/?class_id=${cls.id}&status=confirmed`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [cls]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const classTabs = [
    { name: "Details",  path: "/Classe_information", state: { cls } },
    { name: "Students", path: "/Classe_students",    state: { cls } },
    { name: "Sessions", path: "/Classe_sessions",     state: { cls } },
  ];

  const filteredStudents = students.filter(s =>
    (s.student_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Classes")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#701366", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Class Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={classTabs} />
        </div>

        {/* Search */}
        <section className="flex items-center gap-4">
          <h2 style={{ fontSize: "18px", color: "#701366", fontWeight: "bold", margin: 0, flexShrink: 0 }}>
            Students ({filteredStudents.length})
          </h2>
          <Searchbar
            placeholder=" Search student..."
            showAdd={false}
            onSearchChange={(val) => setSearch(val)}
          />
        </section>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, width: "50%" }}>First Name</th>
                <th style={{ ...thStyle, width: "50%" }}>Last Name</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading students...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error}</td>
                </tr>
              )}
              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No students found.</td>
                </tr>
              )}
              {!loading && !error && filteredStudents.map((s, i) => (
                <tr
                  key={i}
                  style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={tdStyle}>{s.student_name?.split(" ")[0] || "---"}</td>
                  <td style={tdStyle}>{s.student_name?.split(" ").slice(1).join(" ") || "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}