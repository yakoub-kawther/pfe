import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const BASE_URL = "http://localhost:8000";

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

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX  = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

const emptyForm = {
  firstName: "", lastName: "", dob: "", language: "",
  username: "", password: "", phone: "", email: "", address: "",
  status: "Active", qualifications: "", hireDate: today,
};

const Add_teacher = () => {
  const navigate = useNavigate();

  const [gender,      setGender]      = useState("Male");
  const [headTeacher, setHeadTeacher] = useState(true);
  const [form,        setForm]        = useState(emptyForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [languages,   setLanguages]   = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [success,     setSuccess]     = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/academic/languages/`)
      .then(res => setLanguages(res.data))
      .catch(err => console.error("Failed to fetch languages:", err));
    axios.get(`${BASE_URL}/api/academic/positions/`)
      .then(res => setPositions(res.data))
      .catch(() => {});
  }, []);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const u = { ...prev }; delete u[field]; return u; });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setGender("Male");
    setHeadTeacher(true);
    setErrors({});
    setSuccess(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())                              errs.first_name  = "First name is required.";
    else if (!NAME_REGEX.test(form.firstName.trim()))        errs.first_name  = "First name must be 2–50 letters only.";
    if (!form.lastName.trim())                               errs.last_name   = "Last name is required.";
    else if (!NAME_REGEX.test(form.lastName.trim()))         errs.last_name   = "Last name must be 2–50 letters only.";
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) errs.phone = "Phone must be exactly 10 digits.";
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) errs.email = "Enter a valid email address.";
    if (!form.username.trim())                               errs.username    = "Username is required.";
    if (!form.password.trim())                               errs.password    = "Password is required.";
    else if (form.password.length < 6)                       errs.password    = "Password must be at least 6 characters.";
    if (!form.language)                                      errs.language_id = "Language is required.";
    if (!form.hireDate)                                      errs.hire_date   = "Hire date is required.";
    return errs;
  };

  const handleSave = async () => {
    const frontendErrors = validate();
    if (Object.keys(frontendErrors).length > 0) { setErrors(frontendErrors); return; }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const teacherPosition = positions.find((p) => p.name.toLowerCase() === "teacher");
      const position_id = teacherPosition?.id ?? 1;

      const teacherRes = await axios.post(`${BASE_URL}/api/persons/teachers/`, {
        first_name      : form.firstName,
        last_name       : form.lastName,
        gender          : gender.toLowerCase(),
        phone           : form.phone    || null,
        email           : form.email    || null,
        address         : form.address  || null,
        hire_date       : form.hireDate,
        position_id     : position_id,
        language_id     : form.language ? parseInt(form.language) : null,
        is_head_teacher : headTeacher,
        qualifications  : form.qualifications || null,
        status          : form.status.toLowerCase(),
      });

      const employee_id = teacherRes.data.employee?.person_id;
      if (!employee_id) {
        setErrors({ error: "Could not retrieve employee ID. Check API response." });
        setLoading(false);
        return;
      }

      await axios.post(`${BASE_URL}/api/account/create-account/`, {
        person_type : "employee",
        person_id   : employee_id,
        role        : "teacher",
        username    : form.username,
        password    : form.password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/Teachers"), 2000);

    } catch (err) {
      if (err.response?.data) {
        const e = err.response.data;
        const mapped = {};
        if (e.first_name)  mapped.first_name  = e.first_name;
        if (e.last_name)   mapped.last_name   = e.last_name;
        if (e.phone)       mapped.phone       = e.phone;
        if (e.email)       mapped.email       = e.email;
        if (e.password)    mapped.password    = e.password;
        if (e.language_id) mapped.language_id = e.language_id;
        if (e.hire_date)   mapped.hire_date   = e.hire_date;
        if (e.detail)      mapped.error       = e.detail;
        if (e.error)       mapped.error       = e.error;
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter font-semibold">Add New Teacher</h1>

          <div className="flex gap-2">
            {/* Cancel */}
            <button
              onClick={() => navigate("/Teachers")}
              style={{
                padding      : "8px 20px",
                borderRadius : "8px",
                border       : "1.5px solid #e2d0e2",
                background   : "#fff",
                color        : "#701366",
                fontSize     : "13px",
                fontFamily   : "Inter, sans-serif",
                cursor       : "pointer",
                transition   : "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                padding      : "8px 20px",
                borderRadius : "8px",
                border       : "1.5px solid #701366",
                background   : "#fff",
                color        : "#701366",
                fontSize     : "13px",
                fontFamily   : "Inter, sans-serif",
                cursor       : "pointer",
                transition   : "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background = "#f8e0f8"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; }}
            >
              Reset
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding      : "8px 24px",
                borderRadius : "8px",
                border       : "1.5px solid #701366",
                background   : loading ? "#a855a0" : "#701366",
                color        : "#fff",
                fontSize     : "13px",
                fontFamily   : "Inter, sans-serif",
                cursor       : loading ? "not-allowed" : "pointer",
                transition   : "all 0.2s",
                fontWeight   : "500",
              }}
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
            Teacher added successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {errors.error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            {errors.error}
          </div>
        )}

        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start", marginTop: "20px" }}>

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

                <Field label="Date of Birth">
                  <input type="date" style={inp(false)} value={form.dob} onChange={handle("dob")} />
                </Field>

                {/* Hire Date — replaces language slot, defaults to today */}
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

                <Field label="Status" full>
                  <select style={sel(false)} value={form.status} onChange={handle("status")}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>

              </div>
            </Card>

            {/* Teaching Info card */}
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
          <div className="flex flex-col" style={{ gap: "24px" }}>

            <Card title="Login / Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Username">
                  <input style={inp(!!errors.username)} value={form.username} onChange={handle("username")} placeholder="Username" />
                  {getError(errors, "username") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "username")}</span>}
                </Field>
                <Field label="Password">
                  <input type="password" style={inp(!!errors.password)} value={form.password} onChange={handle("password")} placeholder="Password" />
                  {getError(errors, "password") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "password")}</span>}
                </Field>
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Phone">
                  <input style={inp(!!errors.phone)} value={form.phone} onChange={handle("phone")} placeholder="0XXXXXXXXX (10 digits)" maxLength={10} />
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

export default Add_teacher;