import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid, Plus } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const employeesData = [
  { id: 1, name: "test",  phone: "055555555", position: "Secretaire",    hireDate: "15-05-2025", status: "Active",   gender: "Female", dob: "", address: "", username: "test"  },
  { id: 2, name: "test2", phone: "066666666", position: "Cleaning Lady", hireDate: "08-02-2025", status: "Inactive", gender: "Female", dob: "", address: "", username: "test2" },
  { id: 3, name: "test3", phone: "077777777", position: "Receptionist",  hireDate: "23-02-2026", status: "Active",   gender: "Male",   dob: "", address: "", username: "test3" },
];

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

export default function Employees() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "30px", flexShrink: 0, minWidth: 0 }}>
          <h1 style={{ fontSize: "24px", color: "#701366", margin: 0, flexShrink: 0 }}>Employees</h1>
          <button
            onClick={() => navigate("/Add_employee")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "0 16px", height: "36px", borderRadius: "8px",
              background: "#701366", color: "white", fontSize: "14px",
              border: "1px solid #701366", cursor: "pointer", flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
          >
            <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} /> Add Employee
          </button>
        </div>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "30px", width: "22%" }}>Name</th>
                <th style={{ ...thStyle, width: "18%" }}>Phone</th>
                <th style={{ ...thStyle, width: "20%" }}>Position</th>
                <th style={{ ...thStyle, width: "18%" }}>Hire Date</th>
                <th style={{ ...thStyle, width: "14%" }}>Status</th>
                <th style={{ ...thStyle, width: "8%"  }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.map((emp) => (
                <tr key={emp.id} style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "30px" }}>{emp.name}</td>
                  <td style={tdStyle}>{emp.phone}</td>
                  <td style={tdStyle}>{emp.position}</td>
                  <td style={tdStyle}>{emp.hireDate}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", whiteSpace: "nowrap",
                      background: emp.status === "Active" ? "#dcfce7" : "#fee2e2",
                      color:      emp.status === "Active" ? "#16a34a"  : "#dc2626",
                    }}>● {emp.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button aria-label="Edit" onClick={() => navigate("/Edit_employee", { state: { employee: emp } })}
                        style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                      ><SquarePen style={{ width: "16px", height: "16px" }} /></button>
                      <button aria-label="More" onClick={() => navigate("/Employee_profile", { state: { employee: emp } })}
                        style={{ padding: "6px", borderRadius: "4px", border: "none", background: "none", color: "#701366", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)"; }}
                      ><LayoutGrid style={{ width: "16px", height: "16px" }} /></button>
                    </div>
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