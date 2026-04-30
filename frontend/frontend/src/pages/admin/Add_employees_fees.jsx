import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ArrowLeft, Save, Users } from "lucide-react";

const F = "'Inter', sans-serif";

function Field({ label, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontFamily: F, fontSize: "14px", fontWeight: 500, color: "#701366" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  fontFamily: F, fontSize: "14px", width: "100%",
  padding: "12px 16px", borderRadius: "12px",
  border: "1.5px solid #e8c0e4", outline: "none",
  color: "#3d0a38", background: "#fff",
  transition: "border .2s, box-shadow .2s",
  boxSizing: "border-box",
};

function TextInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value} onChange={onChange} placeholder={placeholder}
      style={{ ...inputStyle, borderColor: focused ? "#701366" : "#e8c0e4", boxShadow: focused ? "0 0 0 3px rgba(112,19,102,.1)" : "none" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SelectInput({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value} onChange={onChange}
      style={{ ...inputStyle, borderColor: focused ? "#701366" : "#e8c0e4", boxShadow: focused ? "0 0 0 3px rgba(112,19,102,.1)" : "none", appearance: "none", cursor: "pointer" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

export default function AddEmployeesFees() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:   "",
    role:   "",
    month:  "",
    salary: "",
    status: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name   = "Name is required.";
    if (!form.role)        e.role   = "Please select a role.";
    if (!form.month)       e.month  = "Please select a month.";
    if (!form.salary.trim()) e.salary = "Salary is required.";
    if (!form.status)      e.status = "Please select a status.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitted(true);
    setTimeout(() => navigate("/Fees"), 1400);
  };

  const months = ["January 2026","February 2026","March 2026","April 2026","May 2026","June 2026","July 2026","August 2026","September 2026","October 2026","November 2026","December 2026"];
  const roles  = ["Teacher", "Secretariat", "Housemaid", "Agent"];

  return (
    <DashboardLayout>
      <div style={{ width: "100%", maxWidth: "680px", margin: "30px auto 0", boxSizing: "border-box", paddingBottom: "40px" }}>


        <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(112,19,102,.08)", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)", padding: "28px 32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontFamily: F, fontSize: "20px", fontWeight: 600, color: "white", margin: 0 }}>Add Employee Fees</h2>
              <p style={{ fontFamily: F, fontSize: "13px", color: "rgba(255,255,255,.65)", margin: "3px 0 0" }}>Record salary payment for a staff member</p>
            </div>
          </div>

          {/* Success Banner */}
          {submitted && (
            <div style={{ background: "#dcfce7", color: "#16a34a", fontFamily: F, fontSize: "14px", fontWeight: 500, padding: "14px 32px", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "8px" }}>
              ✓ Payment recorded successfully! Redirecting…
            </div>
          )}

          {/* Form */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Row 1: Name + Role */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Field label="Name" required>
                <TextInput value={form.name} onChange={set("name")} placeholder="Full name" />
                {errors.name && <p style={{ color: "#dc2626", fontSize: "12px", margin: "2px 0 0", fontFamily: F }}>{errors.name}</p>}
              </Field>
              <Field label="Role" required>
                <SelectInput value={form.role} onChange={set("role")}>
                  <option value="">Select role…</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </SelectInput>
                {errors.role && <p style={{ color: "#dc2626", fontSize: "12px", margin: "2px 0 0", fontFamily: F }}>{errors.role}</p>}
              </Field>
            </div>

            {/* Row 2: Month + Salary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Field label="Month" required>
                <SelectInput value={form.month} onChange={set("month")}>
                  <option value="">Select month…</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </SelectInput>
                {errors.month && <p style={{ color: "#dc2626", fontSize: "12px", margin: "2px 0 0", fontFamily: F }}>{errors.month}</p>}
              </Field>
              <Field label="Salary (DA)" required>
                <TextInput value={form.salary} onChange={set("salary")} placeholder="e.g. 45,000" />
                {errors.salary && <p style={{ color: "#dc2626", fontSize: "12px", margin: "2px 0 0", fontFamily: F }}>{errors.salary}</p>}
              </Field>
            </div>

            {/* Status */}
            <Field label="Payment Status" required>
              <div style={{ display: "flex", gap: "10px" }}>
                {["Paid", "Unpaid"].map((s) => {
                  const active = form.status === s;
                  const colors = { Paid: ["#dcfce7","#16a34a"], Unpaid: ["#fee2e2","#dc2626"] };
                  return (
                    <button
                      key={s} type="button"
                      onClick={() => setForm((p) => ({ ...p, status: s }))}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "10px",
                        border: `1.5px solid ${active ? colors[s][1] : "#e8c0e4"}`,
                        background: active ? colors[s][0] : "white",
                        color: active ? colors[s][1] : "#9c5094",
                        fontFamily: F, fontSize: "13px", fontWeight: active ? 600 : 400,
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      ● {s}
                    </button>
                  );
                })}
              </div>
              {errors.status && <p style={{ color: "#dc2626", fontSize: "12px", margin: "2px 0 0", fontFamily: F }}>{errors.status}</p>}
            </Field>

            <div style={{ height: "1px", background: "#f8e0f8" }} />

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => navigate("/Fees")}
                style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e8c0e4", background: "white", color: "#9c5094", fontFamily: F, fontSize: "14px", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#701366"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e8c0e4"}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitted}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "12px 28px", borderRadius: "12px", border: "none",
                  background: submitted ? "#dcfce7" : "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)",
                  color: submitted ? "#16a34a" : "white",
                  fontFamily: F, fontSize: "14px", fontWeight: 500,
                  cursor: submitted ? "default" : "pointer",
                  boxShadow: submitted ? "none" : "0 4px 14px rgba(112,19,102,.28)",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { if (!submitted) e.currentTarget.style.background = "linear-gradient(135deg,#701366 0%,#4a0d45 100%)"; }}
                onMouseLeave={e => { if (!submitted) e.currentTarget.style.background = "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)"; }}
              >
                <Save size={15} /> {submitted ? "Saved!" : "Save Payment"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}