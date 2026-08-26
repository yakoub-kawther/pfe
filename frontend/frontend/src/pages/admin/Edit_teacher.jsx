import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label ? <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label> : null}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

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

  // Teacher, Employee, and Person share the same primary key value
  // (stacked OneToOneField(primary_key=True) chain), so person_id is
  // exactly what the backend's Teacher.objects.filter(pk=pk) expects.
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
          // Only send account fields if the admin actually typed something,
          // so leaving them blank never overwrites the existing username/password.
          ...(form.username && { username: form.username }),
          ...(form.password && { password: form.password }),
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
        if (errData.username)         mapped.username    = errData.username;
        if (errData.password)         mapped.password    = errData.password;
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
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
            <button
              onClick={() => navigate("/Teachers")}
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
              Edit Teacher
            </h1>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
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
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: loading ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600" }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#701366"; }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "14px 20px", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "18px" }}>✓</span>
            Teacher updated successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {errors.error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", fontSize: "14px" }}>
            {errors.error}
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Personal Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

                <Field label="First Name">
                  <input style={inp(!!errors.first_name)} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
                  {getError(errors, "first_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "first_name")}</span>}
                </Field>

                <Field label="Last Name">
                  <input style={inp(!!errors.last_name)} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
                  {getError(errors, "last_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "last_name")}</span>}
                </Field>

                <Field label="Gender">
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "14px", color: "#701366", padding: "6px 0" }}>
                    {["Male", "Female"].map((g) => (
                      <label key={g} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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

                <Field label="Head Teacher">
                  <div style={{ display: "flex", alignItems: "center", height: "40px" }}>
                    <input
                      type="checkbox"
                      checked={headTeacher}
                      onChange={(e) => setHeadTeacher(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#701366", cursor: "pointer" }}
                    />
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Language">
                  <select style={sel(!!errors.language_id)} value={form.language} onChange={handle("language")}>
                    <option value="" disabled>Select a language</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.language_name}</option>
                    ))}
                  </select>
                  {getError(errors, "language_id") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "language_id")}</span>}
                </Field>

                <Field label="Qualifications" full>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

            <Card title="Contact Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
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

            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Username">
                  <input style={inp(!!errors.username)} value={form.username} onChange={handle("username")} placeholder="New Username" />
                  {getError(errors, "username") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "username")}</span>}
                </Field>
                <Field label="Password">
                  <input type="password" style={inp(!!errors.password)} value={form.password} onChange={handle("password")} placeholder="New Password" />
                  {getError(errors, "password") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "password")}</span>}
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