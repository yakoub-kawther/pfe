import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, AlertTriangle, Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";

const F = "'Inter', sans-serif";

const existingPositions = [
  { name: "Secretaire",    count: 1 },
  { name: "Cleaning Lady", count: 1 },
  { name: "Receptionist",  count: 1 },
];

const NEXT_ID = 4;

const labelStyle  = { fontSize:"13px",fontWeight:600,color:"#701366",marginBottom:"6px",display:"block",fontFamily:F };
const inputBase   = { width:"100%",height:"44px",border:"2px solid #f0d0ee",borderRadius:"10px",padding:"0 14px 0 42px",fontSize:"14px",color:"#3d0a37",background:"#fdf6fd",outline:"none",boxSizing:"border-box",transition:"border-color .2s,box-shadow .2s",fontFamily:F };
const iconStyle   = { position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:"#b07aaa",pointerEvents:"none" };
const readonlyBox = { height:"44px",border:"2px solid #f0d0ee",borderRadius:"10px",padding:"0 14px 0 34px",display:"flex",alignItems:"center",fontSize:"14px",color:"#9c5094",background:"#fafafa",fontFamily:F,boxSizing:"border-box" };

export default function AddPosition() {
  const navigate = useNavigate();
  const [position, setPosition] = useState("");
  const [error,    setError]    = useState("");
  const [dupWarn,  setDupWarn]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  const handleChange = (val) => {
    setPosition(val);
    setError("");
    setDupWarn(existingPositions.some(p => p.name.trim().toLowerCase() === val.trim().toLowerCase()) && val.trim() !== "");
  };

  const handleSave = () => {
    if (!position.trim()) { setError("Position name is required."); return; }
    if (dupWarn)          { setError("Please resolve the duplicate before saving."); return; }
    setSaved(true);

    // TODO: POST { id: NEXT_ID, position } to backend

    setTimeout(() => navigate("/Employees", { state: { tab: "positions" } }), 900);
  };

  const dupMatch = existingPositions.find(p => p.name.trim().toLowerCase() === position.trim().toLowerCase());

  return (
    <DashboardLayout>
      <style>{`
        .ap-input:focus { border-color:#701366 !important;box-shadow:0 0 0 3px rgba(112,19,102,.10) !important;background:white !important; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .dup-banner { animation:slideIn .2s ease; }
      `}</style>

      <div style={{ maxWidth:"460px",margin:"40px auto 0",width:"100%",boxSizing:"border-box" }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px" }}>
          <h2 style={{ fontSize:"22px",color:"#701366",margin:0,fontWeight:500,fontFamily:F }}>Add Position</h2>
          <Buttons cancelPath="/Employees" onSave={handleSave} saveLabel="Save" />
        </div>

        <div style={{ background:"white",borderRadius:"18px",boxShadow:"0 4px 24px rgba(112,19,102,.10)",padding:"36px 32px 32px",display:"flex",flexDirection:"column",gap:"22px" }}>

          {saved && (
            <div style={{ background:"#dcfce7",color:"#16a34a",borderRadius:"8px",padding:"10px 16px",fontSize:"13.5px",fontWeight:400,fontFamily:F }}>
              ✓ Position saved! Redirecting…
            </div>
          )}

          {/* Auto ID */}
          <div>
            <label style={labelStyle}>Position ID <span style={{ fontWeight:400,color:"#9c5094" }}>(auto-assigned)</span></label>
            <div style={{ position:"relative" }}>
              <span style={{ ...iconStyle,fontSize:"14px" }}>#</span>
              <div style={readonlyBox}>{NEXT_ID}</div>
            </div>
          </div>

          {/* Position name */}
          <div>
            <label style={labelStyle}>Position Name</label>
            <div style={{ position:"relative" }}>
              <Briefcase style={{ ...iconStyle,width:"16px",height:"16px" }} />
              <input
                className="ap-input"
                style={{ ...inputBase, borderColor:error?"#dc2626":dupWarn?"#ea580c":"#f0d0ee", boxShadow:error?"0 0 0 3px rgba(220,38,38,.08)":dupWarn?"0 0 0 3px rgba(234,88,12,.10)":"none", background:dupWarn?"#fff7ed":"#fdf6fd" }}
                placeholder="e.g. HR Manager"
                value={position}
                onChange={e => handleChange(e.target.value)}
                disabled={saved}
              />
            </div>

            {dupWarn && !error && (
              <div className="dup-banner" style={{ display:"flex",alignItems:"flex-start",gap:"8px",marginTop:"8px",padding:"10px 14px",background:"#fff7ed",border:"1.5px solid #fb923c",borderRadius:"8px" }}>
                <AlertTriangle style={{ width:"16px",height:"16px",color:"#ea580c",flexShrink:0,marginTop:"1px" }} />
                <div style={{ fontFamily:F,fontSize:"13px",color:"#9a3412",lineHeight:"1.5" }}>
                  <strong>This position already exists.</strong><br />
                  <span style={{ fontWeight:400 }}>"{position}" is already in the database</span>
                  {dupMatch && (
                    <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",marginLeft:"6px",padding:"1px 8px",borderRadius:"9999px",background:"#eff6ff",color:"#2563eb",fontSize:"12px",fontWeight:600 }}>
                      <Users style={{ width:"10px",height:"10px" }} /> {dupMatch.count} employee{dupMatch.count !== 1?"s":""}
                    </span>
                  )}
                  . Edit the existing one instead.
                </div>
              </div>
            )}

            {error && <p style={{ fontSize:"12px",color:"#dc2626",margin:"6px 0 0",fontFamily:F }}>{error}</p>}
          </div>

          {/* Employee count — always 0 for new position */}
          <div style={{ display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",background:"#f8f0f8",borderRadius:"10px" }}>
            <Users style={{ width:"16px",height:"16px",color:"#701366" }} />
            <span style={{ fontSize:"13px",fontFamily:F,color:"#701366" }}>
              Employees assigned: <strong>0</strong>
            </span>
          </div>

          {/* Status — always Inactive for a new position (no employees yet) */}
          <div>
            <label style={labelStyle}>Status <span style={{ fontWeight:400,color:"#9c5094" }}>(auto)</span></label>
            <div style={{ display:"flex",alignItems:"center",gap:"12px" }}>
              <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 16px",borderRadius:"9999px",fontSize:"13px",fontFamily:F,fontWeight:400,background:"#fee2e2",color:"#dc2626" }}>
                ● Inactive
              </span>
              <span style={{ fontSize:"12px",color:"#9c5094",fontFamily:F }}>
                Becomes active once employees are assigned.
              </span>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}