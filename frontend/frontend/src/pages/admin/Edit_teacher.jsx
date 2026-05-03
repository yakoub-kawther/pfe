import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
});

const sel = (hasError) => ({ ...inp(hasError), cursor: "pointer" });

const Field = ({ label, children, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 min-w-0"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px", marginBottom: "20px" }}>
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

const Edit_teacher = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const teacher   = state?.teacher;

  // Extract nested data from teacher object
  const person   = teacher?.employee?.person   ?? {};
  const employee = teacher?.employee           ?? {};
  const person_id = employee.person_id;

  const [gender,       setGender]       = useState(
    person.gender
      ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1)
      : "Male"
  );
  const [headTeacher,  setHeadTeacher]  = useState(teacher?.is_head_teacher ?? false);
  const [languages,    setLanguages]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState({});
  const [success,      setSuccess]      = useState(false);

  const [form, setForm] = useState({
    firstName     : person.first_name   || "",
    lastName      : person.last_name    || "",
    phone         : person.phone        || "",
    email         : person.email        || "",
    address       : person.address      || "",
    hireDate      : employee.hire_date  || "",
    status        : employee.status
      ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1)
      : "Active",
    language      : teacher?.language?.id  || "",
    qualifications: teacher?.qualifications || "",
    username      : "",
    password      : "",
  });

  // Fetch languages on mount
  useEffect(() => {
    const token = localStorage.getItem("access");
    fetch("http://localhost:8000/api/academic/languages/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setLanguages(data))
      .catch(err => console.error("Failed to fetch languages:", err));
  }, []);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const u = { ...prev }; delete u[field]; return u; });
  };

  const handleSave = async () => {
    if (!person_id) {
      setErrors({ error: "Missing teacher ID. Cannot update." });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await apiFetch(`/persons/teachers/${person_id}/`, {
        method: "PATCH",
        body: {
          first_name      : form.firstName,
          last_name       : form.lastName,
          gender          : gender.toLowerCase(),
          phone           : form.phone          || null,
          email           : form.email          || null,
          address         : form.address        || null,
          hire_date       : form.hireDate       || null,
          language_id     : form.language ? parseInt(form.language) : null,
          is_head_teacher : headTeacher,
          qualifications  : form.qualifications || null,
          status          : form.status.toLowerCase(),
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        const mapped = {};
        if (errData.first_name)       mapped.first_name  = errData.first_name;
        if (errData.last_name)        mapped.last_name   = errData.last_name;
        if (errData.phone)            mapped.phone       = errData.phone;
        if (errData.email)            mapped.email       = errData.email;
        if (errData.hire_date)        mapped.hire_date   = errData.hire_date;
        if (errData.language_id)      mapped.language_id = errData.language_id;
        if (errData.detail)           mapped.error       = errData.detail;
        if (errData.error)            mapped.error       = errData.error;
        if (errData.non_field_errors) mapped.error       = errData.non_field_errors[0];
        setErrors(mapped);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/Teachers"), 2000);

    } catch {
      setErrors({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-2xl text-[#701366] font-Inter">
            Edit Teacher — <span>{person.first_name} {person.last_name}</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/Teachers")}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: loading ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", fontWeight: "500" }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#701366"; }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "18px" }}>✓</span>
            Teacher updated successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {errors.error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            {errors.error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", alignItems: "start", marginTop: "30px" }}>

          {/* LEFT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <Card title="Basic Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>

                <Field label="First Name">
                  <input style={inp(!!errors.first_name)} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
                  {getError(errors, "first_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "first_name")}</span>}
                </Field>

                <Field label="Last Name">
                  <input style={inp(!!errors.last_name)} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
                  {getError(errors, "last_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "last_name")}</span>}
                </Field>

                <Field label="Gender">
                  <div className="flex items-center gap-5 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                    {["Male", "Female"].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                        {g}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Hire Date">
                  <input type="date" style={inp(!!errors.hire_date)} value={form.hireDate} onChange={handle("hireDate")} max={today} />
                  {getError(errors, "hire_date") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "hire_date")}</span>}
                </Field>

                <Field label="Head Teacher ?">
                  <div className="flex items-center gap-2 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                    <input type="checkbox" id="headTeacher" checked={headTeacher} onChange={(e) => setHeadTeacher(e.target.checked)} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                    <label htmlFor="headTeacher" className="cursor-pointer font-Inter">YES</label>
                  </div>
                </Field>

                <Field label="Status">
                  <select style={sel(false)} value={form.status} onChange={handle("status")}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>

              </div>
            </Card>

            <Card title="Teaching Information">
              <div className="flex flex-col" style={{ gap: "18px" }}>
                <Field label="Language">
                  <select style={sel(!!errors.language_id)} value={form.language} onChange={handle("language")}>
                    <option value="" disabled>Select a language</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.language_name}</option>
                    ))}
                  </select>
                  {getError(errors, "language_id") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "language_id")}</span>}
                </Field>

                <Field label="Qualifications">
                  <textarea
                    style={{ ...inp(false), minHeight: "110px", resize: "vertical", lineHeight: "1.6" }}
                    value={form.qualifications}
                    onChange={handle("qualifications")}
                    placeholder="e.g. Master's degree in English, TEFL certified..."
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col min-w-0" style={{ gap: "24px" }}>

            <Card title="Login / Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Username">
                  <input style={inp(false)} value={form.username} onChange={handle("username")} placeholder="New Username" />
                </Field>
                <Field label="Password">
                  <input type="password" style={inp(false)} value={form.password} onChange={handle("password")} placeholder="New Password" />
                </Field>
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Phone">
                  <input style={inp(!!errors.phone)} value={form.phone} onChange={handle("phone")} placeholder="0XXXXXXXXX" maxLength={10} />
                  {getError(errors, "phone") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "phone")}</span>}
                </Field>
                <Field label="Email">
                  <input style={inp(!!errors.email)} value={form.email} onChange={handle("email")} placeholder="example@gmail.com" />
                  {getError(errors, "email") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "email")}</span>}
                </Field>
                <Field label="Address" full>
                  <input style={inp(false)} value={form.address} onChange={handle("address")} placeholder="Street, City, ZIP" />
                </Field>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Edit_teacher;