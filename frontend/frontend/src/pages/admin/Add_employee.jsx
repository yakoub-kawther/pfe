import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
const btnOutline = `${btnBase} border-[#701366] text-[#701366] h-7 w-12 bg-white hover:bg-[#701366] hover:text-white`;
const btnGhost   = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:text-[#701366] hover:bg-white`;

const emptyForm = {
  firstName: "", lastName: "", dob: "", position: "", hireDate: "",
  status: "Active", phone: "", email: "", address: "",
};

export default function Add_employee() {
  const navigate = useNavigate();
  const [gender, setGender] = useState("Male");
  const [form,   setForm]   = useState(emptyForm);

  const handle      = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleReset = () => { setForm(emptyForm); setGender("Male"); };
  const handleSave  = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName) { alert("Please enter at least a first name."); return; }
    console.log("New employee:", { ...form, gender });
    navigate("/Employees");
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "30px" }}>
          <h1 className="text-2xl text-[#701366] font-Inter">Add New Employee</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate("/Employees")} className={btnOutline}>Cancel</button>
            <button onClick={handleReset}                  className={btnGhost}>Reset</button>
            <button onClick={handleSave}                   className={btnFilled}>Save</button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* LEFT — Basic Information */}
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

              <Field label="Position">
                <input style={inp} value={form.position} onChange={handle("position")} placeholder="e.g. Receptionist" />
              </Field>

              <Field label="Hire Date">
                <input type="date" style={inp} value={form.hireDate} onChange={handle("hireDate")} />
              </Field>

              <Field label="Status">
                <select style={sel} value={form.status} onChange={handle("status")}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* RIGHT — Contact only */}
          <Card title="Contact Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <Field label="Phone">
                <input style={inp} value={form.phone} onChange={handle("phone")} placeholder="Contact number" />
              </Field>
              <Field label="Email">
                <input style={inp} value={form.email} onChange={handle("email")} placeholder="example@gmail.com" />
              </Field>
              <Field label="Address" full>
                <input style={inp} value={form.address} onChange={handle("address")} placeholder="city" />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}