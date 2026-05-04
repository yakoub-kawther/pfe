import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { SquarePen, LayoutGrid, Plus, Users, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";

const F = "'Inter', sans-serif";
const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

export default function Employees() {
  const navigate = useNavigate();
  const [nonTeacherEmployees, setNonTeacherEmployees] = useState([]);
  const [nonTeacherLoading,   setNonTeacherLoading]   = useState(false);
  const [nonTeacherError,     setNonTeacherError]     = useState(null);

  const fetchNonTeacherEmployees = useCallback(async () => {
    setNonTeacherLoading(true);
    setNonTeacherError(null);
    try {
      const res  = await apiFetch("/persons/employees/non-teachers/");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setNonTeacherEmployees(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setNonTeacherError(err.message || "Failed to load employees.");
    } finally {
      setNonTeacherLoading(false);
    }
  }, []);

  useEffect(() => { fetchNonTeacherEmployees(); }, [fetchNonTeacherEmployees]);

  const LoadingRow = ({ cols }) => (
    <tr>
      <td colSpan={cols} style={{ textAlign: "center", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
          <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "14px", fontFamily: F }}>Loading...</span>
        </div>
      </td>
    </tr>
  );

  const EmptyRow = ({ cols, message }) => (
    <tr>
      <td colSpan={cols} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px", fontFamily: F }}>
        {message}
      </td>
    </tr>
  );

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .emp-action-btn { padding:6px;border-radius:6px;border:none;background:none;color:#701366;cursor:pointer;transition:background .15s,color .15s,transform .15s;display:flex;align-items:center; }
        .emp-action-btn:hover { background:#701366;color:white;transform:scale(1.1); }
        .emp-primary-btn { display:inline-flex;align-items:center;gap:7px;padding:0 18px;height:38px;border-radius:10px;background:#701366;color:white;font-size:13.5px;font-weight:600;border:2px solid #701366;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;box-shadow:0 2px 8px rgba(112,19,102,.13);font-family:${F}; }
        .emp-primary-btn:hover { background:white;color:#701366;box-shadow:0 4px 16px rgba(112,19,102,.18); }
      `}</style>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0, marginTop: "30px" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>Employees</h2>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="emp-primary-btn" onClick={() => navigate("/Add_employee")}>
            <Plus style={{ width: "16px", height: "16px" }} /> Add Employee
          </button>
        </div>

        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "24px", width: "22%" }}>Name</th>
                <th style={{ ...thStyle, width: "18%" }}>Phone</th>
                <th style={{ ...thStyle, width: "20%" }}>Position</th>
                <th style={{ ...thStyle, width: "18%" }}>Hire Date</th>
                <th style={{ ...thStyle, width: "14%" }}>Status</th>
                <th style={{ ...thStyle, width: "8%"  }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {nonTeacherLoading && <LoadingRow cols={6} />}
              {!nonTeacherLoading && nonTeacherError && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{nonTeacherError}</td></tr>
              )}
              {!nonTeacherLoading && !nonTeacherError && nonTeacherEmployees.length === 0 && <EmptyRow cols={6} message="No employees found." />}
              {!nonTeacherLoading && !nonTeacherError && nonTeacherEmployees.map((emp) => {
                const person   = emp.person   ?? {};
                const position = emp.position ?? {};
                const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
                const status   = emp.status ?? "inactive";
                const active   = status === "active";
                return (
                  <tr
                    key={emp.person_id}
                    style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "24px", fontWeight: 500 }}>{fullName || "—"}</td>
                    <td style={tdStyle}>{person.phone || "—"}</td>
                    <td style={tdStyle}>{position.name || "—"}</td>
                    <td style={tdStyle}>{emp.hire_date || "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: active ? "#dcfce7" : "#fee2e2", color: active ? "#16a34a" : "#dc2626" }}>
                        ● {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button className="emp-action-btn" onClick={() => navigate("/Edit_employee", { state: { employee: emp } })}>
                          <SquarePen style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button className="emp-action-btn" onClick={() => navigate("/Employee_profile", { state: { employee: emp } })}>
                          <LayoutGrid style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
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