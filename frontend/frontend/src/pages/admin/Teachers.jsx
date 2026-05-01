import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { SquarePen, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";

const teachersData = [
  {
    id: 1,
    name: "Benahmed Ahmed",
    email: "benahmed@gmail.com",
    phone: "0669907507",
    language: "English",
    status: "Active",
    gender: "Male",
    dob: "",
    address: "",
    username: "benahmed",
    head_teacher: true,
  },
  {
    id: 2,
    name: "Benali Ali",
    email: "benali@gmail.com",
    phone: "0555163466",
    language: "French",
    status: "Inactive",
    gender: "Male",
    dob: "",
    address: "",
    username: "benali",
    head_teacher: false,
  },
];

const thStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 500,
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "#701366",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#701366",
  whiteSpace: "nowrap",
};

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers]          = useState(teachersData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const headTeacherMatch =
      (q === "yes" && t.head_teacher === true) ||
      (q === "no"  && t.head_teacher === false);
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.language.toLowerCase().includes(q) ||
      headTeacherMatch;
    const matchFilter = filter === "All" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Header */}
        <section style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          height: "40px",
          marginTop: "30px",
          flexShrink: 0,
          minWidth: 0,
        }}>
        <div className="flex items-center justify-between mt-6">
          <h2 style={{ fontSize: "24px", color: "#701366", margin: 0, flexShrink: 0 }}>
            Teachers List
          </h2>
        </div>
        
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
        <div style={{
          width: "100%",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "20%" }}>Name</th>
                <th style={{ ...thStyle, width: "22%" }}>Email</th>
                <th style={{ ...thStyle, width: "14%" }}>Phone</th>
                <th style={{ ...thStyle, width: "12%" }}>Language</th>
                <th style={{ ...thStyle, width: "13%" }}>Head Teacher</th>
                <th style={{ ...thStyle, width: "11%" }}>Status</th>
                <th style={{ ...thStyle, width: "8%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((teacher) => (
                  <tr
                    key={teacher.id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "20px" }}>{teacher.name}</td>
                    <td style={tdStyle}>{teacher.email}</td>
                    <td style={tdStyle}>{teacher.phone}</td>
                    <td style={tdStyle}>{teacher.language}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 12px", borderRadius: "9999px",
                        fontSize: "12px", fontWeight: 500,
                        background: teacher.head_teacher ? "#f8e0f8" : "#e5e7eb",
                        color:      teacher.head_teacher ? "#701366"  : "#374151",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {teacher.head_teacher ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 12px", borderRadius: "12px",
                        fontSize: "12px",
                        background: teacher.status === "Active" ? "#dcfce7" : "#fee2e2",
                        color:      teacher.status === "Active" ? "#15803d"  : "#dc2626",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {teacher.status || "—"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          aria-label="Edit"
                          onClick={() => navigate("/Edit_teacher", { state: { teacher } })}
                          style={{
                            padding: "6px", borderRadius: "4px", border: "none",
                            background: "none", color: "#701366", cursor: "pointer",
                            transition: "background 0.15s, color 0.15s, transform 0.15s",
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <SquarePen style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                        </button>
                        <button
                          aria-label="More"
                          onClick={() => navigate("/Teacher_profile", { state: { teacher } })}
                          style={{
                            padding: "6px", borderRadius: "4px", border: "none",
                            background: "none", color: "#701366", cursor: "pointer",
                            transition: "background 0.15s, color 0.15s, transform 0.15s",
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <LayoutGrid style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Teachers;