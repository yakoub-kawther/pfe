import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { SquarePen, LayoutGrid, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const thStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  fontWeight: 500,
  textAlign : "left",
  whiteSpace: "nowrap",
  color     : "#701366",
};

const tdStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  color     : "#701366",
  whiteSpace: "nowrap",
};

const Teachers = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");

  const buildParams = useCallback((searchVal, filterVal) => {
    const params = new URLSearchParams();
    if (searchVal.trim()) {
      const q = searchVal.trim().toLowerCase();
      if (q === "yes")       params.set("is_head_teacher", "true");
      else if (q === "no")   params.set("is_head_teacher", "false");
      else                   params.set("search", searchVal.trim());
    }
    if (filterVal && filterVal !== "All")
      params.set("employee__status", filterVal.toLowerCase());
    return params.toString();
  }, []);

  const fetchTeachers = useCallback(async (searchVal, filterVal) => {
    setLoading(true);
    setError(null);
    try {
      const qs  = buildParams(searchVal, filterVal);
      const res = await apiFetch(`/persons/teachers/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(err.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTeachers(search, filter), 0.5);
    return () => clearTimeout(timer);
  }, [search, filter, fetchTeachers]);

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        <section style={{ display: "flex", alignItems: "center", gap: "16px", height: "40px", marginTop: "30px", flexShrink: 0, minWidth: 0 }}>
          <h1 style={{ fontSize: "24px", color: "#701366", whiteSpace: "nowrap", margin: 0, flexShrink: 0 }}>
            Teachers List
          </h1>
          </section>
        {/* </div> */}
        
          <Searchbar
            placeholder=" Name, phone, Head Teacher..."
            filterOptions={["Active", "Inactive"]}
            addPath="/Add_teacher"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        

        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "20%" }}>Name</th>
                <th style={{ ...thStyle, width: "22%" }}>Email</th>
                <th style={{ ...thStyle, width: "14%" }}>Phone</th>
                <th style={{ ...thStyle, width: "12%" }}>Language</th>
                <th style={{ ...thStyle, width: "13%" }}>Head Teacher</th>
                <th style={{ ...thStyle, width: "11%" }}>Status</th>
                <th style={{ ...thStyle, width: "8%"  }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading teachers...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error}</td>
                </tr>
              )}
              {!loading && !error && teachers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No teachers found.</td>
                </tr>
              )}
              {!loading && !error && teachers.map((teacher) => {
                const person   = teacher.employee?.person ?? {};
                const employee = teacher.employee         ?? {};
                const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
                const status   = (employee.status ?? "").toLowerCase();
                return (
                  <tr
                    key={employee.person_id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "20px" }}>{fullName || "---"}</td>
                    <td style={tdStyle}>{person.email  || "---"}</td>
                    <td style={tdStyle}>{person.phone  || "---"}</td>
                    <td style={tdStyle}>{teacher.language?.language_name ?? "---"}</td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, background: teacher.is_head_teacher ? "#f8e0f8" : "#e5e7eb", color: teacher.is_head_teacher ? "#701366" : "#374151", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {teacher.is_head_teacher ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                   display: "inline-flex", alignItems: "center", gap: "5px",
                   padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    fontFamily: "Inter, sans-serif", letterSpacing: "0.03em",
                   background: status === "active" ? "#dcfce7" : "#fee2e2",
                   color:      status === "active" ? "#15803d"  : "#b91c1c",
                   border:     `0px solid ${status === "active" ? "#bbf7d0" : "#fecaca"}`,
                   whiteSpace: "nowrap", flexShrink: 0,
                 }}>
                   <span style={{
                     width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                     background: status === "active" ? "#16a34a" : "#dc2626",
                   }} />
                   {status ? status.charAt(0).toUpperCase() + status.slice(1) : "---"}
                 </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button aria-label="Edit" onClick={() => navigate("/Edit_teacher", { state: { teacher } })}
                          style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", transition: "background 0.15s, color 0.15s, transform 0.15s", flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <SquarePen style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                        </button>
                        <button aria-label="More" onClick={() => navigate("/Teacher_profile", { state: { teacher } })}
                          style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", transition: "background 0.15s, color 0.15s, transform 0.15s", flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <LayoutGrid style={{ width: "16px", height: "16px", flexShrink: 0 }} />
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
};

export default Teachers;