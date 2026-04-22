import { useNavigate, useLocation } from "react-router-dom";

const Tabs = ({ tabs }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
 <div className="flex gap-2 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 rounded-lg text-sm h-8 transition ${
            location.pathname === tab.path
              ? "bg-[#F8E0F8] text-[#701366]"
              : "bg-white text-[#701366]"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};
export default Tabs;