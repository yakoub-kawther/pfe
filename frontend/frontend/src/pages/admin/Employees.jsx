import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SquarePen, LayoutGrid, Plus, Users, Briefcase } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const F = "'Inter', sans-serif";

const employeesData = [
  { id: 1, name: "test",  phone: "055555555", position: "Secretaire",    hireDate: "15-05-2025", status: "Active",   gender: "Female", dob: "", address: "", username: "test"  },
  { id: 2, name: "test2", phone: "066666666", position: "Cleaning Lady", hireDate: "08-02-2025", status: "Inactive", gender: "Female", dob: "", address: "", username: "test2" },
  { id: 3, name: "test3", phone: "077777777", position: "Receptionist",  hireDate: "23-02-2026", status: "Active",   gender: "Male",   dob: "", address: "", username: "test3" },
];

const initialPositions = [
  { id: 1, position: "Secretaire"    },
  { id: 2, position: "Cleaning Lady" },
  { id: 3, position: "Receptionist"  },
  { id: 4, position: "HR Manager"    }, // no employees → auto inactive
];

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

const tabs = [
  { key: "employees", label: "Employees", icon: Users     },
  { key: "positions", label: "Positions", icon: Briefcase },
];

export default function Employees() {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState("employees");
  const [positions] = useState(initialPositions);

  // A position is active only when it has at least 1 employee
  const countFor  = (posName) => employeesData.filter(e => e.position === posName).length;
  const isActive  = (posName) => countFor(posName) > 0;

  return (
    <DashboardLayout>
      <style>{`
        .emp-action-btn { padding:6px;border-radius:6px;border:none;background:none;color:#701366;cursor:pointer;transition:background .15s,color .15s,transform .15s;display:flex;align-items:center; }
        .emp-action-btn:hover { background:#701366;color:white;transform:scale(1.1); }
        .emp-primary-btn { display:inline-flex;align-items:center;gap:7px;padding:0 18px;height:38px;border-radius:10px;background:#701366;color:white;font-size:13.5px;font-weight:600;border:2px solid #701366;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;box-shadow:0 2px 8px rgba(112,19,102,.13);font-family:${F}; }
        .emp-primary-btn:hover { background:white;color:#701366;box-shadow:0 4px 16px rgba(112,19,102,.18); }
      `}</style>

      <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:"24px",paddingTop:"6px",boxSizing:"border-box",minWidth:0,marginTop:"30px" }}>

        <h2 style={{ fontSize:"24px",color:"#701366",fontFamily:F,margin:0 }}>Employees</h2>

        <div style={{ display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap" }}>
          {/* Pill tabs */}
          <div style={{ display:"flex",gap:"4px",background:"#f8e0f8",borderRadius:"14px",padding:"4px",flexShrink:0 }}>
            {tabs.map(({ key, label, icon: Icon }) => {
              const on = activeTab === key;
              return (
                <button key={key} onClick={() => setActiveTab(key)} style={{ display:"inline-flex",alignItems:"center",gap:"7px",padding:"9px 22px",borderRadius:"10px",border:"none",cursor:"pointer",fontFamily:F,fontSize:"14px",fontWeight:on?600:400,color:on?"#701366":"#9c5094",background:on?"white":"transparent",boxShadow:on?"0 2px 8px rgba(112,19,102,.12)":"none",transition:"all .2s" }}>
                  <Icon style={{ width:"15px",height:"15px" }} /> {label}
                </button>
              );
            })}
          </div>

          <div style={{ flex:1,display:"flex",justifyContent:"flex-end" }}>
            {activeTab === "employees"
              ? <button className="emp-primary-btn" onClick={() => navigate("/Add_employee")}><Plus style={{ width:"16px",height:"16px" }} /> Add Employee</button>
              : <button className="emp-primary-btn" onClick={() => navigate("/Add_position")}><Plus style={{ width:"16px",height:"16px" }} /> Add Position</button>
            }
          </div>
        </div>

        {/* ── EMPLOYEES TABLE ── */}
        {activeTab === "employees" && (
          <div style={{ width:"100%",background:"white",borderRadius:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.06)",overflow:"hidden" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",tableLayout:"fixed" }}>
              <thead>
                <tr style={{ background:"#F8E0F8",height:"48px" }}>
                  <th style={{ ...thStyle,paddingLeft:"24px",width:"22%" }}>Name</th>
                  <th style={{ ...thStyle,width:"18%" }}>Phone</th>
                  <th style={{ ...thStyle,width:"20%" }}>Position</th>
                  <th style={{ ...thStyle,width:"18%" }}>Hire Date</th>
                  <th style={{ ...thStyle,width:"14%" }}>Status</th>
                  <th style={{ ...thStyle,width:"8%"  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeesData.map((emp) => (
                  <tr key={emp.id} style={{ height:"50px",borderBottom:"1px solid #f8e0f8",transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background="white"}
                  >
                    <td style={{ ...tdStyle,paddingLeft:"24px",fontWeight:500 }}>{emp.name}</td>
                    <td style={tdStyle}>{emp.phone}</td>
                    <td style={tdStyle}>{emp.position}</td>
                    <td style={tdStyle}>{emp.hireDate}</td>
                    <td style={tdStyle}>
                      <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 12px",borderRadius:"9999px",fontSize:"12px",fontFamily:F,fontWeight:600,background:emp.status==="Active"?"#dcfce7":"#fee2e2",color:emp.status==="Active"?"#16a34a":"#dc2626" }}>● {emp.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
                        <button className="emp-action-btn" onClick={() => navigate("/Edit_employee", { state:{ employee:emp } })}><SquarePen style={{ width:"16px",height:"16px" }} /></button>
                        <button className="emp-action-btn" onClick={() => navigate("/Employee_profile", { state:{ employee:emp } })}><LayoutGrid style={{ width:"16px",height:"16px" }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── POSITIONS TABLE ── */}
        {activeTab === "positions" && (
          <div style={{ width:"100%",background:"white",borderRadius:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.06)",overflow:"hidden" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",tableLayout:"fixed" }}>
              <thead>
                <tr style={{ background:"#F8E0F8",height:"48px" }}>
                  <th style={{ ...thStyle,paddingLeft:"24px",width:"12%" }}>ID</th>
                  <th style={{ ...thStyle,width:"38%" }}>Position</th>
                  <th style={{ ...thStyle,width:"18%" }}>Employees</th>
                  <th style={{ ...thStyle,width:"18%" }}>Status</th>
                  <th style={{ ...thStyle,width:"14%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const count  = countFor(pos.position);
                  const active = isActive(pos.position);
                  return (
                    <tr key={pos.id} style={{ height:"50px",borderBottom:"1px solid #f8e0f8",transition:"background .1s",opacity:active?1:0.65 }}
                      onMouseEnter={e => e.currentTarget.style.background="#fffafe"}
                      onMouseLeave={e => e.currentTarget.style.background="white"}
                    >
                      <td style={{ ...tdStyle,paddingLeft:"24px",fontWeight:600,color:"#a050a0" }}>#{pos.id}</td>
                      <td style={{ ...tdStyle,fontWeight:500 }}>{pos.position}</td>
                      <td style={tdStyle}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:"5px",padding:"3px 12px",borderRadius:"9999px",fontSize:"12px",fontFamily:F,fontWeight:600,background:"#eff6ff",color:"#2563eb" }}>
                          <Users style={{ width:"11px",height:"11px" }} /> {count}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {/* Same badge style as employees — auto-driven by employee count */}
                        <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 12px",borderRadius:"9999px",fontSize:"12px",fontFamily:F,fontWeight:600,background:active?"#dcfce7":"#fee2e2",color:active?"#16a34a":"#dc2626" }}>
                          ● {active?"Active":"Inactive"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button className="emp-action-btn" onClick={() => navigate("/Edit_position", { state:{ position:{ ...pos, active, count } } })}>
                          <SquarePen style={{ width:"16px",height:"16px" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}