import { useState, useEffect } from "react";
import axios from "axios";
import Buttons from "./Buttons";

const BASE_URL = "http://localhost:8000";

const inp = (hasError) => ({
  width        : "100%",
  border       : `1px solid ${hasError ? "red" : "#701366"}`,
  borderRadius : "8px",
  padding      : "10px 14px",
  fontSize     : "14px",
  color        : "#701366",
  outline      : "none",
  boxSizing    : "border-box",
  fontFamily   : "Inter, sans-serif",
});

const sel = (hasError) => ({
  ...inp(hasError),
  backgroundColor : "#fff",
  cursor          : "pointer",
});

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] text-gray-400">{label}</label>
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-200"
    style={{ padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
  >
    <h3
      className="text-[#701366] font-medium border-b border-[#f0e0ee]"
      style={{ fontSize: "17px", marginBottom: "20px", paddingBottom: "12px" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

// Helper — extract readable error message from API response
const getError = (errors, field) => {
  const val = errors[field];
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  if (typeof val === "string") return val;
  return JSON.stringify(val);
};

const Form = () => {
  const [gender,  setGender]  = useState("");
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    first_name    : "",
    last_name     : "",
    date_of_birth : "",
    class_id      : "",
    special_case  : "",
    father_name   : "",
    father_phone  : "",
    mother_name   : "",
    mother_phone  : "",
    username      : "",
    password      : "",
    phone         : "",
    email         : "",
    address       : "",
  });

  // ── Fetch active classes ──
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/academic/classes/`)
      .then((res) => {
        const active = res.data.filter((c) => c.status === "active");
        setClasses(active);
      })
      .catch((err) => console.error("Failed to fetch classes:", err));
  }, []);

  // ── Handle field change — clears error on fix ──
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field immediately when user types
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const isMinor = () => {
    if (!form.date_of_birth) return false;
    const dob   = new Date(form.date_of_birth);
    const today = new Date();
    let age     = today.getFullYear() - dob.getFullYear();
    const m     = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 18;
  };

  // ── Frontend validation before API calls ──
  const validate = () => {
    const errs = {};

    if (!form.first_name.trim()) errs.first_name = "First name is required.";
    if (!form.last_name.trim())  errs.last_name  = "Last name is required.";
    if (!gender)                 errs.gender     = "Gender is required.";
    if (!form.date_of_birth)     errs.date_of_birth = "Date of birth is required.";
    if (!form.phone.trim())      errs.phone      = "Phone is required.";
    if (!form.password.trim())   errs.password   = "Password is required.";

    // Future date check
    if (form.date_of_birth && new Date(form.date_of_birth) > new Date()) {
      errs.date_of_birth = "Date of birth cannot be in the future.";
    }

    // Minor must have father phone
    if (isMinor() && !form.father_phone.trim()) {
      errs.father_phone = "Father contact is required for minor students.";
    }

    return errs;
  };

  const handleSubmit = async () => {
    setSuccess(false);

    // ── Frontend validation first ──
    const frontendErrors = validate();
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let parent_id = null;

      // ── Step 1: Create father if minor ──
      if (isMinor()) {
        const parentRes = await axios.post(
          `${BASE_URL}/api/persons/parents/`,
          {
            first_name   : form.father_name || "Unknown",
            last_name    : form.last_name,
            gender       : "male",
            phone        : form.father_phone,
            relationship : "father",
            student_ids  : [],
          }
        );
        parent_id = parentRes.data.person.id;
      }

      // ── Step 2: Create student ──
      const studentRes = await axios.post(
        `${BASE_URL}/api/persons/students/`,
        {
          first_name    : form.first_name,
          last_name     : form.last_name,
          gender        : gender.toLowerCase(),
          phone         : form.phone,
          email         : form.email   || null,
          address       : form.address || null,
          date_of_birth : form.date_of_birth,
          special_case  : form.special_case || null,
          parent_id     : parent_id,
        }
      );

      const student_id = studentRes.data.person.id;

      // ── Step 3: Create account ──
      await axios.post(`${BASE_URL}/api/account/create-account/`, {
        student_id : student_id,
        password   : form.password,
        role_name  : "student",
      });

      // ── All done ──
      setSuccess(true);
      setErrors({});
      setForm({
        first_name: "", last_name: "", date_of_birth: "",
        class_id: "", special_case: "", father_name: "",
        father_phone: "", mother_name: "", mother_phone: "",
        username: "", password: "", phone: "", email: "", address: "",
      });
      setGender("");

    } catch (err) {
      if (err.response?.data) {
        // Map API errors to form fields
        const apiErrors = err.response.data;
        setErrors(apiErrors);
        setSuccess(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* ── Buttons ── */}
      <Buttons
        onSave={handleSubmit}
        cancelPath="/Students"
      />

      {/* ── Success banner ── */}
      {success && (
        <div style={{
          background   : "#f0fdf4",
          color        : "#166534",
          padding      : "12px 20px",
          borderRadius : "10px",
          margin       : "16px 16px 0",
          fontSize     : "14px",
          fontWeight   : "500",
        }}>
          ✓ Student created successfully!
        </div>
      )}

      {/* ── Global error banner ── */}
      {errors.error && (
        <div style={{
          background   : "#fef2f2",
          color        : "#991b1b",
          padding      : "12px 20px",
          borderRadius : "10px",
          margin       : "16px 16px 0",
          fontSize     : "14px",
        }}>
          {errors.error}
        </div>
      )}

      {/* ── Form ── */}
      <div
        className="grid grid-cols-2 mx-auto"
        style={{ gap: "28px", padding: "10px 16px", maxWidth: "1700px" }}
      >

        {/* ════ LEFT ════ */}
        <div className="flex flex-col" style={{ gap: "28px" }}>

          {/* BASIC INFO */}
          <Card title="Basic Information">
            <div className="grid grid-cols-2" style={{ gap: "20px" }}>

              <Field label="First Name">
                <input
                  style={inp(!!errors.first_name)}
                  name="first_name"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={handle}
                />
                {getError(errors, "first_name") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "first_name")}
                  </span>
                )}
              </Field>

              <Field label="Last Name">
                <input
                  style={inp(!!errors.last_name)}
                  name="last_name"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={handle}
                />
                {getError(errors, "last_name") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "last_name")}
                  </span>
                )}
              </Field>

              <Field label="Gender">
                <div
                  className="flex items-center text-[#701366]"
                  style={{ gap: "24px", padding: "8px 0", fontSize: "14px" }}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "Male"}
                      onChange={() => {
                        setGender("Male");
                        setErrors((prev) => { const e = {...prev}; delete e.gender; return e; });
                      }}
                      style={{ accentColor: "#701366" }}
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "Female"}
                      onChange={() => {
                        setGender("Female");
                        setErrors((prev) => { const e = {...prev}; delete e.gender; return e; });
                      }}
                      style={{ accentColor: "#701366" }}
                    />
                    Female
                  </label>
                </div>
                {getError(errors, "gender") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "gender")}
                  </span>
                )}
              </Field>

              <Field label="Date of Birth">
                <input
                  type="date"
                  style={inp(!!errors.date_of_birth)}
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handle}
                />
                {getError(errors, "date_of_birth") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "date_of_birth")}
                  </span>
                )}
              </Field>

              <Field label="Class">
                <select
                  style={sel(!!errors.class_id)}
                  name="class_id"
                  value={form.class_id}
                  onChange={handle}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Special Case">
                <select
                  style={sel(false)}
                  name="special_case"
                  value={form.special_case}
                  onChange={handle}
                >
                  <option value="">None</option>
                  <option value="Orphan">Orphan</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* PARENT */}
          <Card title="Parent Details">
            <div className="grid grid-cols-2" style={{ gap: "20px" }}>

              <Field label="Father Name">
                <input
                  style={inp(false)}
                  name="father_name"
                  placeholder="Father Name"
                  value={form.father_name}
                  onChange={handle}
                />
              </Field>

              <Field label="Mother Name">
                <input
                  style={inp(false)}
                  name="mother_name"
                  placeholder="Mother Name"
                  value={form.mother_name}
                  onChange={handle}
                />
              </Field>

              <Field label="Father Contact">
                <input
                  style={inp(!!errors.father_phone)}
                  name="father_phone"
                  placeholder="Father Contact"
                  value={form.father_phone}
                  onChange={handle}
                />
                {getError(errors, "father_phone") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "father_phone")}
                  </span>
                )}
              </Field>

              <Field label="Mother Contact">
                <input
                  style={inp(false)}
                  name="mother_phone"
                  placeholder="Mother Contact"
                  value={form.mother_phone}
                  onChange={handle}
                />
              </Field>

            </div>
          </Card>

        </div>

        {/* ════ RIGHT ════ */}
        <div className="flex flex-col" style={{ gap: "28px" }}>

          {/* ACCOUNT */}
          <Card title="Account Information">
            <div className="grid grid-cols-2" style={{ gap: "20px" }}>

              <Field label="User Name">
                <input
                  style={inp(false)}
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handle}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  style={inp(!!errors.password)}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handle}
                />
                {getError(errors, "password") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "password")}
                  </span>
                )}
              </Field>

            </div>
          </Card>

          {/* CONTACT */}
          <Card title="Contact Details">
            <div className="grid grid-cols-2" style={{ gap: "20px" }}>

              <Field label="Phone">
                <input
                  style={inp(!!errors.phone)}
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handle}
                />
                {getError(errors, "phone") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "phone")}
                  </span>
                )}
              </Field>

              <Field label="Email">
                <input
                  style={inp(!!errors.email)}
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handle}
                />
                {getError(errors, "email") && (
                  <span style={{ color: "red", fontSize: "11px" }}>
                    {getError(errors, "email")}
                  </span>
                )}
              </Field>

              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Address">
                  <input
                    style={inp(false)}
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handle}
                  />
                </Field>
              </div>

            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Form;