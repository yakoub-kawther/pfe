import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";


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
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label ? <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label> : null}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

const getError = (errors, field) => {
  const val = errors[field];
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  if (typeof val === "string") return val;
  return null;
};

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX  = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

const Edit_student = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const student   = state?.student;
  const person    = student?.person ?? {};

  const initialForm = {
    firstName      : person.first_name       ?? "",
    lastName       : person.last_name        ?? "",
    gender         : person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : "Male",
    dob            : person.dob              ?? "",
    class          : student?.class_name     ?? "",
    status         : student?.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : "Active",
    specialCase    : student?.special_case    ?? "",
    parentFirstName: student?.parent_first_name ?? "",
    parentLastName : student?.parent_last_name  ?? "",
    parentType     : student?.parent_type       ?? "",
    parentContact  : student?.parent_contact ?? student?.parent_name ?? "",
    username       : "",
    password       : "",
    phone          : person.phone            ?? "",
    email          : person.email            ?? "",
    address        : person.address          ?? "",
  };

  const [form,       setForm]       = useState(initialForm);
  const [customType, setCustomType] = useState(
    ["Father", "Mother"].includes(initialForm.parentType) ? "" : initialForm.parentType
  );
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [accountId,  setAccountId]  = useState(null);

  // Fetch the linked account (username lives on Account, not Person)
  useEffect(() => {
    if (!person.id) return;

    apiFetch("/account/accounts/") // TODO: confirm this matches your urls.py path for AccountListView
      .then((res) => res.json())
      .then((accounts) => {
        const match = accounts.find((a) => a.person_id === person.id);
        if (match) {
          setForm((prev) => ({ ...prev, username: match.username }));
          setAccountId(match.id);
        }
      })
      .catch((err) => console.error("Failed to fetch account:", err));
  }, [person.id]);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const u = { ...prev }; delete u[field]; return u; });
  };

  // const handleReset = () => {
  //   setForm(initialForm);
  //   setCustomType(["Father", "Mother"].includes(initialForm.parentType) ? "" : initialForm.parentType);
  //   setErrors({});
  //   setSuccess(false);
  // };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())                                    errs.first_name = "First name is required.";
    else if (!NAME_REGEX.test(form.firstName.trim()))              errs.first_name = "First name must be 2–50 letters only.";
    if (!form.lastName.trim())                                     errs.last_name  = "Last name is required.";
    else if (!NAME_REGEX.test(form.lastName.trim()))               errs.last_name  = "Last name must be 2–50 letters only.";
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) errs.phone      = "Phone must be exactly 10 digits.";
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) errs.email      = "Enter a valid email address.";
    if (form.password && form.password.length < 8)                errs.password   = "Password must be at least 8 characters.";
    return errs;
  };

  const handleSave = async () => {
  const frontendErrors = validate();
  if (Object.keys(frontendErrors).length > 0) { setErrors(frontendErrors); return; }

  setLoading(true);
  setErrors({});
  setSuccess(false);

  try {
    // 1. Update person/student record
    const res = await apiFetch(`/persons/students/${person.id}/`, {
      method: "PATCH",
      body: {
        first_name   : form.firstName.trim(),
        last_name    : form.lastName.trim(),
        gender       : form.gender.toLowerCase(),
        date_of_birth: form.dob,
        phone        : form.phone.trim(),
        email        : form.email.trim(),
        address      : form.address.trim(),
        special_case : form.specialCase,
        status       : form.status.toLowerCase(),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors(data.errors ?? data ?? { error: "Failed to update student." });
      setLoading(false);
      return;
    }

    // 2. Update account credentials, if changed
    // TODO: confirm this endpoint exists — see earlier note on ToggleAccountStatusView/AdminPasswordResetView
    if (accountId && (form.username || form.password)) {
      const accRes = await apiFetch(`/account/accounts/${accountId}/`, {
        method: "PATCH",
        body: {
          ...(form.username ? { username: form.username } : {}),
          ...(form.password ? { password: form.password } : {}),
        },
      });

      if (!accRes.ok) {
        const accData = await accRes.json().catch(() => ({}));
        setErrors(accData.errors ?? accData ?? { error: "Failed to update account." });
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setTimeout(() => navigate("/Students"), 1200);
  } catch {
    setErrors({ error: "Network error. Please try again." });
  } finally {
    setLoading(false);
  }
};

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
            <button
              onClick={() => navigate("/Students")}
              style={backBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Edit Student
            </h1>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            {/* <button
              onClick={handleReset}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Reset
            </button> */}
            <button
              onClick={() => navigate("/Students")}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: loading ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600" }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#701366"; }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "14px 20px", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "18px" }}>✓</span>
            Student updated successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {errors.error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", fontSize: "14px" }}>
            {errors.error}
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0, marginTop: "8px" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Personal Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

                <Field label="First Name">
                  <input style={inp(!!errors.first_name)} value={form.firstName} onChange={handle("firstName")} placeholder="First Name" />
                  {getError(errors, "first_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "first_name")}</span>}
                </Field>

                <Field label="Last Name">
                  <input style={inp(!!errors.last_name)} value={form.lastName} onChange={handle("lastName")} placeholder="Last Name" />
                  {getError(errors, "last_name") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "last_name")}</span>}
                </Field>

                <Field label="Gender">
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "14px", color: "#701366", padding: "6px 0" }}>
                    {["Male", "Female"].map((g) => (
                      <label key={g} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input type="radio" name="gender" checked={form.gender === g} onChange={() => setForm((p) => ({ ...p, gender: g }))} style={{ accentColor: "#701366", width: "15px", height: "15px" }} />
                        {g}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Date of Birth">
                  <input type="date" style={inp(false)} value={form.dob} onChange={handle("dob")} />
                </Field>

                <Field label="Class">
                  <select style={sel(false)} value={form.class} onChange={handle("class")}>
                    <option value="" disabled>Select a class</option>
                    <option>Eng-A2</option><option>Eng-B1</option><option>Eng-B2</option><option>Eng-C1</option>
                  </select>
                </Field>

                <Field label="Status">
                  <select style={sel(false)} value={form.status} onChange={handle("status")}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>

                <Field label="Special Case" full>
                  <select style={sel(false)} value={form.specialCase} onChange={handle("specialCase")}>
                    <option value="">None</option>
                    <option>Orphan</option>
                    <option>Scholarship</option>
                  </select>
                </Field>

              </div>
            </Card>

            <Card title="Parent Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Parent First Name">
                  <input style={inp(false)} value={form.parentFirstName} onChange={handle("parentFirstName")} placeholder="First Name" />
                </Field>
                <Field label="Parent Last Name">
                  <input style={inp(false)} value={form.parentLastName} onChange={handle("parentLastName")} placeholder="Last Name" />
                </Field>

                <Field label="Relationship Type" full>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px", fontSize: "14px", color: "#701366", padding: "6px 0" }}>
                    {["Father", "Mother", "Other"].map((type) => (
                      <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="parentType"
                          checked={form.parentType === type}
                          onChange={() => setForm((p) => ({ ...p, parentType: type }))}
                          style={{ accentColor: "#701366" }}
                        />
                        {type}
                      </label>
                    ))}
                    {form.parentType === "Other" && (
                      <input
                        style={{ ...inp(false), width: "200px" }}
                        placeholder="Please specify..."
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                      />
                    )}
                  </div>
                </Field>

                <Field label="Parent Contact" full>
                  <input style={inp(false)} value={form.parentContact} onChange={handle("parentContact")} placeholder="Phone number" />
                </Field>
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

            <Card title="Contact Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Phone">
                  <input style={inp(!!errors.phone)} value={form.phone} onChange={handle("phone")} placeholder="0XXXXXXXXX (10 digits)" maxLength={10} />
                  {getError(errors, "phone") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "phone")}</span>}
                </Field>
                <Field label="Email">
                  <input style={inp(!!errors.email)} value={form.email} onChange={handle("email")} placeholder="example@gmail.com" />
                  {getError(errors, "email") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "email")}</span>}
                </Field>
                <Field label="Address" full>
                  <input style={inp(false)} value={form.address} onChange={handle("address")} placeholder="Street, City, ZIP" />
                </Field>
              </div>
            </Card>

            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Username">
                  <input style={inp(false)} value={form.username} onChange={handle("username")} placeholder="User Name" />
                </Field>
                <Field label="Password">
                  <input type="password" style={inp(!!errors.password)} value={form.password} onChange={handle("password")} placeholder="New Password" />
                  {getError(errors, "password") && <span style={{ color: "#ef4444", fontSize: "11px" }}>{getError(errors, "password")}</span>}
                </Field>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Edit_student;