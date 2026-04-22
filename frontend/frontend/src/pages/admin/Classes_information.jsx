import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const statusStyles = {
  Active:   "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
};

const ReadField = ({ label, value, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    <div
      style={{
        width: "100%",
        border: "1px solid #e2d0e2",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "14px",
        color: "#701366",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#faf5fa",
        minHeight: "40px",
      }}
    >
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
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
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white h-7 w-12 hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366] `;

export default function Classes_information() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">Class Information</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/Classes")} className={btnOutline}>Back</button>
            <button onClick={() => navigate("/Edit_classes", { state: { cls } })} className={btnFilled}>Edit</button>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start", marginTop: "30px"  }}>

          {/* LEFT — Class Details */}
          <Card title="Class Details">

            {/* Class name + status badge */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex items-center justify-center rounded-full bg-[#f8e0f8] text-[#701366] font-Inter text-xl"
                style={{ width: "52px", height: "52px", flexShrink: 0 }}
              >
                {cls?.name?.charAt(0) || "C"}
              </div>
              <div>
                <p className="text-[#701366] font-Inter text-base leading-tight">{cls?.name || "—"}</p>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs mt-1 ${statusStyles[cls?.status?.text] || "bg-gray-100 text-gray-600"}`}>
                  {cls?.status?.text || "Unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <ReadField label="Class Name"    value={cls?.name} />
              <ReadField label="Language"      value={cls?.language} />
              <ReadField label="Level"         value={cls?.level} />
              <ReadField label="Teacher"       value={cls?.teacher} />
              <ReadField label="Students"      value={cls?.students?.toString()} />
              <ReadField label="Academic Year" value={cls?.year} />
            </div>
          </Card>

          {/* RIGHT — Schedule & Notes */}
          <Card title="Schedule & Notes">
            <div className="grid grid-cols-1" style={{ gap: "18px" }}>
              <ReadField label="Classroom"   value={cls?.classroom} />
              <ReadField label="Schedule"    value={cls?.schedule} />
              <ReadField label="Description" value={cls?.description} />
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}