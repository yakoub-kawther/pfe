import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { SquarePen, Plus, Users, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";  // ✅ import Tabs
import { apiFetch } from "../../services/api";

const F = "'Inter', sans-serif";
const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

//  moved outside component is fine, but must be used correctly
const classTabs = [
  { name: "Classes",    path: "/Classes"    },
  { name: "Classrooms", path: "/Classrooms" },
  { name: "Language",   path: "/Languages"  },
  { name: "Positions",  path: "/Positions"  },
];

export default function Positions() {
  const navigate = useNavigate();
  const [positions,  setPositions]  = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [posLoading, setPosLoading] = useState(false);

  const fetchPositions = useCallback(async () => {
    setPosLoading(true);
    try {
      const res  = await apiFetch("/academic/positions/");
      if (!res.ok) return;
      const data = await res.json();
      setPositions(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
    } finally {
      setPosLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res  = await apiFetch("/persons/employees/non-teachers/");
      if (!res.ok) return;
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : (data.results ?? []));
    } catch {}
  }, []);

  useEffect(() => {
    fetchPositions();
    fetchEmployees();
  }, [fetchPositions, fetchEmployees]);

  const countFor = (name) => employees.filter(e => (e.position?.name ?? "").toLowerCase() === name.toLowerCase()).length;
  const isActive = (name) => countFor(name) > 0;

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
        .pos-action-btn { padding:6px;border-radius:6px;border:none;background:none;color:#701366;cursor:pointer;transition:background .15s,color .15s,transform .15s;display:flex;align-items:center; }
        .pos-action-btn:hover { background:#701366;color:white;transform:scale(1.1); }
        .pos-primary-btn { display:inline-flex;align-items:center;gap:7px;padding:0 18px;height:38px;border-radius:10px;background:#701366;color:white;font-size:13.5px;font-weight:600;border:2px solid #701366;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;box-shadow:0 2px 8px rgba(112,19,102,.13);font-family:${F}; }
        .pos-primary-btn:hover { background:white;color:#701366;box-shadow:0 4px 16px rgba(112,19,102,.18); }
      `}</style>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0, marginTop: "30px" }}>

        {/*  Tabs + Add button on same row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={classTabs} />
          <button className="pos-primary-btn" onClick={() => navigate("/Add_position")}>
            <Plus style={{ width: "16px", height: "16px" }} /> Add Position
          </button>
        </div>

        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "24px", width: "12%" }}>ID</th>
                <th style={{ ...thStyle, width: "38%" }}>Position</th>
                <th style={{ ...thStyle, width: "18%" }}>Employees</th>
                <th style={{ ...thStyle, width: "18%" }}>Status</th>
                <th style={{ ...thStyle, width: "14%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {posLoading && <LoadingRow cols={5} />}
              {!posLoading && positions.length === 0 && <EmptyRow cols={5} message="No positions found." />}
              {!posLoading && positions.map((pos) => {
                const count  = countFor(pos.name);
                const active = isActive(pos.name);
                return (
                  <tr
                    key={pos.id}
                    style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background .1s", opacity: active ? 1 : 0.65 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "24px", fontWeight: 600, color: "#a050a0" }}>#{pos.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{pos.name || "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: "#eff6ff", color: "#2563eb" }}>
                        <Users style={{ width: "11px", height: "11px" }} /> {count}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: active ? "#dcfce7" : "#fee2e2", color: active ? "#16a34a" : "#dc2626" }}>
                        ● {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button className="pos-action-btn" onClick={() => navigate("/Edit_position", { state: { position: { ...pos, active, count } } })}>
                        <SquarePen style={{ width: "16px", height: "16px" }} />
                      </button>
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