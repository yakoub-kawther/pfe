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

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 h-7 w-12 text-sm rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] h-7 w-12 bg-white hover:bg-[#701366] hover:text-white`;
const btnGhost   = `${btnBase} border-[#701366] text-[#701366] bg-white h-7 w-12 hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366] `;

const emptyForm = {
  id: "", capacity: "", status: "Available", floor: "", equipment: "", notes: "",
};

export default function Add_classrooms() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.id) { alert("Please enter a classroom ID."); return; }
    console.log("New classroom:", form);
    navigate("/Classrooms");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">Add New Classroom</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/Classrooms")} className={btnOutline}>cancel</button>
            <button onClick={handleReset} className={btnGhost}>reset</button>
            <button onClick={handleSave} className={btnFilled}>save</button>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start", marginTop: "30px"  }}>

          {/* LEFT */}
          <Card title="Classroom Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="Classroom ID">
                <input style={inp} value={form.id} onChange={handle("id")} placeholder="e.g. Room 3" />
              </Field>

              <Field label="Capacity">
                <input type="number" min="1" style={inp} value={form.capacity} onChange={handle("capacity")} placeholder="e.g. 20" />
              </Field>

              <Field label="Floor">
                <input style={inp} value={form.floor} onChange={handle("floor")} placeholder="e.g. Ground floor" />
              </Field>

              <Field label="Status">
                <select style={sel} value={form.status} onChange={handle("status")}>
                  <option>Available</option>
                  <option>Occupied</option>
                </select>
              </Field>

            </div>
          </Card>

          {/* RIGHT */}
          <Card title="Additional Details">
            <div className="grid grid-cols-1" style={{ gap: "18px" }}>

              <Field label="Equipment">
                <input style={inp} value={form.equipment} onChange={handle("equipment")} placeholder="e.g. Projector, Whiteboard" />
              </Field>

              <Field label="Notes">
                <textarea
                  style={{ ...inp, resize: "none", height: "120px" }}
                  value={form.notes}
                  onChange={handle("notes")}
                  placeholder="Additional notes about this classroom..."
                />
              </Field>

            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}