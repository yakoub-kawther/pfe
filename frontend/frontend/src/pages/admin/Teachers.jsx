import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { SquarePen, LayoutGrid, Loader2, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { useTeachers } from "../../hooks/useTeachers";

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

const statusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-block",
  background: status === "active" ? "#e6f7ec" : "#fdecea",
  color: status === "active" ? "#1a7f4b" : "#c92c2c",
  textTransform: "capitalize",
});

const PAGE_SIZE = 10;

const SummaryCard = ({ icon, label, value, color }) => (
  <div style={{
    flex: 1,
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }}>
    <div style={{
      width: "44px", height: "44px", borderRadius: "12px",
      background: `${color}1a`, color, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "13px", color: "#701366", opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#701366" }}>{value}</div>
    </div>
  </div>
);

const Teachers = () => {
  const navigate = useNavigate();

  // What the user is typing right now (updates instantly, for a responsive input)
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // What actually drives the query (updates 500ms after typing stops, so we
  // don't fire a network request on every keystroke)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { teachers, loading, error } = useTeachers(debouncedSearch, filter);

  const [page, setPage] = useState(1);

  // Reset to page 1 when search/filter changes (derived during render, not in an effect)
  // const prevKeyRef = useRef(`${debouncedSearch}|${filter}`);
  // const currentKey = `${debouncedSearch}|${filter}`;
  // if (prevKeyRef.current !== currentKey) {
  //   prevKeyRef.current = currentKey;
  //   if (page !== 1) setPage(1);
  // }

  const totalCount    = teachers.length;
  const activeCount   = teachers.filter(t => (t.employee?.status ?? "").toLowerCase() === "active").length;
  const inactiveCount = totalCount - activeCount;

  const totalPages = Math.max(1, Math.ceil(teachers.length / PAGE_SIZE));
  const paginated  = teachers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Page Title */}
        <div style={{ marginBottom: "4px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#701366",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Teachers
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#701366",
            opacity: 0.55,
            margin: "4px 0 0",
          }}>
            Manage teaching staff, languages, and status
          </p>
        </div>

        {/* Summary */}
        <section style={{ display: "flex", gap: "16px", marginTop: "0px" }}>
          <SummaryCard icon={<Users size={22} />}     label="Total Teachers"    value={totalCount}    color="#701366" />
          <SummaryCard icon={<UserCheck size={22} />} label="Active Teachers"   value={activeCount}   color="#1a7f4b" />
          <SummaryCard icon={<UserX size={22} />}      label="Inactive Teachers" value={inactiveCount} color="#c92c2c" />
        </section>

        {/* Search */}
        <section className="flex items-center gap-4">
          <h2 style={{ fontSize: "18px", color: "#701366", fontWeight: "bold", margin: 0, flexShrink: 0 }}>
            Teachers List
          </h2>
          <Searchbar
            placeholder=" Name, phone, Head Teacher..."
            filterOptions={["Active", "Inactive"]}
            addPath="/Add_teacher"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </section>

        {/* Table */}
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
              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No teachers found.</td>
                </tr>
              )}
              {!loading && !error && paginated.map((teacher) => {
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
                      <span style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: teacher.is_head_teacher ? "#1d4ed8" : "#c2760c",
                      }}>
                        {teacher.is_head_teacher ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusStyle(status)}>
                        {status || "---"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
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

        {/* Pagination */}
        {!loading && !error && teachers.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: "13px", color: "#701366", marginTop: "-8px",
          }}>
            <span style={{ opacity: 0.6 }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, teachers.length)} of {teachers.length}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                style={{ ...iconBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
                onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} style={{ padding: "0 4px", opacity: 0.5 }}>…</span>
                  ) : (
                    <button key={p} onClick={() => goTo(p)} style={pageBtn(p === page)}>
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                style={{ ...iconBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
                onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teachers;