import { useLocation, useNavigate } from "react-router-dom";
import Secretary_layout from "../../layouts/Secretary_layout";
import Buttons from "../../components/Buttons";

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


export default function Classes_information_secretary() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  return (
    <Secretary_layout>
      {/* only change: max-w-5xl → w-full, padding uses clamp so it never overflows */}
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

{/* Header */}
<div className="flex items-center justify-between mb-8">
  <h1 className="text-2xl text-[#701366] font-Inter">Class Information</h1>
  <Buttons
    cancelPath="/Classes_secretary"
    showSave={false}
    showEdit={true}
    onEdit={() => navigate("/Edit_classes_secretary", { state: { cls } })}
  />
</div>

        {/* single card — no grid needed anymore */}
        <div style={{ marginTop: "30px" }}>
          {/* Class Details */}
          <Card title="Class Details">
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
        </div>
      </div>
    </Secretary_layout>
  );
}