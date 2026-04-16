import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

const inp = {
  width: "100%",
  border: "1px solid #701366",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
};

const sel = {
  ...inp,
  backgroundColor: "#fff",
  cursor: "pointer",
};

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

const Edit_student = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const student = state?.student;

  // Split name into first/last (since your data has full name)
  const nameParts = student?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const [form, setForm] = useState({
    firstName,
    lastName,
    gender: "",
    dob: "",
    class: "Eng-A2",
    specialCase: "Orphan",
    fatherName: student?.parent || "",
    motherName: "",
    fatherContact: student?.contact || "",
    motherContact: "",
    username: "",
    password: "",
    phone: student?.contact || "",
    email: "",
    address: "",
  });

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    console.log("Updated student:", form);
    navigate("/Students");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pt-6 pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366]">
            Edit Student — <span className="font-medium">{student?.name}</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl border border-[#701366] text-[#701366] text-sm hover:bg-[#f8e0f8] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#701366] text-white text-sm hover:opacity-90 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 mx-auto" style={{ gap: "28px", maxWidth: "1700px" }}>

          {/* LEFT */}
          <div className="flex flex-col" style={{ gap: "28px" }}>

            <Card title="Basic Information">
              <div className="grid grid-cols-2" style={{ gap: "20px" }}>

                <Field label="First Name">
                  <input style={inp} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
                </Field>

                <Field label="Last Name">
                  <input style={inp} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
                </Field>

                <Field label="Gender">
                  <div className="flex items-center text-[#701366]" style={{ gap: "24px", padding: "8px 0", fontSize: "14px" }}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={form.gender === "Male"}
                        onChange={() => setForm((p) => ({ ...p, gender: "Male" }))}
                        style={{ accentColor: "#701366" }}
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={form.gender === "Female"}
                        onChange={() => setForm((p) => ({ ...p, gender: "Female" }))}
                        style={{ accentColor: "#701366" }}
                      />
                      Female
                    </label>
                  </div>
                </Field>

                <Field label="Date of Birth">
                  <input type="date" style={inp} value={form.dob} onChange={handle("dob")} />
                </Field>

                <Field label="Class">
                  <select style={sel} value={form.class} onChange={handle("class")}>
                    <option>Eng-A2</option>
                    <option>Eng-B1</option>
                    <option>Eng-B2</option>
                    <option>Eng-C1</option>
                  </select>
                </Field>

                <Field label="Special Case">
                  <select style={sel} value={form.specialCase} onChange={handle("specialCase")}>
                    <option>Orphan</option>
                    <option>Scholarship</option>
                  </select>
                </Field>

              </div>
            </Card>

            <Card title="Parent Details">
              <div className="grid grid-cols-2" style={{ gap: "20px" }}>

                <Field label="Father Name">
                  <input style={inp} value={form.fatherName} onChange={handle("fatherName")} placeholder="Father Name" />
                </Field>

                <Field label="Mother Name">
                  <input style={inp} value={form.motherName} onChange={handle("motherName")} placeholder="Mother Name" />
                </Field>

                <Field label="Father Contact">
                  <input style={inp} value={form.fatherContact} onChange={handle("fatherContact")} placeholder="Father Contact" />
                </Field>

                <Field label="Mother Contact">
                  <input style={inp} value={form.motherContact} onChange={handle("motherContact")} placeholder="Mother Contact" />
                </Field>

              </div>
            </Card>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col" style={{ gap: "28px" }}>

            <Card title="Account Information">
              <div className="grid grid-cols-2" style={{ gap: "20px" }}>

                <Field label="User Name">
                  <input style={inp} value={form.username} onChange={handle("username")} placeholder="Username" />
                </Field>

                <Field label="Password">
                  <input type="password" style={inp} value={form.password} onChange={handle("password")} placeholder="Password" />
                </Field>

              </div>
            </Card>

            <Card title="Contact Details">
              <div className="grid grid-cols-2" style={{ gap: "20px" }}>

                <Field label="Phone">
                  <input style={inp} value={form.phone} onChange={handle("phone")} placeholder="Phone" />
                </Field>

                <Field label="Email">
                  <input style={inp} value={form.email} onChange={handle("email")} placeholder="Email" />
                </Field>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Address">
                    <input style={inp} value={form.address} onChange={handle("address")} placeholder="Address" />
                  </Field>
                </div>

              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Edit_student;