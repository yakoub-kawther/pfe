import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Form from "../../components/Form";

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function AddStudent() {
  const navigate = useNavigate();

  const handleSave  = () => document.getElementById("form-submit-trigger")?.click();
  const handleReset = () => document.getElementById("form-reset-trigger")?.click();

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
            <button
              onClick={() => navigate("/Students")}
              style={backBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Add New Student
            </h1>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleReset}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Reset
            </button>
            <button
              onClick={() => navigate("/Students")}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer", fontWeight: "600" }}
              onMouseEnter={e => { e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { e.target.style.background = "#701366"; }}
            >
              Save
            </button>
          </div>
        </div>

        <Form onSuccess={() => navigate("/Students")} />

      </div>
    </DashboardLayout>
  );
}