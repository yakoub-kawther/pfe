import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid } from "lucide-react";
import { apiFetch } from "../services/api";

const thStyle = {
  padding: "12px 16px", fontSize: "14px", fontWeight: 500,
  textAlign: "left", whiteSpace: "nowrap", color: "#701366",
};

const tdStyle = {
  padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap",
};

const Table = ({ search = "", filter = "All", role = "admin" }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiFetch("/persons/students/")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const p        = s.person ?? {};
    const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
    const q        = search.toLowerCase();
    const matchSearch = !q ||
      fullName.toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q) ||
      (s.parent_name ?? "").toLowerCase().includes(q);
    const matchFilter = filter === "All";
    return matchSearch && matchFilter;
  });

  return (
    <div style={{
      width: "100%", background: "white", borderRadius: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
        <thead>
          <tr style={{ background: "#F8E0F8", height: "50px" }}>
            <th style={{ ...thStyle, paddingLeft: "30px" }}>Name</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Date of Birth</th>
            <th style={thStyle}>Parent</th>
            <th style={thStyle}>Special Case</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                Loading...
              </td>
            </tr>
          ) : filtered.length > 0 ? (
            filtered.map((s, idx) => {
              const p        = s.person ?? {};
              const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
              return (
                <tr
                  key={p.id ?? idx}
                  style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "30px" }}>{fullName || "—"}</td>
                  <td style={tdStyle}>{p.phone        || "—"}</td>
                  <td style={tdStyle}>{p.email        || "—"}</td>
                  <td style={tdStyle}>{s.date_of_birth || "—"}</td>
                  <td style={tdStyle}>{s.parent_name  || "—"}</td>
                  <td style={tdStyle}>{s.special_case || "—"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        aria-label="Edit"
                        onClick={() => navigate(
                          role === "secretary" ? "/Edit_student_secretary" : "/Edit_student",
                          { state: { student: s } }
                        )}
                        style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", transition: "background 0.15s, color 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        <SquarePen style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button
                        aria-label="More"
                        onClick={() => navigate(
                          role === "secretary" ? "/Student_profile_secretary" : "/Student_profile",
                          { state: { student: s } }
                        )}
                        style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", transition: "background 0.15s, color 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        <LayoutGrid style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;