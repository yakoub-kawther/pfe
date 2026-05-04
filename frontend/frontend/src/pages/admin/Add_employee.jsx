import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
import { apiFetch } from "../../services/api";

const inp = {
  width: "100%",
  border: "1px solid #e2d0e2",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};

const sel = { ...inp, cursor: "pointer" };

const Field = ({ label, children, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);

// ✅ added username and password
const emptyForm = {
  firstName: "", lastName: "", hire_date: "", position_id: "",
  status: "active", phone: "", email: "", address: "",
  username: "", password: "",
};

export default function Add_employee() {
  const navigate = useNavigate();
  const [gender,    setGender]    = useState("male");
  const [form,      setForm]      = useState(emptyForm);
  const [positions, setPositions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  useEffect(() => {
    apiFetch("/academic/positions/")
      .then(res => res.json())
      .then(data => setPositions(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {});
  }, []);

  const handle      = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleReset = () => { setForm(emptyForm); setGender("male"); setErrors({}); };

  const handleSave = async () => {
    setErrors({});
    setLoading(true);

    const payload = {
      first_name:  form.firstName,
      last_name:   form.lastName,
      gender:      gender,
      phone:       form.phone,
      email:       form.email    || null,
      address:     form.address  || null,
      hire_date:   form.hire_date,
      position_id: Number(form.position_id),
      status:      form.status,
      username:    form.username, 
      password:    form.password, 
    };

    try {
      const res = await apiFetch("/persons/employees/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const data = await res.json();
      console.log("Error response:", data);

      if (!res.ok) {
        setErrors(data);
        return;
      }

      navigate("/Employees");
    } catch (err) {
      setErrors({ non_field_errors: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ field }) =>
    errors[field] ? (
      <span style={{ color: "#dc2626", fontSize: "12px" }}>
        {Array.isArray(errors[field]) ? errors[field][0] : errors[field]}
      </span>
    ) : null;

  return (
    <DashboardLayout>
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "30px" }}>
          <h2 className="text-2xl text-[#701366] font-Inter">Add New Employee</h2>
          <Buttons
            cancelPath="/Employees"
            onReset={handleReset}
            onSave={handleSave}
            saveLabel={loading ? "Saving..." : "Save"}
          />
        </div>

        {errors.non_field_errors && (
          <div style={{ color: "#dc2626", marginBottom: "16px", fontSize: "14px" }}>
            {errors.non_field_errors}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "24px", alignItems: "start" }}>

          {/* LEFT — Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="First Name">
                <input style={inp} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
                <Err field="first_name" />
              </Field>

              <Field label="Last Name">
                <input style={inp} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
                <Err field="last_name" />
              </Field>

              <Field label="Gender">
                <div className="flex items-center gap-5 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" checked={gender === "male"} onChange={() => setGender("male")} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                    Male
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" checked={gender === "female"} onChange={() => setGender("female")} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                    Female
                  </label>
                </div>
                <Err field="gender" />
              </Field>

              <Field label="Position">
                <select style={sel} value={form.position_id} onChange={handle("position_id")}>
                  <option value="">Select a position</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
                <Err field="position_id" />
              </Field>

              <Field label="Hire Date">
                <input type="date" style={inp} value={form.hire_date} onChange={handle("hire_date")} />
                <Err field="hire_date" />
              </Field>

              <Field label="Status">
                <select style={sel} value={form.status} onChange={handle("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* RIGHT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>

            <Card title="Login / Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                {/* ✅ inp is an object, not a function */}
                <Field label="Username">
                  <input style={inp} value={form.username} onChange={handle("username")} placeholder="User Name" />
                  <Err field="username" />
                </Field>
                <Field label="Password">
                  <input type="password" style={inp} value={form.password} onChange={handle("password")} placeholder="Password" />
                  <Err field="password" />
                </Field>
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Phone">
                  <input style={inp} value={form.phone} onChange={handle("phone")} placeholder="0XXXXXXXXXX (10 Digits)" maxLength={10} />
                  <Err field="phone" />
                </Field>
                <Field label="Email">
                  <input style={inp} value={form.email} onChange={handle("email")} placeholder="example@gmail.com" />
                  <Err field="email" />
                </Field>
                <Field label="Address" full>
                  <input style={inp} value={form.address} onChange={handle("address")} placeholder="City" />
                </Field>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}