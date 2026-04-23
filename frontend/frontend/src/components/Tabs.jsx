import { useNavigate, useLocation } from "react-router-dom";

const Tabs = ({ tabs }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexShrink: 0 }}>
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => navigate(tab.path)}
          style={{
            padding: "0 16px",
            height: "32px",
            borderRadius: "8px",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "background 0.15s",
            background: location.pathname === tab.path ? "#F8E0F8" : "white",
            color: "#701366",
          }}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default Tabs;