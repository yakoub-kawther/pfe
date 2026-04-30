import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const btnBase    = "inline-flex items-center justify-center text-sm leading-none rounded-xl border transition-colors cursor-pointer";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

const btnStyle = { width: "80px", height: "32px", flexShrink: 0 };

function Buttons({ showEdit = false, showSave = true, showReset = false, onEdit, onSave, onReset, onCancel, cancelPath = "/Students",   saveLabel = "Save" }) {
  return (
    <div className="flex items-center gap-2">

      {/* if onCancel is provided → button, otherwise → Link */}
      {onCancel ? (
        <button type="button" onClick={onCancel} className={btnOutline} style={btnStyle}>
          Cancel
        </button>
      ) : (
        <Link to={cancelPath} className={btnOutline} style={btnStyle}>
          Cancel
        </Link>
      )}

      {showEdit && (
        <button type="button" onClick={onEdit} className={btnOutline} style={btnStyle}>
          Edit
        </button>
      )}

      {showReset && (
        <button type="button" onClick={onReset} className={btnOutline} style={btnStyle}>
          Reset
        </button>
      )}

      {showSave && (
        <button type="button" onClick={onSave} className={btnFilled} style={{ ...btnStyle, width: "auto", padding: "0 16px" }}>
          {saveLabel}
        </button>
      )}

    </div>
  );
}

export default Buttons;