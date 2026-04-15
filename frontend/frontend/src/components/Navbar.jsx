import { Bell, Settings } from "lucide-react";
import Notif_drop_down from "./Notif_drop_down"
function Navbar() {
  return (
<header className="flex items-center justify-end mb-8" style={{ paddingTop: "16px" }}>      
  <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <Notif_drop_down />
     

        {/* Settings */}
        <button
          aria-label="Settings"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-[#701366] hover:bg-[#701366] hover:text-white transition-all duration-150 hover:scale-105"
        >
          <Settings className="w-5 h-5" />
        </button>

      </div>
    </header>
  );
}

export default Navbar;