import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const BASE_URL = "http://localhost:8000";

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
    {label && (
      <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide font-Inter">
        {label}
      </label>
    )}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3
      className="text-[#701366] font-Inter font-semibold"
      style={{ fontSize: "15px", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f8e0f8" }}
    >
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

  // Pull data from nested API shape: teacher.employee.person
  const person   = teacher?.employee?.person   ?? {};
  const employee = teacher?.employee           ?? {};

  const [gender,      setGender]      = useState(person.gender || "male");
  const [headTeacher, setHeadTeacher] = useState(teacher?.is_head_teacher ?? false);
  const [languages,   setLanguages]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const [form, setForm] = useState({
    firstName     : person.first_name   || "",
    lastName      : person.last_name    || "",
    dob           : "",
    phone         : person.phone        || "",
    email         : person.email        || "",
    address       : person.address      || "",
    hireDate      : employee.hire_date  || "",
    status        : employee.status
                      ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1)
                      : "Active",
    language      : teacher?.language   ?? "",
    qualifications: teacher?.qualifications || "",
    username      : "",
    password      : "",
  });

  useEffect(() => {
    axios.get(`${BASE_URL}/api/academic/languages/`)
      .then(res => setLanguages(res.data))
      .catch(() => {});
  }, []);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const u = { ...prev }; delete u[field]; return u; });
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrors({ first_name: "First name is required.", last_name: "Last name is required." });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    const person_id = employee.person_id;

    try {
      await axios.patch(`${BASE_URL}/api/persons/teachers/${person_id}/`, {
        first_name      : form.firstName,
        last_name       : form.lastName,
        gender          : gender.toLowerCase(),
        phone           : form.phone     || null,
        email           : form.email     || null,
        address         : form.address   || null,
        hire_date       : form.hireDate  || null,
        language_id     : form.language  ? parseInt(form.language) : null,
        is_head_teacher : headTeacher,
        qualifications  : form.qualifications || null,
        status          : form.status.toLowerCase(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/Teachers"), 2000);

    } catch (err) {
      if (err.response?.data) {
        const e = err.response.data;
        const mapped = {};
        if (e.first_name)  mapped.first_name = e.first_name;
        if (e.last_name)   mapped.last_name  = e.last_name;
        if (e.phone)       mapped.phone      = e.phone;
        if (e.email)       mapped.email      = e.email;
        if (e.hire_date)   mapped.hire_date  = e.hire_date;
        if (e.detail)      mapped.error      = e.detail;
        if (e.error)       mapped.error      = e.error;
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-[#701366] opacity-50">
          No teacher data found. Please go back and select a teacher.
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-[#701366] font-Inter font-semibold">Edit Teacher</h1>
            <p className="text-sm text-gray-400 mt-1 font-Inter">{fullName}</p>
          </div>
          <div className="flex gap-2">
            {/* Cancel */}
            <button
              onClick={() => navigate("/Teachers")}
              style={{
                padding: "8px 20px", borderRadius: "8px",
                border: "1.5px solid #e2d0e2", background: "#fff",
                color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: "8px 24px", borderRadius: "8px",
                border: "1.5px solid #701366",
                background: loading ? "#a855a0" : "#701366",
                color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s", fontWeight: "500",
              }}
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
                    {["male", "female"].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="gender"
                          checked={gender === g}
                          onChange={() => setGender(g)}
                          style={{ accentColor: "#701366", width: "15px", height: "15px" }}
                        />
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Date of Birth">
                  <input type="date" style={inp(false)} value={form.dob} onChange={handle("dob")} />
                </Field>

                <Field label="Hire Date">
                  <input type="date" style={inp(!!errors.hire_date)} value={form.hireDate} onChange={handle("hireDate")} />
                  {getError(errors, "hire_date") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "hire_date")}</span>}
                </Field>

                <Field label="Head Teacher ?">
                  <div className="flex items-center gap-2 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                    <input
                      type="checkbox" id="headTeacher"
                      checked={headTeacher}
                      onChange={(e) => setHeadTeacher(e.target.checked)}
                      style={{ accentColor: "#701366", width: "15px", height: "15px" }}
                    />
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

            {/* Teaching Info */}
            <Card title="Teaching Information">
              <div className="flex flex-col" style={{ gap: "18px" }}>

                <Field label="Language">
                  <select style={sel(false)} value={form.language} onChange={handle("language")}>
                    <option value="" disabled>Select a language</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.language_name}</option>
                    ))}
                  </select>
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
                  <input style={inp(false)} value={form.username} onChange={handle("username")} placeholder="New username" />
                </Field>
                <Field label="Password">
                  <input type="password" style={inp(false)} value={form.password} onChange={handle("password")} placeholder="New password" />
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