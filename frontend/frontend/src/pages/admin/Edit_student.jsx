import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";

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

const sel = { ...inp, backgroundColor: "#fff", cursor: "pointer" };

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] text-gray-400">{label}</label>
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-200 min-w-0"
    style={{ padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
  >
    <h3
      className="text-[#701366] font-Inter border-b border-[#f0e0ee]"
      style={{ fontSize: "17px", marginBottom: "20px", paddingBottom: "12px" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Edit_student = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const student   = state?.student;
  const nameParts = student?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName  = nameParts.slice(1).join(" ") || "";

  const [form, setForm] = useState({
    firstName,
    lastName,
    gender:          "",
    dob:             "",
    class:           "Eng-A2",
    specialCase:     "Orphan",
    parentFirstName: "",
    parentLastName:  "",
    parentContact:   student?.contact || "",
    username:        "",
    password:        "",
    phone:           student?.contact || "",
    email:           "",
    address:         "",
  });

  const [parentType, setParentType] = useState("");
  const [customType, setCustomType] = useState("");

  const handle = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    console.log("Updated student:", { ...form, parentType: parentType === "Other" ? customType : parentType });
    navigate("/Students");
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366]">
            Edit Student — <span className="font-Inter">{student?.name}</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-sm border border-[#701366] bg-white text-[#701366] text-sm hover:bg-[#701366] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-sm border border-[#701366] bg-[#701366] text-white text-sm hover:bg-white hover:text-[#701366] transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px", marginTop: "30px" }}>

          {/* LEFT */}
          <div className="flex flex-col min-w-0" style={{ gap: "28px" }}>

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
                      <input type="radio" name="gender" checked={form.gender === "Male"} onChange={() => setForm((p) => ({ ...p, gender: "Male" }))} style={{ accentColor: "#701366" }} />
                      Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" checked={form.gender === "Female"} onChange={() => setForm((p) => ({ ...p, gender: "Female" }))} style={{ accentColor: "#701366" }} />
                      Female
                    </label>
                  </div>
                </Field>
                <Field label="Date of Birth">
                  <input type="date" style={inp} value={form.dob} onChange={handle("dob")} />
                </Field>
                <Field label="Class">
                  <select style={sel} value={form.class} onChange={handle("class")}>
                    <option>Eng-A2</option><option>Eng-B1</option><option>Eng-B2</option><option>Eng-C1</option>
                  </select>
                </Field>
                <Field label="Special Case">
                  <select style={sel} value={form.specialCase} onChange={handle("specialCase")}>
                    <option>Orphan</option><option>Scholarship</option>
                  </select>
                </Field>
              </div>
            </Card>

            {/* PARENT DETAILS */}
            <Card title="Parent Details">
              <div className="grid grid-cols-2" style={{ gap: "20px" }}>

                <Field label="Parent First Name">
                  <input style={inp} value={form.parentFirstName} onChange={handle("parentFirstName")} placeholder="First Name" />
                </Field>

                <Field label="Parent Last Name">
                  <input style={inp} value={form.parentLastName} onChange={handle("parentLastName")} placeholder="Last Name" />
                </Field>

                {/* Relationship Type — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Relationship Type">
                    <div className="flex items-center flex-wrap text-[#701366]" style={{ gap: "20px", padding: "8px 0", fontSize: "14px" }}>
                      {["Father", "Mother", "Other"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="parentType"
                            value={type}
                            checked={parentType === type}
                            onChange={() => setParentType(type)}
                            style={{ accentColor: "#701366" }}
                          />
                          {type}
                        </label>
                      ))}
                      {parentType === "Other" && (
                        <input
                          style={{ ...inp, width: "200px" }}
                          placeholder="Please specify..."
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                        />
                      )}
                    </div>
                  </Field>
                </div>

                {/* Contact — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Parent Contact">
                    <input style={inp} value={form.parentContact} onChange={handle("parentContact")} placeholder="Phone number" />
                  </Field>
                </div>

              </div>
            </Card>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col min-w-0" style={{ gap: "28px" }}>

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