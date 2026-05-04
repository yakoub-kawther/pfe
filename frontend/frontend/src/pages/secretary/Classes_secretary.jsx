import React, { useState } from "react";
import Secretary_layout from "../../layouts/Secretary_layout";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Searchbar from "../../components/Searchbar";

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

const statusStyles = {
  green: { background: "#dcfce7", color: "#16a34a" },
  red:   { background: "#fee2e2", color: "#ef4444" },
};

export default function Classes_secretary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const classesData = [
    {
      name: "Class A", language: "English", level: "B2", teacher: "Mr Ahmed",
      students: 15, year: "2024-2025", status: { text: "Inactive", color: "red" },
    },
    {
      name: "Class B", language: "French", level: "C1", teacher: "Mme Sara",
      students: 20, year: "2025-2026", status: { text: "Active", color: "green" },
    },
  ];

  const filteredClasses = classesData.filter((cls) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      cls.name.toLowerCase().includes(q)     ||
      cls.language.toLowerCase().includes(q) ||
      cls.teacher.toLowerCase().includes(q)  ||
      cls.level.toLowerCase().includes(q)    ||
      cls.year.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || cls.status.text === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Secretary_layout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Header + search */}
<div
  className="flex items-center justify-between flex-wrap gap-4"
  style={{ marginTop: "30px" }}
>       <h2 className="text-xl sm:text-2xl  text-[#701366]">Classes</h2>
   <div className="w-auto">

  <Searchbar
    placeholder="Search by name, language, teacher..."
    filterOptions={["Active", "Inactive"]}
    addPath="/Add_classes_secretary"
    showAdd={true}
    onSearchChange={(val) => setSearch(val)}
    onFilterChange={(val) => setFilter(val)}
  />
</div>
  </div>


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
              <tr style={{ background: "#F8E0F8", height: "50px" }}>
                <th style={{ ...thStyle, paddingLeft: "30px", width: "16%" }}>Name</th>
                <th style={{ ...thStyle, width: "14%" }}>Language</th>
                <th style={{ ...thStyle, width: "10%" }}>Level</th>
                <th style={{ ...thStyle, width: "16%" }}>Teacher</th>
                <th style={{ ...thStyle, width: "12%" }}>Students</th>
                <th style={{ ...thStyle, width: "14%" }}>Year</th>
                <th style={{ ...thStyle, width: "12%" }}>Status</th>
                <th style={{ ...thStyle, width: "10%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No classes found.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, idx) => (
                  <tr
                    key={idx}
                    style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "30px" }}>{cls.name}</td>
                    <td style={tdStyle}>{cls.language}</td>
                    <td style={tdStyle}>{cls.level}</td>
                    <td style={tdStyle}>{cls.teacher}</td>
                    <td style={tdStyle}>{cls.students}</td>
                    <td style={tdStyle}>{cls.year}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 12px", borderRadius: "9999px",
                        fontSize: "12px", fontWeight: 500,
                        ...statusStyles[cls.status.color],
                        flexShrink: 0, whiteSpace: "nowrap",
                      }}>
                        ● {cls.status.text}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate("/Classes_information_secretary", { state: { cls } })}
                        style={{
                          padding: "6px", borderRadius: "4px", border: "none",
                          background: "none", color: "#701366", cursor: "pointer",
                          transition: "background 0.15s, color 0.15s, transform 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white";   e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)";   }}
                      >
                        <LayoutGrid style={{ width: "16px", height: "16px" }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Secretary_layout>
  );
}