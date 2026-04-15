import { useNavigate, useLocation } from "react-router-dom";

export function Tabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Profile", path: "/Student_profile" },
    { name: "Classes", path: "/Classes_student" },
    { name: "Payment", path: "/Payment_student" },
    { name: "Attendance", path: "/Attendance_student" },
  ];

  return (
    <div className="grid grid-cols-6 gap-2 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 rounded-full text-sm h-8 transition ${
            location.pathname === tab.path
              ? "bg-[#F8E0F8] text-[#701366]"
              : "bg-white"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}