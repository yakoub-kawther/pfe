import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

const inp = (hasError) => ({
  width          : "100%",
  border         : `1px solid ${hasError ? "#ef4444" : "#e2d0e2"}`,
  borderRadius   : "8px",
  padding        : "10px 14px",
  fontSize       : "14px",
  color          : "#701366",
  outline        : "none",
  boxSizing      : "border-box",
  fontFamily     : "Inter, sans-serif",
  backgroundColor: "#fff",
  transition     : "border-color 0.2s",
  cursor         : "pointer",
});

const Field = ({ label, children, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label && <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide font-Inter">{label}</label>}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter font-semibold" style={{ fontSize: "15px", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f8e0f8" }}>
      {title}
    </h3>
    {children}
  </div>
);

const getError = (errors, field) => {
  const val = errors[field];
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  if (typeof val === "string") return val;
  return null;
};

const MONTHS = [
  { label: "January 2026",   value: "2026-01" },
  { label: "February 2026",  value: "2026-02" },
  { label: "March 2026",     value: "2026-03" },
  { label: "April 2026",     value: "2026-04" },
  { label: "May 2026",       value: "2026-05" },
  { label: "June 2026",      value: "2026-06" },
  { label: "July 2026",      value: "2026-07" },
  { label: "August 2026",    value: "2026-08" },
  { label: "September 2026", value: "2026-09" },
  { label: "October 2026",   value: "2026-10" },
  { label: "November 2026",  value: "2026-11" },
  { label: "December 2026",  value: "2026-12" },
];

const emptyForm = { employee_id: "", month: "", amount: "" };

export default function AddEmployeesFees() {
  const navigate = useNavigate();

  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    apiFetch("/persons/employees/")
      .then(r => r.json())
      .then(data => setEmployees(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {});
  }, []);

  const handle = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => { const u = { ...prev }; delete u[field]; return u; });
  };

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = "Please select an employee.";
    if (!form.month)       e.month       = "Please select a month.";
    if (!form.amount)      e.amount      = "Amount is required.";
    else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Please enter a valid amount.";
    return e;
  };

  const handleSave = async () => {
    const frontendErrors = validate();
    if (Object.keys(frontendErrors).length > 0) { setErrors(frontendErrors); return; }

    setLoading(true);
    setErrors({});

    try {
      const res = await apiFetch("/saleries/", {
        method: "POST",
        body: {
          employee    : Number(form.employee_id),
          amount      : form.amount,
          payment_date: `${form.month}-01`,
          status      : "paid",
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        const mapped  = {};
        if (errData.employee)     mapped.employee_id = errData.employee;
        if (errData.amount)       mapped.amount      = errData.amount;
        if (errData.payment_date) mapped.month       = errData.payment_date;
        if (errData.detail)       mapped.submit      = errData.detail;
        if (errData.error)        mapped.submit      = errData.error;
        setErrors(mapped);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/Fees"), 2000);
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    setSuccess(false);
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-2xl text-[#701366] font-Inter font-semibold">Add Employee Salary</h1>
          <div className="flex gap-2">
            {/* Cancel */}
            <button
              onClick={() => navigate("/Fees")}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #701366", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "#f8e0f8"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; }}
            >
              Reset
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: loading ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", fontWeight: "500" }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#701366"; }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "18px" }}>✓</span>
            Salary recorded successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {errors.submit && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            {errors.submit}
          </div>
        )}

        {/* Form — centered narrow card */}
        <div style={{ maxWidth: "560px" }}>
          <Card title="Salary Information">
            <div className="grid grid-cols-1" style={{ gap: "18px" }}>

              <Field label="Employee">
                <select
                  style={inp(!!errors.employee_id)}
                  value={form.employee_id}
                  onChange={handle("employee_id")}
                >
                  <option value="" disabled>Select an employee</option>
                  {employees.map(e => {
                    const p = e.person ?? {};
                    return (
                      <option key={e.person_id} value={e.person_id}>
                        {p.first_name} {p.last_name} — {e.position?.name ?? ""}
                      </option>
                    );
                  })}
                </select>
                {getError(errors, "employee_id") && (
                  <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "employee_id")}</span>
                )}
              </Field>

              <Field label="Month">
                <select
                  style={inp(!!errors.month)}
                  value={form.month}
                  onChange={handle("month")}
                >
                  <option value="" disabled>Select a month</option>
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                {getError(errors, "month") && (
                  <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "month")}</span>
                )}
              </Field>

              <Field label="Amount (DA)">
                <input
                  type="number"
                  min="0"
                  style={{ ...inp(!!errors.amount), cursor: "text" }}
                  value={form.amount}
                  onChange={handle("amount")}
                  placeholder="e.g. 45000"
                />
                {getError(errors, "amount") && (
                  <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "amount")}</span>
                )}
              </Field>

              {/* Status — always paid, just display */}
              <Field label="Status">
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "8px", background: "#dcfce7", color: "#16a34a", fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500, width: "fit-content" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                  Paid
                </div>
              </Field>

            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}