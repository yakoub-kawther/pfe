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
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", color: "#9ca3af" }}>{label}</label>
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    style={{
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      padding: "28px 32px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      boxSizing: "border-box",
      width: "100%",
    }}
  >
    <h3
      style={{
        fontSize: "17px",
        fontWeight: 500,
        color: "#701366",
        borderBottom: "1px solid #f0e0ee",
        marginBottom: "20px",
        paddingBottom: "12px",
        margin: "0 0 20px 0",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Form = () => {
  const [gender, setGender] = useState("");
  const [parentType, setParentType] = useState("");
  const [customType, setCustomType] = useState("");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "28px",
        padding: "10px 16px",
        width: "100%",
        maxWidth: "1700px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >

      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

        {/* BASIC INFO */}
        <Card title="Basic Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            <Field label="First Name">
              <input style={inp} placeholder="First Name" />
            </Field>

            <Field label="Last Name">
              <input style={inp} placeholder="Last Name" />
            </Field>

            <Field label="Gender">
              <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "8px 0", fontSize: "14px", color: "#701366" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "Male"}
                    onChange={() => setGender("Male")}
                    style={{ accentColor: "#701366" }}
                  />
                  Male
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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

        {/* PARENT DETAILS */}
        <Card title="Parent Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            <Field label="Parent First Name">
              <input style={inp} placeholder="First Name" />
            </Field>

            <Field label="Parent Last Name">
              <input style={inp} placeholder="Last Name" />
            </Field>

            {/* Relationship Type — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Relationship Type">
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px", padding: "8px 0", fontSize: "14px", color: "#701366" }}>
                  {["Father", "Mother", "Other"].map((type) => (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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
                <input style={inp} placeholder="Phone number" />
              </Field>
            </div>

          </div>
        </Card>

      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

        {/* ACCOUNT */}
        <Card title="Account Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

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