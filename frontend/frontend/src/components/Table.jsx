import React from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid } from "lucide-react";

const studentsData = [
  { name: "Yousra zt",    contact: "0669905547", parent: "abdou zt",       status: { text: "Active",    color: "green"  }, attendance: "100%", languages: 3 },
  { name: "Liam Smith",   contact: "05555555",   parent: "john smith",     status: { text: "Graduated", color: "yellow" }, attendance: "20%",  languages: 2 },
  { name: "Emma Brown",   contact: "07777777",   parent: "brown family",   status: { text: "Inactive",  color: "red"    }, attendance: "70%",  languages: 4 },
  { name: "Noah Martin",  contact: "06612345",   parent: "martin family",  status: { text: "Active",    color: "green"  }, attendance: "40%",  languages: 3 },
  { name: "Olivia Davis", contact: "06789123",   parent: "davis family",   status: { text: "Graduated", color: "yellow" }, attendance: "20%",  languages: 5 },
  { name: "James Lee",    contact: "06123456",   parent: "lee family",     status: { text: "Inactive",  color: "red"    }, attendance: "70%",  languages: 2 },
  { name: "Ava Johnson",  contact: "06987654",   parent: "johnson family", status: { text: "Active",    color: "green"  }, attendance: "40%",  languages: 3 },
];

const statusStyles = {
  green:  { background: "#dcfce7", color: "#16a34a" },
  yellow: { background: "#fef9c3", color: "#ca8a04" },
  red:    { background: "#fee2e2", color: "#ef4444" },
};

const attendanceColor = {
  green:  "#16a34a",
  red:    "#ef4444",
  yellow: "#ca8a04",
};

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

const Table = ({ search = "", filter = "All" }) => {
  const navigate = useNavigate();

  const filteredStudents = studentsData.filter((student) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || student.name.toLowerCase().includes(q) || student.contact.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || student.status.text === filter;
    return matchesSearch && matchesFilter;
  });

  return (
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
            <th style={{ ...thStyle, paddingLeft: "30px", width: "18%" }}>Name</th>
            <th style={{ ...thStyle, width: "14%" }}>Contact</th>
            <th style={{ ...thStyle, width: "16%" }}>Parent Name</th>
            <th style={{ ...thStyle, width: "14%" }}>Statut</th>
            <th style={{ ...thStyle, width: "13%" }}>Attendance</th>
            <th style={{ ...thStyle, width: "12%" }}>Languages</th>
            <th style={{ ...thStyle, width: "13%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <tr
                key={idx}
                style={{ height: "50px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <td style={{ ...tdStyle, paddingLeft: "30px" }}>{student.name}</td>
                <td style={tdStyle}>{student.contact}</td>
                <td style={tdStyle}>{student.parent}</td>
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "3px 12px", borderRadius: "9999px",
                    fontSize: "12px", fontWeight: 500,
                    ...statusStyles[student.status.color],
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    ● {student.status.text}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: attendanceColor[student.status.color] }}>
                  {student.attendance}
                </td>
                <td style={tdStyle}>{student.languages}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      aria-label="Edit"
                      onClick={() => navigate("/Edit_student", { state: { student } })}
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
                      onClick={() => navigate("/Student_profile")}
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