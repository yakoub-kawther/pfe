import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

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
    className="bg-white rounded-2xl border border-gray-100 min-w-0"
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
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

const Edit_teacher = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const teacher   = state?.teacher;
  const nameParts = teacher?.name?.split(" ") || [];

  const [gender, setGender]           = useState(teacher?.gender || "Male");
  const [headTeacher, setHeadTeacher] = useState(teacher?.head_teacher ?? false);
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName:  nameParts.slice(1).join(" ") || "",
    dob:       teacher?.dob      || "",
    language:  teacher?.language || "",
    status:    teacher?.status   || "Active",
    username:  teacher?.username || "",
    password:  "",
    phone:     teacher?.phone    || "",
    email:     teacher?.email    || "",
    address:   teacher?.address  || "",
  });

  const handle = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName) { alert("Please enter at least a first name."); return; }
    console.log("Updated teacher:", { ...form, gender, head_teacher: headTeacher });
    navigate("/Teachers");
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">
            Edit Teacher — <span>{teacher?.name}</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/Teachers")} className={btnOutline}>Cancel</button>
            <button onClick={handleSave} className={btnFilled}>Save changes</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", alignItems: "start", marginTop: "30px" }}>

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
                  <input type="checkbox" id="headTeacher" checked={headTeacher} onChange={(e) => setHeadTeacher(e.target.checked)} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
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
          <div className="flex flex-col min-w-0" style={{ gap: "24px" }}>
            <Card title="Login/Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <Field>
                  <input style={inp} value={form.username} onChange={handle("username")} placeholder="User Name" />
                </Field>
                <Field>
                  <input type="password" style={inp} value={form.password} onChange={handle("password")} placeholder="New Password" />
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

export default Edit_teacher;