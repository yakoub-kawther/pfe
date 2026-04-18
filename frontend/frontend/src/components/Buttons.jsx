import { Link } from "react-router-dom";

const btnBase =
  "inline-flex items-center justify-center px-5 h-8 min-w-[72px] text-sm leading-none rounded-xl border transition-colors";

  const btnOutline =
  `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;

const btnFilled =
  `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

function Buttons({ showEdit = false, onEdit, onSave, cancelPath = "/Students" }) {
  return (
    <div className="flex justify-between items-center ">

      <div className="flex gap-2 ">
        <Link to={cancelPath} className={btnOutline}>
          Cancel
        </Link>

        {showEdit && (
          <button onClick={onEdit} className={btnOutline}>
            Edit
          </button>
        )}

        <button onClick={onSave} className={btnFilled}>
          Save
        </button>
      </div>
    </div>
  );
}

export default Buttons;