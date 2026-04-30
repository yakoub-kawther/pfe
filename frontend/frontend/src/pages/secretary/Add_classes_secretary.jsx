import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Secretary_layout from "../../layouts/Secretary_layout";
import Buttons from "../../components/Buttons";


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
    {label ? <label className="text-[13px] text-gray-500 font-medium">{label}</label> : null}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-semibold" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);

      
const emptyForm = {
  name: "", language: "", level: "", teacher: "",
  students: "", year: "", classroom: "", status: "Active",
};

export default function Add_classes_secretary() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name) { alert("Please enter a class name."); return; }
    console.log("New class:", form);
    navigate("/Classes_secretary");
  };

  return (
    <Secretary_layout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-2xl text-[#701366] font-Inter">Add New Class</h1>
        <Buttons
          cancelPath="/Classes_secretary"
          showReset={true}
          onReset={handleReset}
          onSave={handleSave}
        />
      </div>

        <Card title="Class Information">
          <div className="grid grid-cols-2" style={{ gap: "18px" }}>

            <Field label="Class Name" full>
              <input style={inp} value={form.name} onChange={handle("name")} placeholder="e.g. Class A" />
            </Field>

            <Field label="Language">
              <select style={sel} value={form.language} onChange={handle("language")}>
                <option value="">Select language</option>
                <option>English</option>
                <option>French</option>
                <option>Arabic</option>
                <option>Spanish</option>
                <option>Italian</option>
              </select>
            </Field>

            <Field label="Level">
              <select style={sel} value={form.level} onChange={handle("level")}>
                <option value="">Select level</option>
                <option>A1</option><option>A2</option><option>B1</option>
                <option>B2</option><option>C1</option><option>C2</option>
              </select>
            </Field>

            <Field label="Teacher">
              <input style={inp} value={form.teacher} onChange={handle("teacher")} placeholder="e.g. Mr Ahmed" />
            </Field>

            <Field label="Max Students">
              <input type="number" min="1" style={inp} value={form.students} onChange={handle("students")} placeholder="e.g. 15" />
            </Field>

            <Field label="Academic Year">
              <input style={inp} value={form.year} onChange={handle("year")} placeholder="e.g. 2025-2026" />
            </Field>

            <Field label="Classroom">
              <input style={inp} value={form.classroom} onChange={handle("classroom")} placeholder="e.g. Room 3" />
            </Field>

            <Field label="Status">
              <select style={sel} value={form.status} onChange={handle("status")}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>

          </div>
        </Card>
      </div>
    </Secretary_layout>
  );
}