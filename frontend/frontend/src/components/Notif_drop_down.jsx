import { useState, useRef, useEffect } from "react";
import { Bell, Info } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: "bell", sender: "Dr hamza",               message: "We don't have a session today",        time: "2h",                read: false },
  { id: 2, icon: "bell", sender: "Updated the Classroom",  message: "English C2 to room 4",                time: "6h",                read: false },
  { id: 3, icon: "info", sender: "Dr amine",               message: "you have a test of english Tomorrow",  time: "Today 9:36 am",     read: true  },
  { id: 4, icon: "info", sender: "Emily Tyler",            message: "don't forget the test of espagnol",    time: "Tomorrow",          read: true  },
  { id: 5, icon: "bell", sender: "Updated the prgrm of spanish", message: "",                              time: "Tomorrow",          read: true  },
  { id: 6, icon: "bell", sender: "Blake Silve",            message: "we repport the session of french",     time: "Sep 12 | 10:54 am", read: true  },
];

export default function NotifDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-[#701366] hover:text-white hover:bg-[#701366] transition-all duration-150 hover:scale-105"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 w-72 bg-[#fce8fc] rounded-2xl shadow-xl p-4 z-50 border border-[#e8b4e8]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-[#701366] text-sm">Notifications</span>
            <button
              onClick={() => setOpen(false)}
              className="w-5 h-5 rounded-full bg-[#701366] text-white text-[10px] flex items-center justify-center hover:bg-[#5a0f52] transition"
            >
              ✕
            </button>
          </div>

          {/* Notification list */}
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition ${
                  n.read ? "bg-white/50" : "bg-white shadow-sm"
                }`}
              >
                <div className="mt-0.5 shrink-0 text-[#701366]">
                  {n.icon === "bell"
                    ? <Bell className="w-3.5 h-3.5" />
                    : <Info className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 leading-snug">
                    <span className="font-bold">{n.sender}</span>
                    {n.message ? ` ${n.message}` : ""}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-[#701366] mt-1 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <button
            onClick={markAllRead}
            className="mt-3 w-full text-center text-xs text-[#701366] font-semibold hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}