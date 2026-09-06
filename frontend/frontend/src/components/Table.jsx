import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";

const thStyle = {
  padding: "12px 16px", fontSize: "14px", fontWeight: 500,
  textAlign: "left", whiteSpace: "nowrap", color: "#701366",
};

const tdStyle = {
  padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap",
};

const attendanceColor = (pct) => {
  if (pct < 30) return "#c92c2c";
  if (pct < 70) return "#c9971c";
  return "#1a7f4b";
};

const statusStyle = (statusValue) => {
  const s = (statusValue ?? "").toLowerCase();
  if (s === "active")   return { bg: "#e3f5ec", color: "#1a7f4b" };
  if (s === "inactive") return { bg: "#fbe4e4", color: "#c92c2c" };
  return { bg: "#fdf3d9", color: "#c9971c" }; // pending / fallback
};

const PAGE_SIZE = 10;

const Table = ({ students = [], loading = false, search = "", filter = "All", role = "admin" }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const filtered = students.filter((s) => {
    const p        = s.person ?? {};
    const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
    const q        = search.toLowerCase();
    const matchSearch = !q ||
      fullName.toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q) ||
      (s.parent_name ?? "").toLowerCase().includes(q);
    const matchFilter = filter === "All" || (s.status ?? "pending").toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  const pageBtn = (active) => ({
    width: "32px", height: "32px",
    borderRadius: "8px", border: "1px solid #701366",
    background: active ? "#701366" : "white",
    color: active ? "white" : "#701366",
    fontSize: "13px", fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  });

  const iconBtn = {
    width: "32px", height: "32px",
    borderRadius: "8px", border: "1px solid #701366",
    background: "white", color: "#701366",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  };

  return (
    <div>
      <div style={{
        width: "100%", background: "white", borderRadius: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
          <thead>
            <tr style={{ background: "#F8E0F8", height: "50px" }}>
              <th style={{ ...thStyle, paddingLeft: "30px" }}>Full Name</th>
              <th style={thStyle}>Parent Name</th>
              <th style={thStyle}>Contact</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Attendance</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Language</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
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
            ) : paginated.length > 0 ? (
              paginated.map((s, idx) => {
                const p          = s.person ?? {};
                const fullName   = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
                const langCount  = s.languages_count ?? (s.enrollments ? s.enrollments.length : 0);
                const attendance = s.attendance_percentage ?? 0;
                const { bg: statusBg, color: statusColor } = statusStyle(s.status);
                return (
                  <tr
                    key={p.id ?? idx}
                    style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "30px" }}>{fullName || "—"}</td>
                    <td style={tdStyle}>{s.parent_name || "—"}</td>
                    <td style={tdStyle}>{p.phone || p.email || "—"}</td>
                    <td style={{ ...tdStyle, color: attendanceColor(attendance), fontWeight: 600, textAlign: "center" }}>
                      {attendance}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {langCount} {langCount === 1 ? "language" : "languages"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 12px", borderRadius: "999px",
                        fontSize: "12px", fontWeight: 600, textTransform: "capitalize",
                        background: statusBg, color: statusColor,
                      }}>
                        {s.status || "pending"}
                      </span>
                    </td>
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

      {!loading && filtered.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "16px", fontSize: "13px", color: "#701366",
        }}>
          <span style={{ opacity: 0.6 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ ...iconBtn, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "default" : "pointer" }}
              onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} style={{ padding: "0 4px", opacity: 0.5 }}>…</span>
                ) : (
                  <button key={p} onClick={() => goTo(p)} style={pageBtn(p === currentPage)}>
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ ...iconBtn, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "default" : "pointer" }}
              onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;