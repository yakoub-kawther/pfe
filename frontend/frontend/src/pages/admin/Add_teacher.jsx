// When Django is ready, replace handleSave with:
//   await fetch("http://localhost:8000/api/teachers/", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   navigate("/Teachers");

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

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

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 text-sm rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white h-7 w-12 hover:bg-[#701366] hover:text-white`;
const btnGhost   = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:text-[#701366] hover:bg-white`;

const emptyForm = {
  firstName: "", lastName: "", dob: "", language: "",
  username: "", password: "", phone: "", email: "", address: "", status: "Active",
};

const Add_teacher = () => {
  const navigate = useNavigate();
  const [gender,      setGender]      = useState("Male");
  const [headTeacher, setHeadTeacher] = useState(true);
  const [form,        setForm]        = useState(emptyForm);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => {
    setForm(emptyForm);
    setGender("Male");
    setHeadTeacher(true);
  };

  const handleSave = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName) { alert("Please enter at least a first name."); return; }
    console.log("New teacher:", { ...form, gender, head_teacher: headTeacher });
    navigate("/Teachers");
  };

  return (
    <DashboardLayout>
      {/* w-full + clamp padding replaces max-w-5xl mx-auto */}
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-12 flex-wrap gap-3">
          <h1 className="text-2xl text-[#701366] font-Inter">Add New Teacher</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate("/Teachers")} className={btnOutline}>Cancel</button>
            <button onClick={handleReset}                 className={btnGhost}>Reset</button>
            <button onClick={handleSave}                  className={btnFilled}>Save</button>
          </div>
        </div>

        {/* Two-column grid → single column on narrow */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "24px",
            alignItems: "start",
            marginTop: "30px",
          }}
        >
          {/* LEFT */}
          <Card title="Basic Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="First Name">
                <input style={inp} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
              </Field>

              <Field label="Last Name">
                <input style={inp} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
              </Field>

              <Field label="Gender">
                <div className="flex items-center gap-5 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" checked={gender === "Male"} onChange={() => setGender("Male")} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                    Male
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" checked={gender === "Female"} onChange={() => setGender("Female")} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                    Female
                  </label>
                </div>
              </Field>

              <Field label="Date of Birth">
                <input type="date" style={inp} value={form.dob} onChange={handle("dob")} />
              </Field>

              <Field label="Language">
                <select style={sel} value={form.language} onChange={handle("language")}>
                  <option value="">Ex. english</option>
                  <option>English</option>
                  <option>French</option>
                  <option>Arabic</option>
                </select>
              </Field>

              <Field label="Head Teacher ?">
                <div className="flex items-center gap-2 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                  <input
                    type="checkbox" id="headTeacher" checked={headTeacher}
                    onChange={(e) => setHeadTeacher(e.target.checked)}
                    style={{ accentColor: "#701366", width: "15px", height: "15px" }}
                  />
                  <label htmlFor="headTeacher" className="cursor-pointer font-Inter">YES</label>
                </div>
              </Field>

              <Field label="Status">
                <select style={sel} value={form.status} onChange={handle("status")}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* RIGHT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <Card title="Login/Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field>
                  <input style={inp} value={form.username} onChange={handle("username")} placeholder="User Name" />
                </Field>
                <Field>
                  <input type="password" style={inp} value={form.password} onChange={handle("password")} placeholder="Password" />
                </Field>
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field label="Phone">
                  <input style={inp} value={form.phone} onChange={handle("phone")} placeholder="Contact number" />
                </Field>
                <Field label="Email">
                  <input style={inp} value={form.email} onChange={handle("email")} placeholder="example@gmail.com" />
                </Field>
                <Field label="Address" full>
                  <input style={inp} value={form.address} onChange={handle("address")} placeholder="camp-chevalier , jijel 18000" />
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