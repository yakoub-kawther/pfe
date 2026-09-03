import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Loader2, X } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const F = "Inter, sans-serif";
const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e2d0e2",
  outline: "none",
  fontSize: "14px",
  color: "#701366",
  fontFamily: F,
};

const labelStyle = { fontSize: "13px", color: "#6b7280", fontFamily: F };

const classTabs = [
  { name: "Classes",    path: "/Classes"    },
  { name: "Classrooms", path: "/Classrooms" },
  { name: "Language",   path: "/Languages"  },
  { name: "Positions",  path: "/Positions"  },
];

function EditPositionModal({ position, onClose, onSaved }) {
  const [name, setName]     = useState(position.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/academic/positions/${position.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const updated = await res.json();
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Failed to save position.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: "16px", padding: "28px",
          width: "380px", maxWidth: "90vw", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#701366", margin: 0, fontFamily: F }}>
            Edit Position
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "#701366", cursor: "pointer", padding: "4px", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Position</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {error && <div style={{ color: "#dc2626", fontSize: "13px" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "9px 18px", borderRadius: "8px", border: "1px solid #701366",
                background: "white", color: "#701366", fontSize: "13px", fontWeight: 600,
                cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 18px", borderRadius: "8px", border: "none",
                background: "#701366", color: "white", fontSize: "13px", fontWeight: 600,
                cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {saving && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const fetchPositions = async () => {
  const res = await apiFetch("/academic/positions/");
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchEmployees = async () => {
  const res = await apiFetch("/persons/employees/non-teachers/");
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

export default function Positions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingPosition, setEditingPosition] = useState(null);

  const { data: positions = [], isLoading: posLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", "non-teachers"],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000,
  });

  const countFor = (name) => employees.filter(e => (e.position?.name ?? "").toLowerCase() === name.toLowerCase()).length;
  const isActive = (name) => countFor(name) > 0;

  const filteredPositions = positions.filter((pos) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (pos.name ?? "").toLowerCase().includes(q) || String(pos.id).includes(q);
  });

  const handleSaved = (updated) => {
    queryClient.setQueryData(["positions"], (prev = []) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    setEditingPosition(null);
  };

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

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Page Title */}
        <div style={{ marginBottom: "4px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#701366", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Positions
          </h1>
          <p style={{ fontSize: "14px", color: "#701366", opacity: 0.55, margin: "4px 0 0" }}>
            Manage staff positions and assignments
          </p>
        </div>

        {/* Tabs + Search */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={classTabs} />
          <Searchbar
            placeholder="Search by id or position..."
            addPath="/Add_position"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
          />
        </section>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "24px", width: "20%" }}>ID</th>
                <th style={{ ...thStyle, width: "20%" }}>Position</th>
                <th style={{ ...thStyle, width: "20%" }}>Employees</th>
                <th style={{ ...thStyle, width: "20%" }}>Status</th>
                <th style={{ ...thStyle, width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {posLoading && <LoadingRow cols={5} />}
              {!posLoading && filteredPositions.length === 0 && <EmptyRow cols={5} message="No positions found." />}
              {!posLoading && filteredPositions.map((pos) => {
                const count  = countFor(pos.name);
                const active = isActive(pos.name);
                return (
                  <tr
                    key={pos.id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background .1s", cursor: "pointer" }}
                    onClick={() => setEditingPosition({ ...pos, active, count })}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "24px", fontWeight: 600, color: "#a050a0" }}>{pos.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{pos.name || "—"}</td>
                    <td style={{ ...tdStyle, color: "#701366", fontWeight: 600 }}>
                      {count} {count === 1 ? "employee" : "employees"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "inline-block",
                        fontFamily: F,
                        background: active ? "#e6f7ec" : "#fdecea",
                        color: active ? "#1a7f4b" : "#c92c2c",
                      }}>
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        className="pos-action-btn"
                        onClick={(e) => { e.stopPropagation(); setEditingPosition({ ...pos, active, count }); }}
                      >
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

      {editingPosition && (
        <EditPositionModal
          position={editingPosition}
          onClose={() => setEditingPosition(null)}
          onSaved={handleSaved}
        />
      )}
    </DashboardLayout>
  );
}