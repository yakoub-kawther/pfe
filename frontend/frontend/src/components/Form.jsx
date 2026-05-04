import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

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

const getError = (errors, field) => {
  const val = errors[field];
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  if (typeof val === "string") return val;
  return null;
};

const getAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age;
};

const Form = ({ onSuccess }) => {
  const [gender,      setGender]      = useState("Male");
  const [parentType,  setParentType]  = useState("");
  const [customType,  setCustomType]  = useState("");

  const [firstName,       setFirstName]       = useState("");
  const [lastName,        setLastName]        = useState("");
  const [dateOfBirth,     setDateOfBirth]     = useState("");
  const [specialCase,     setSpecialCase]     = useState("");
  const [phone,           setPhone]           = useState("");
  const [email,           setEmail]           = useState("");
  const [address,         setAddress]         = useState("");
  const [username,        setUsername]        = useState("");
  const [password,        setPassword]        = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName,  setParentLastName]  = useState("");
  const [parentPhone,     setParentPhone]     = useState("");

  const [classes,  setClasses]  = useState([]);
  const [classVal, setClassVal] = useState("");

  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const clearErr = (...fields) =>
    setErrors(p => { const u = { ...p }; fields.forEach(f => delete u[f]); return u; });

  useEffect(() => {
    apiFetch("/academic/classes/?status=active")
      .then(r => r.json())
      .then(data => setClasses(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {});
  }, []);

  const age = getAge(dateOfBirth);
  const isMinor = age !== null && age < 18;

  const handleSubmit = async () => {
    const currentAge     = getAge(dateOfBirth);
    const currentIsMinor = currentAge !== null && currentAge < 18;

    const errs = {};
    if (!firstName.trim())        errs.first_name = "First name is required.";
    if (!lastName.trim())         errs.last_name  = "Last name is required.";
    if (!dateOfBirth)             errs.dob        = "Date of birth is required.";
    if (!phone.trim() && !currentIsMinor)            errs.phone      = "Phone is required.";
    if (!username.trim())         errs.username   = "Username is required.";
    if (!password.trim())         errs.password   = "Password is required.";
    else if (password.length < 6) errs.password   = "Password must be at least 6 characters.";
    if (currentIsMinor) {
      if (!parentFirstName.trim()) errs.parent_first_name = "Parent first name is required.";
      if (!parentLastName.trim())  errs.parent_last_name  = "Parent last name is required.";
      if (!parentPhone.trim())     errs.parent_phone      = "Parent phone is required.";
      if (!parentType)             errs.parent_type       = "Relationship type is required.";
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});

    try {
      // 1. Create parent if minor
      let parentId = null;
      if (currentIsMinor) {
        const pRes = await apiFetch("/persons/parents/", {
          method: "POST",
          body: {
            first_name  : parentFirstName,
            last_name   : parentLastName,
            phone       : parentPhone,
            gender      : "male",
            relationship: parentType.toLowerCase() === "other"
              ? (customType || "other")
              : parentType.toLowerCase(),
          },
        });
        if (!pRes.ok) {
          const errData = await pRes.json();
          setErrors({ error: errData.detail || errData.phone?.[0] || "Failed to create parent." });
          return;
        }
        const pData = await pRes.json();
        parentId = pData.id ?? pData.parent_id ?? null;
      }

      // 2. Create student
      const sRes = await apiFetch("/persons/students/", {
        method: "POST",
        body: {
          first_name   : firstName,
          last_name    : lastName,
          gender       : gender.toLowerCase(),
          phone,
          email        : email       || null,
          address      : address     || null,
          date_of_birth: dateOfBirth,
          special_case : specialCase || null,
          parent_id    : parentId,
          class_id     : classVal    || null,
        },
      });
      if (!sRes.ok) {
        const errData = await sRes.json();
        const mapped  = {};
        if (errData.first_name) mapped.first_name = errData.first_name;
        if (errData.last_name)  mapped.last_name  = errData.last_name;
        if (errData.phone)      mapped.phone      = errData.phone;
        if (errData.email)      mapped.email      = errData.email;
        if (errData.detail)     mapped.error      = errData.detail;
        setErrors(mapped);
        return;
      }
      const sData     = await sRes.json();
      const studentId = sData.person?.id ?? sData.id ?? null;

      if (!studentId) {
        setErrors({ error: "Could not retrieve student ID. Check API response." });
        return;
      }

      // 3. Create account
      const aRes = await apiFetch("/account/create-account/", {
        method: "POST",
        body: {
          person_type: "student",
          person_id  : studentId,
          role       : "student",
          username,
          password,
        },
      });
      if (!aRes.ok) {
        const errData = await aRes.json();
        const mapped  = {};
        if (errData.username) mapped.username = errData.username;
        if (errData.password) mapped.password = errData.password;
        if (errData.detail)   mapped.error    = errData.detail;
        setErrors(mapped);
        return;
      }

      onSuccess && onSuccess();
    } catch {
      setErrors({ error: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>

      {/* Global error banner */}
      {errors.error && (
        <div style={{
          background: "#fef2f2", color: "#991b1b",
          padding: "12px 20px", borderRadius: "10px",
          marginBottom: "20px", fontSize: "14px",
          border: "1px solid #fecaca",
        }}>
           {errors.error}
        </div>
      )}

      {/* Two-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* LEFT */}
        <div className="flex flex-col" style={{ gap: "24px" }}>

          <Card title="Basic Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="First Name">
                <input style={inp(!!errors.first_name)} value={firstName} placeholder="First Name"
                  onChange={e => { setFirstName(e.target.value); clearErr("first_name"); }} />
                {getError(errors, "first_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "first_name")}</span>}
              </Field>

              <Field label="Last Name">
                <input style={inp(!!errors.last_name)} value={lastName} placeholder="Last Name"
                  onChange={e => { setLastName(e.target.value); clearErr("last_name"); }} />
                {getError(errors, "last_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "last_name")}</span>}
              </Field>

              <Field label="Gender">
                <div className="flex items-center gap-5 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                  {["Male", "Female"].map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" checked={gender === g}
                        onChange={() => setGender(g)}
                        style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                      {g}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={`Date of Birth${age !== null ? ` (Age: ${age})` : ""}`}>
                <input type="date" style={inp(!!errors.dob)} value={dateOfBirth}
                  onChange={e => { setDateOfBirth(e.target.value); clearErr("dob"); }} />
                {getError(errors, "dob") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "dob")}</span>}
              </Field>

              <Field label="Class">
                <select style={sel(false)} value={classVal} onChange={e => setClassVal(e.target.value)}>
                  <option value="">Select a class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Special Case">
                <select style={sel(false)} value={specialCase} onChange={e => setSpecialCase(e.target.value)}>
                  <option value="">None</option>
                  <option>Orphan</option>
                  <option>Scholarship</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* PARENT DETAILS */}
          <Card title="Parent Details">
            {!isMinor && (
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
                Parent details are required only for students under 18.
              </p>
            )}
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="Parent First Name">
                <input style={inp(!!errors.parent_first_name)} value={parentFirstName} placeholder="First Name"
                  onChange={e => { setParentFirstName(e.target.value); clearErr("parent_first_name"); }} />
                {getError(errors, "parent_first_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "parent_first_name")}</span>}
              </Field>

              <Field label="Parent Last Name">
                <input style={inp(!!errors.parent_last_name)} value={parentLastName} placeholder="Last Name"
                  onChange={e => { setParentLastName(e.target.value); clearErr("parent_last_name"); }} />
                {getError(errors, "parent_last_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "parent_last_name")}</span>}
              </Field>

              <Field label="Relationship Type" full>
                <div className="flex items-center flex-wrap gap-5 text-[14px] text-[#701366]" style={{ padding: "6px 0" }}>
                  {["Father", "Mother", "Other"].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="parentType" value={type}
                        checked={parentType === type}
                        onChange={() => { setParentType(type); clearErr("parent_type"); }}
                        style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                      {type}
                    </label>
                  ))}
                  {parentType === "Other" && (
                    <input style={{ ...inp(false), width: "180px" }} placeholder="Please specify..."
                      value={customType} onChange={e => setCustomType(e.target.value)} />
                  )}
                </div>
                {getError(errors, "parent_type") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "parent_type")}</span>}
              </Field>

              <Field label="Parent Phone" full>
                <input style={inp(!!errors.parent_phone)} value={parentPhone} placeholder="0XXXXXXXXXX (10 digits)" maxLength={10}
                  onChange={e => { setParentPhone(e.target.value); clearErr("parent_phone"); }} />
                {getError(errors, "parent_phone") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "parent_phone")}</span>}
              </Field>

            </div>
          </Card>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col" style={{ gap: "24px" }}>

          <Card title="Account Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <Field label="Username">
                <input style={inp(!!errors.username)} value={username} placeholder="Username"
                  onChange={e => { setUsername(e.target.value); clearErr("username"); }} />
                {getError(errors, "username") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "username")}</span>}
              </Field>



              <Field label="Password">
                <input type="password" style={inp(!!errors.password)} value={password} placeholder="Password"
                  onChange={e => { setPassword(e.target.value); clearErr("password"); }} />
                {getError(errors, "password") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "password")}</span>}
              </Field>
            </div>
          </Card>

          <Card title="Contact Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>



              <Field label="Phone">
                <input style={inp(!!errors.phone)} value={phone} placeholder="0XXXXXXXXX (10 digits)" maxLength={10}
                  onChange={e => { setPhone(e.target.value); clearErr("phone"); }} />
                {getError(errors, "phone") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "phone")}</span>}
              </Field>



              <Field label="Email">
                <input style={inp(!!errors.email)} value={email} placeholder="example@gmail.com"
                  onChange={e => { setEmail(e.target.value); clearErr("email"); }} />
                {getError(errors, "email") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "email")}</span>}
              </Field>
              <Field label="Address" full>
                <input style={inp(false)} value={address} placeholder="Street, City, ZIP"
                  onChange={e => setAddress(e.target.value)} />
              </Field>
            </div>
          </Card>

        </div>
      </div>

      {/* Hidden trigger */}
      <button id="form-submit-trigger" style={{ display: "none" }} onClick={handleSubmit} disabled={submitting} />
    </div>
  );
};

export default Form;