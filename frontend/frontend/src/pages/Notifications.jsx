import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Bell, Info } from "lucide-react";

const NOTIFICATION_TYPES = ["Announcement", "Alert", "Information"];
const RECIPIENTS = ["All Users", "Students", "Teachers", "Specific Class"];

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: "bell", sender: "Dr hamza",               message: "We don't have a session today",        time: "2h",                read: false },
  { id: 2, icon: "bell", sender: "Updated the Classroom",  message: "English C2 to room 4",                time: "6h",                read: false },
  { id: 3, icon: "info", sender: "Dr amine",               message: "you have a test of english Tomorrow",  time: "Today 9:36 am",     read: true  },
  { id: 4, icon: "info", sender: "Emily Tyler",            message: "don't forget the test of espagnol",    time: "Tomorrow",          read: true  },
  { id: 5, icon: "bell", sender: "Updated the prgrm of spanish", message: "",                              time: "Tomorrow",          read: true  },
  { id: 6, icon: "bell", sender: "Blake Silve",            message: "we repport the session of french",     time: "Sep 12 | 10:54 am", read: true  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [form, setForm] = useState({
    type: "", recipients: "", title: "", message: "",
  });

  const handleSend = () => {
    if (!form.title && !form.message) return;
    const newNotif = {
      id: Date.now(),
      icon: form.type === "Alert" ? "info" : "bell",
      sender: form.title || "New Notification",
      message: form.message,
      time: "Just now",
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
    setForm({ type: "", recipients: "", title: "", message: "" });
  };

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <DashboardLayout>
      <h2 className="text-lg font-semibold text-gray-500 mb-5">Notifications</h2>

      <div className="flex gap-6 items-start">

        {/* ── LEFT: Send Notification Form ── */}
        <div className="bg-[#fce8fc] rounded-2xl p-6 w-96 shadow-sm shrink-0">

          {/* Notification Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#701366] mb-1">
              Notification Type
            </label>
            <input
              list="notif-types"
              placeholder="Announcement, Alert, Information"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-white border border-[#e8b4e8] rounded-lg px-3 py-2 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-[#701366]/20"
            />
            <datalist id="notif-types">
              {NOTIFICATION_TYPES.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          {/* Recipients */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#701366] mb-1">
              Recipients
            </label>
            <input
              list="notif-recipients"
              placeholder="all users, students, teachers, specific class"
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              className="w-full bg-white border border-[#e8b4e8] rounded-lg px-3 py-2 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-[#701366]/20"
            />
            <datalist id="notif-recipients">
              {RECIPIENTS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#701366] mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter notification title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white border border-[#e8b4e8] rounded-lg px-3 py-2 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-[#701366]/20"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#701366] mb-1">
              Message
            </label>
            <textarea
              placeholder="Enter your message here..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full bg-white border border-[#e8b4e8] rounded-lg px-3 py-2 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-[#701366]/20 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setForm({ type: "", recipients: "", title: "", message: "" })}
              className="flex items-center gap-1 border border-[#e8b4e8] text-[#701366] bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8e0f8] transition"
            >
              ✕ Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1 bg-[#701366] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-[#701366] border border-[#701366] transition"
            >
              ✓ Send
            </button>
          </div>
        </div>

        {/* ── RIGHT: Notifications List ── */}
        <div className="bg-[#fce8fc] rounded-2xl p-4 w-72 shadow-sm shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-[#701366] text-sm">Notifications</span>
            <div className="w-5 h-5 rounded-full bg-[#701366] text-white text-[10px] flex items-center justify-center font-bold">
              ✕
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-120 overflow-y-auto pr-1">
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
        </div>

      </div>
    </DashboardLayout>
  );
}