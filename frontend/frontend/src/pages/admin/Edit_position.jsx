import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";

const F = "'Inter', sans-serif";

const labelStyle  = { fontSize:"13px",fontWeight:600,color:"#701366",marginBottom:"6px",display:"block",fontFamily:F };
const inputBase   = { width:"100%",height:"44px",border:"2px solid #f0d0ee",borderRadius:"10px",padding:"0 14px 0 42px",fontSize:"14px",color:"#3d0a37",background:"#fdf6fd",outline:"none",boxSizing:"border-box",transition:"border-color .2s,box-shadow .2s",fontFamily:F };
const iconStyle   = { position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:"#b07aaa",pointerEvents:"none" };
const readonlyBox = { height:"44px",border:"2px solid #f0d0ee",borderRadius:"10px",padding:"0 14px 0 34px",display:"flex",alignItems:"center",fontSize:"14px",color:"#9c5094",background:"#fafafa",fontFamily:F,boxSizing:"border-box" };

export default function EditPosition() {
  const navigate = useNavigate();
  const location = useLocation();
  const pos      = location.state?.position;

  const [positionName, setPositionName] = useState(pos?.position ?? "");
  const [error,        setError]        = useState("");
  const [saved,        setSaved]        = useState(false);

  if (!pos) return (
    <DashboardLayout>
      <div style={{ padding:"60px",textAlign:"center",color:"#701366",fontFamily:F }}>
        No position data found.{" "}
        <button onClick={() => navigate(-1)} style={{ color:"#701366",background:"none",border:"none",cursor:"pointer",textDecoration:"underline" }}>Go back</button>
      </div>
    </DashboardLayout>
  );

  const count  = pos.count  ?? 0;
  const active = pos.active ?? count > 0;

  const handleSave = () => {
    if (!positionName.trim()) { setError("Position name is required."); return; }
    setSaved(true);
    // TODO: PUT { id: pos.id, position: positionName } to backend
    setTimeout(() => navigate("/Employees", { state: { tab: "positions" } }), 900);
  };

  return (
    <DashboardLayout>
      <style>{`.ep-input:focus{border-color:#701366 !important;box-shadow:0 0 0 3px rgba(112,19,102,.10) !important;background:white !important;}`}</style>

      <div style={{ maxWidth:"460px",margin:"40px auto 0",width:"100%",boxSizing:"border-box" }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px" }}>
          <h2 style={{ fontSize:"22px",color:"#701366",margin:0,fontWeight:500,fontFamily:F }}>Edit Position</h2>
          <Buttons cancelPath="/Employees" onSave={handleSave} saveLabel="Save Changes" />
        </div>

        <div style={{ background:"white",borderRadius:"18px",boxShadow:"0 4px 24px rgba(112,19,102,.10)",padding:"36px 32px 32px",display:"flex",flexDirection:"column",gap:"22px" }}>

          {saved && (
            <div style={{ background:"#dcfce7",color:"#16a34a",borderRadius:"8px",padding:"10px 16px",fontSize:"13.5px",fontWeight:400,fontFamily:F }}>
              ✓ Position updated! Redirecting…
            </div>
          )}

          {/* ID */}
          <div>
            <label style={labelStyle}>Position ID</label>
            <div style={{ position:"relative" }}>
              <span style={{ ...iconStyle,fontSize:"14px" }}>#</span>
              <div style={readonlyBox}>{pos.id}</div>
            </div>
          </div>

          {/* Position name */}
          <div>
            <label style={labelStyle}>Position Name</label>
            <div style={{ position:"relative" }}>
              <Briefcase style={{ ...iconStyle,width:"16px",height:"16px" }} />
              <input
                className="ep-input"
                style={{ ...inputBase,borderColor:error?"#dc2626":"#f0d0ee",boxShadow:error?"0 0 0 3px rgba(220,38,38,.08)":"none" }}
                value={positionName}
                onChange={e => { setPositionName(e.target.value); if (error) setError(""); }}
                disabled={saved}
              />
            </div>
            {error && <p style={{ fontSize:"12px",color:"#dc2626",margin:"6px 0 0",fontFamily:F }}>{error}</p>}
          </div>

          {/* Employee count */}
          <div style={{ display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",background:"#f8f0f8",borderRadius:"10px" }}>
            <Users style={{ width:"16px",height:"16px",color:"#701366" }} />
            <span style={{ fontSize:"13px",fontFamily:F,color:"#701366" }}>
              Employees assigned: <strong>{count}</strong>
            </span>
          </div>

          {/* Status — read-only, driven by employee count */}
          <div>
            <label style={labelStyle}>Status <span style={{ fontWeight:400,color:"#9c5094" }}>(auto)</span></label>
            <div style={{ display:"flex",alignItems:"center",gap:"12px" }}>
              <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 16px",borderRadius:"9999px",fontSize:"13px",fontFamily:F,fontWeight:400,background:active?"#dcfce7":"#fee2e2",color:active?"#16a34a":"#dc2626" }}>
                ● {active?"Active":"Inactive"}
              </span>
              <span style={{ fontSize:"12px",color:"#9c5094",fontFamily:F }}>
                {active
                  ? "Active because it has employees assigned."
                  : "Inactive — no employees are assigned to this position."}
              </span>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}