import { useState } from "react";

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

const Form = () => {
  const [gender, setGender] = useState("");

  return (
    <div
      className="grid grid-cols-2 mx-auto"
      style={{ gap: "28px", padding: "10px 16px", maxWidth: "1700px" }}
    >

      {/* LEFT */}
      <div className="flex flex-col" style={{ gap: "28px" }}>

        {/* BASIC INFO */}
        <Card title="Basic Information">
          <div className="grid grid-cols-2" style={{ gap: "20px" }}>

            <Field label="First Name">
              <input style={inp} placeholder="First Name" />
            </Field>

            <Field label="Last Name">
              <input style={inp} placeholder="Last Name" />
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
                    onChange={() => setGender("Male")}
                    style={{ accentColor: "#701366" }}
                  />
                  Male
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "Female"}
                    onChange={() => setGender("Female")}
                    style={{ accentColor: "#701366" }}
                  />
                  Female
                </label>
              </div>
            </Field>

            <Field label="Date of Birth">
              <input type="date" style={inp} />
            </Field>

            <Field label="Class">
              <select style={sel}>
                <option>Eng-A2</option>
                <option>Eng-B1</option>
                <option>Eng-B2</option>
                <option>Eng-C1</option>
              </select>
            </Field>

            <Field label="Special Case">
              <select style={sel}>
                <option>Orphan</option>
                <option>Scholarship</option>
              </select>
            </Field>

          </div>
        </Card>

        {/* PARENT */}
        <Card title="Parent Details">
          <div className="grid grid-cols-2" style={{ gap: "20px" }}>

            <Field label="Father Name">
              <input style={inp} placeholder="Father Name" />
            </Field>

            <Field label="Mother Name">
              <input style={inp} placeholder="Mother Name" />
            </Field>

            <Field label="Father Contact">
              <input style={inp} placeholder="Father Contact" />
            </Field>

            <Field label="Mother Contact">
              <input style={inp} placeholder="Mother Contact" />
            </Field>

          </div>
        </Card>

      </div>

      {/* RIGHT */}
      <div className="flex flex-col" style={{ gap: "28px" }}>

        {/* ACCOUNT */}
        <Card title="Account Information">
          <div className="grid grid-cols-2" style={{ gap: "20px" }}>

            <Field label="User Name">
              <input style={inp} placeholder="Username" />
            </Field>

            <Field label="Password">
              <input type="password" style={inp} placeholder="Password" />
            </Field>

          </div>
        </Card>

        {/* CONTACT */}
        <Card title="Contact Details">
          <div className="grid grid-cols-2" style={{ gap: "20px" }}>

            <Field label="Phone">
              <input style={inp} placeholder="Phone" />
            </Field>

            <Field label="Email">
              <input style={inp} placeholder="Email" />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Address">
                <input style={inp} placeholder="Address" />
              </Field>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
};

export default Form;