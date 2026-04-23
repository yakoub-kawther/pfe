import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useLocation } from "react-router-dom";

const classesData = [
  { language: "English", level: "B2", group: "Group A", schedule: "Mon / Wed", students: 12, status: "In Progress" },
  { language: "French",  level: "A1", group: "Group B", schedule: "Tue / Thu", students: 10, status: "Completed"   },
  { language: "Arabic",  level: "C1", group: "Group C", schedule: "Sat",       students: 8,  status: "In Progress" },
];

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

export default function Classes_teacher() {
  const { state } = useLocation();
  const teacher = state?.teacher;

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", margin: 0, flexShrink: 0 }}>Classes</h2>

        <Tabs tabs={teacherTabs} />

        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "30px", width: "20%" }}>Language</th>
                <th style={{ ...thStyle, width: "12%" }}>Level</th>
                <th style={{ ...thStyle, width: "15%" }}>Group</th>
                <th style={{ ...thStyle, width: "18%" }}>Schedule</th>
                <th style={{ ...thStyle, width: "15%" }}>Students</th>
                <th style={{ ...thStyle, width: "20%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {classesData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "30px" }}>{row.language}</td>
                  <td style={tdStyle}>{row.level}</td>
                  <td style={tdStyle}>{row.group}</td>
                  <td style={tdStyle}>{row.schedule}</td>
                  <td style={tdStyle}>{row.students}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "3px 12px", borderRadius: "9999px",
                      fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap",
                      background: row.status === "In Progress" ? "#F8E0F8" : "#701366",
                      color:      row.status === "In Progress" ? "#701366"  : "white",
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}