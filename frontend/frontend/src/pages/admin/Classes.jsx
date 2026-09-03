import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  SquarePen,
  LayoutGrid,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";
import { useClasses } from "../../hooks/useClasses";
import { useLanguages } from "../../hooks/useLanguages";
import { useLevels } from "../../hooks/useLevels";
import { useTeachers } from "../../hooks/useTeachers";

const thStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 500,
  textAlign: "center",
  whiteSpace: "nowrap",
  color: "#701366",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#701366",
  whiteSpace: "nowrap",
  textAlign: "center",
};

/* ── Status -> color mapping. The model has 4 real statuses (active,
   scheduled, completed, cancelled) — this used to be a binary
   active/inactive look which mislabeled scheduled & completed classes
   as "inactive" red. ── */
const STATUS_COLORS = {
  active:    { bg: "#e6f7ec", color: "#1a7f4b" },
  scheduled: { bg: "#eaf2fb", color: "#1d4ed8" },
  completed: { bg: "#f3e8ff", color: "#7c3aed" },
  cancelled: { bg: "#fdecea", color: "#c92c2c" },
};

const statusStyle = (status) => {
  const c = STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background: c.bg,
    color: c.color,
    textTransform: "capitalize",
  };
};

const PAGE_SIZE = 10;

/* ── Add/Edit modal input styles ── */
const inp = {
  width: "100%",
  border: "1px solid #e2d0e2",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};
const sel = { ...inp, cursor: "pointer" };

const Field = ({ label, children, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}) }}>
    {label && <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    {children}
  </div>
);

const emptyForm = {
  name: "", language: "", level: "", teacher: "",
  start_date: "", status: "scheduled",
};

const SummaryCard = ({ icon, label, value, color }) => (
  <div
    style={{
      flex: 1,
      minWidth: "160px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: `${color}1a`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "13px", color: "#701366", opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#701366" }}>{value}</div>
    </div>
  </div>
);

/* ── Add Class Modal ──
   Reference data (teachers/languages/levels) is shared via the same
   cached hooks used elsewhere in the app, instead of each modal firing
   its own independent fetch every time it opens. ── */
const AddClassModal = ({ onClose, onCreated }) => {
  const [form, setForm]   = useState(emptyForm);
  const { teachers: allTeachers } = useTeachers("", "All");
  const { languages }             = useLanguages();
  const { levels }                = useLevels();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const nameTouched = useRef(false);
  const [suggestingName, setSuggestingName] = useState(false);

  useEffect(() => {
    if (nameTouched.current) return;
    if (!form.language || !form.level || !form.teacher) return;

    let cancelled = false;
    setSuggestingName(true);
    apiFetch(
      `/academic/classes/suggest_name/?language=${form.language}&level=${form.level}&teacher=${form.teacher}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && !nameTouched.current && data?.name) {
          setForm((prev) => ({ ...prev, name: data.name }));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSuggestingName(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.language, form.level, form.teacher]);

  const filteredTeachers = form.language
    ? allTeachers.filter((t) => String(t.language?.id) === String(form.language))
    : allTeachers;

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleNameChange = (e) => {
    nameTouched.current = true;
    setForm((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleLanguageChange = (e) => {
    setForm((prev) => ({ ...prev, language: e.target.value, teacher: "" }));
  };

  const handleSave = async () => {
    if (!form.name)     { setError("Please enter a class name."); return; }
    if (!form.language) { setError("Please select a language."); return; }
    if (!form.level)    { setError("Please select a level."); return; }
    if (!form.teacher)  { setError("Please select a teacher."); return; }

    setError(null);
    setSaving(true);

    try {
      const res = await apiFetch("/academic/classes/", {
        method: "POST",
        body: {
          name:       form.name,
          language:   Number(form.language),
          level:      Number(form.level),
          teacher:    Number(form.teacher),
          status:     form.status,
          ...(form.start_date ? { start_date: form.start_date } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }

      onCreated && onCreated();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save class.");
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(112,19,102,0.18)", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", margin: 0 }}>Add New Class</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", color: "#701366", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "18px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

          <Field label={`Class Name ${suggestingName ? "(suggesting…)" : ""}`} full>
            <input
              style={inp}
              value={form.name}
              onChange={handleNameChange}
              placeholder={
                form.language && form.level && form.teacher
                  ? "Auto-suggested — edit if you'd like"
                  : "Select language, level & teacher for a suggestion"
              }
            />
          </Field>

          <Field label="Language">
            <select style={sel} value={form.language} onChange={handleLanguageChange}>
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.language_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Level">
            <select style={sel} value={form.level} onChange={handle("level")}>
              <option value="">Select level</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>{lvl.level_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Teacher">
            <select
              style={{ ...sel, opacity: !form.language ? 0.5 : 1, cursor: !form.language ? "not-allowed" : "pointer" }}
              value={form.teacher}
              onChange={handle("teacher")}
              disabled={!form.language}
            >
              <option value="">
                {!form.language
                  ? "Select a language first"
                  : filteredTeachers.length === 0
                    ? "No teachers for this language"
                    : "Select a teacher"}
              </option>
              {filteredTeachers.map((t) => {
                const p = t.employee?.person ?? {};
                return (
                  <option key={t.employee?.person_id} value={t.employee?.person_id}>
                    {p.first_name} {p.last_name}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Academic Year">
            <input style={{ ...inp, background: "#f8f4f8", color: "#701366", opacity: 0.7, cursor: "not-allowed" }} value={currentYear} readOnly disabled />
          </Field>

          <Field label="Status">
            <select style={sel} value={form.status} onChange={handle("status")}>
              <option value="scheduled">Scheduled</option>
            </select>
          </Field>

          <Field label="Start Date (optional)">
            <input type="date" style={inp} value={form.start_date} onChange={handle("start_date")} />
          </Field>

        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#701366"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#e2d0e2"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: saving ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: saving ? "not-allowed" : "pointer", fontWeight: "600" }}
            onMouseEnter={(e) => { if (!saving) e.target.style.background = "#5a0f52"; }}
            onMouseLeave={(e) => { if (!saving) e.target.style.background = "#701366"; }}
          >
            {saving ? "Saving..." : "Save Class"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Class Modal ──
   Same shape as AddClassModal, but pre-filled from an existing class and
   PATCHes instead of POSTs. The Status dropdown only offers the
   transitions the backend actually allows from the current status
   (mirrors change_class_status in services.py), so the user can't pick
   something that will just bounce back as a validation error.

   The row object passed in from the table only carries display fields
   (language_name/level_name/teacher_name), not the raw FK ids the form
   selects need. So on open we re-fetch the single class from the detail
   endpoint and merge in whatever ids come back, falling back to the
   row's own fields if a value is already an id (e.g. if the list
   endpoint is later updated to include ids directly). ── */
const STATUS_TRANSITIONS = {
  scheduled: ["scheduled", "active", "cancelled"],
  active:    ["active", "completed", "cancelled"],
  completed: ["completed", "active"],
  cancelled: ["cancelled"], // terminal
};

const STATUS_LABELS = {
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const EditClassModal = ({ classItem, onClose, onUpdated }) => {
  const currentStatus = (classItem?.status ?? "scheduled").toLowerCase();

  const [form, setForm] = useState({
    name:       classItem?.name ?? "",
    language:   classItem?.language ?? "",
    level:      classItem?.level ?? "",
    teacher:    classItem?.teacher ?? "",
    start_date: classItem?.start_date ?? "",
    status:     currentStatus,
  });
  const { teachers: allTeachers } = useTeachers("", "All");
  const { languages }             = useLanguages();
  const { levels }                = useLevels();
  const [saving, setSaving]       = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError]         = useState(null);

  // Safety net: the table row may only carry *_name display fields, not
  // the raw ids these selects are keyed on. Pull the full record so the
  // selects open pre-filled instead of blank.
  useEffect(() => {
    if (!classItem?.id) return;
    let cancelled = false;
    setLoadingDetail(true);
    apiFetch(`/academic/classes/${classItem.id}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setForm((prev) => ({
          ...prev,
          name:       data.name ?? prev.name,
          language:   data.language ?? prev.language,
          level:      data.level ?? prev.level,
          teacher:    data.teacher ?? prev.teacher,
          start_date: data.start_date ?? prev.start_date,
          status:     (data.status ?? prev.status ?? "scheduled").toLowerCase(),
        }));
      })
      .catch((err) => console.error("Failed to fetch class detail:", err))
      .finally(() => { if (!cancelled) setLoadingDetail(false); });

    return () => { cancelled = true; };
  }, [classItem?.id]);

  const filteredTeachers = form.language
    ? allTeachers.filter((t) => String(t.language?.id) === String(form.language))
    : allTeachers;

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLanguageChange = (e) => {
    setForm((prev) => ({ ...prev, language: e.target.value, teacher: "" }));
  };

  const isCancelled = (form.status ?? "").toLowerCase() === "cancelled";
  const allowedStatuses = STATUS_TRANSITIONS[currentStatus] ?? [currentStatus];

  const handleSave = async () => {
    if (!form.name)     { setError("Please enter a class name."); return; }
    if (!form.language) { setError("Please select a language."); return; }
    if (!form.level)    { setError("Please select a level."); return; }
    if (!form.teacher)  { setError("Please select a teacher."); return; }

    setError(null);
    setSaving(true);

    try {
      const res = await apiFetch(`/academic/classes/${classItem.id}/`, {
        method: "PATCH",
        body: {
          name:       form.name,
          language:   Number(form.language),
          level:      Number(form.level),
          teacher:    Number(form.teacher),
          status:     form.status,
          ...(form.start_date ? { start_date: form.start_date } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update class.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(112,19,102,0.18)", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", margin: 0 }}>Edit Class</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", color: "#701366", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loadingDetail && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#701366", opacity: 0.6, fontSize: "13px", marginBottom: "18px" }}>
            <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
            Loading class details...
          </div>
        )}

        {isCancelled && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fdecea", color: "#c92c2c", fontSize: "13px", border: "1px solid #f8c9c9", marginBottom: "18px" }}>
            This class is cancelled and can no longer change status. Other fields can still be edited.
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "18px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

          <Field label="Class Name" full>
            <input style={inp} value={form.name} onChange={handle("name")} placeholder="e.g. Class A" />
          </Field>

          <Field label="Language">
            <select style={sel} value={form.language} onChange={handleLanguageChange}>
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.language_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Level">
            <select style={sel} value={form.level} onChange={handle("level")}>
              <option value="">Select level</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>{lvl.level_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Teacher">
            <select
              style={{ ...sel, opacity: !form.language ? 0.5 : 1, cursor: !form.language ? "not-allowed" : "pointer" }}
              value={form.teacher}
              onChange={handle("teacher")}
              disabled={!form.language}
            >
              <option value="">
                {!form.language
                  ? "Select a language first"
                  : filteredTeachers.length === 0
                    ? "No teachers for this language"
                    : "Select a teacher"}
              </option>
              {filteredTeachers.map((t) => {
                const p = t.employee?.person ?? {};
                return (
                  <option key={t.employee?.person_id} value={t.employee?.person_id}>
                    {p.first_name} {p.last_name}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Status">
            <select
              style={{ ...sel, opacity: isCancelled ? 0.5 : 1, cursor: isCancelled ? "not-allowed" : "pointer" }}
              value={form.status}
              onChange={handle("status")}
              disabled={isCancelled}
            >
              {allowedStatuses.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>

          <Field label="Start Date">
            <input type="date" style={inp} value={form.start_date ?? ""} onChange={handle("start_date")} />
          </Field>

        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#701366"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#e2d0e2"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: saving ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: saving ? "not-allowed" : "pointer", fontWeight: "600" }}
            onMouseEnter={(e) => { if (!saving) e.target.style.background = "#5a0f52"; }}
            onMouseLeave={(e) => { if (!saving) e.target.style.background = "#701366"; }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Classes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Debounce the search that actually drives the query, same pattern as
  // Teachers/Employees — input stays responsive, network calls don't fire
  // on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { classes, loading, error } = useClasses(debouncedSearch, filter);

  // Summary counts always reflect the FULL unfiltered list, independent of
  // whatever search/status filter is applied to the table — this is its
  // own cached query (empty search/filter), so it doesn't get invalidated
  // or reshaped by the filtered view above.
  const { classes: allClasses } = useClasses("", "All");

  const classTabs = [
    { name: "Classes", path: "/Classes" },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language", path: "/Languages" },
    { name: "Positions", path: "/Positions" },
  ];

  const STATUS_FILTER_OPTIONS = ["Active", "Scheduled", "Completed", "Cancelled"];

  // Reset to page 1 when search/filter changes (derived during render, not in an effect)
  const currentKey = `${debouncedSearch}|${filter}`;
  const [prevKey, setPrevKey] = useState(currentKey);
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    if (page !== 1) setPage(1);
  }

  const totalCount = allClasses.length;
  const statusCount = (s) => allClasses.filter((c) => (c.status ?? "").toLowerCase() === s).length;
  const activeCount    = statusCount("active");
  const scheduledCount = statusCount("scheduled");
  const completedCount = statusCount("completed");
  const cancelledCount = statusCount("cancelled");

  const totalPages = Math.max(1, Math.ceil(classes.length / PAGE_SIZE));
  const paginated = classes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  // Any create/update makes both the filtered list and the summary stale —
  // this invalidates every cached ["classes", ...] query in one call so
  // both refetch fresh data instead of showing stale counts/rows.
  const refreshClasses = () => queryClient.invalidateQueries({ queryKey: ["classes"] });

  const pageBtn = (active) => ({
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #701366",
    background: active ? "#701366" : "white",
    color: active ? "white" : "#701366",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  });

  const iconBtn = {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #701366",
    background: "white",
    color: "#701366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  };

  const actionBtn = {
    padding: "6px",
    borderRadius: "4px",
    border: "none",
    background: "none",
    color: "#701366",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s, transform 0.15s",
    flexShrink: 0,
  };

  const actionHover = (e) => {
    e.currentTarget.style.background = "#701366";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.transform = "scale(1.1)";
  };
  const actionLeave = (e) => {
    e.currentTarget.style.background = "none";
    e.currentTarget.style.color = "#701366";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <DashboardLayout>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingTop: "0px",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: "4px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Classes
          </h1>
          <p style={{ fontSize: "14px", color: "#701366", opacity: 0.55, margin: "4px 0 0" }}>
            Manage classes, languages, and schedules
          </p>
        </div>

        {/* Summary — one card per real status, plus total */}
        <section style={{ display: "flex", gap: "16px", marginTop: "0px", flexWrap: "wrap" }}>
          <SummaryCard icon={<BookOpen size={22} />} label="Total Classes" value={totalCount} color="#701366" />
          <SummaryCard icon={<CheckCircle2 size={22} />} label="Active" value={activeCount} color="#1a7f4b" />
          <SummaryCard icon={<Clock size={22} />} label="Scheduled" value={scheduledCount} color="#1d4ed8" />
          <SummaryCard icon={<Flag size={22} />} label="Completed" value={completedCount} color="#7c3aed" />
          <SummaryCard icon={<XCircle size={22} />} label="Cancelled" value={cancelledCount} color="#c92c2c" />
        </section>

        {/* Tabs + Search + Add */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={classTabs} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Searchbar
              placeholder="Search by name, language, teacher..."
              filterOptions={STATUS_FILTER_OPTIONS}
              showAdd={false}
              onSearchChange={(val) => setSearch(val)}
              onFilterChange={(val) => setFilter(val)}
            />
            <button
              onClick={() => setShowAddModal(true)}
              aria-label="Add Class"
              style={{
                width: "38px", height: "38px", flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: "10px", background: "#701366", color: "white",
                border: "2px solid #701366", cursor: "pointer",
                transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 8px rgba(112,19,102,.13)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(112,19,102,.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(112,19,102,.13)"; }}
            >
              <Plus size={18} />
            </button>
          </div>
        </section>

        {/* Table */}
        <div
          style={{
            width: "100%",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", textAlign: "left", width: "20%" }}>Name</th>
                <th style={{ ...thStyle, width: "16%" }}>Language</th>
                <th style={{ ...thStyle, width: "12%" }}>Level</th>
                <th style={{ ...thStyle, width: "18%" }}>Teacher</th>
                <th style={{ ...thStyle, width: "14%" }}>Start Date</th>
                <th style={{ ...thStyle, width: "12%" }}>Status</th>
                <th style={{ ...thStyle, width: "8%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading classes...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No classes found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginated.map((cls) => {
                  const status = (cls.status ?? "").toLowerCase();
                  return (
                    <tr
                      key={cls.id}
                      style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fffafe")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <td style={{ ...tdStyle, paddingLeft: "20px", textAlign: "left" }}>{cls.name || "---"}</td>
                      <td style={tdStyle}>{cls.language_name || "---"}</td>
                      <td style={tdStyle}>{cls.level_name || "---"}</td>
                      <td style={tdStyle}>{cls.teacher_name || "---"}</td>
                      <td style={tdStyle}>{cls.start_date || "---"}</td>
                      <td style={tdStyle}>
                        <span style={statusStyle(status)}>{status || "---"}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <button
                            aria-label="Edit"
                            onClick={() => setEditingClass(cls)}
                            style={actionBtn}
                            onMouseEnter={actionHover}
                            onMouseLeave={actionLeave}
                          >
                            <SquarePen style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                          </button>
                          <button
                            aria-label="More"
                            onClick={() => navigate("/Classe_information", { state: { cls } })}
                            style={actionBtn}
                            onMouseEnter={actionHover}
                            onMouseLeave={actionLeave}
                          >
                            <LayoutGrid style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && classes.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
              color: "#701366",
              marginTop: "-8px",
            }}
          >
            <span style={{ opacity: 0.6 }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, classes.length)} of {classes.length}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                style={{ ...iconBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
                onMouseEnter={(e) => {
                  if (page !== 1) {
                    e.currentTarget.style.background = "#701366";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#701366";
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} style={{ padding: "0 4px", opacity: 0.5 }}>
                      …
                    </span>
                  ) : (
                    <button key={p} onClick={() => goTo(p)} style={pageBtn(p === page)}>
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                style={{
                  ...iconBtn,
                  opacity: page === totalPages ? 0.4 : 1,
                  cursor: page === totalPages ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages) {
                    e.currentTarget.style.background = "#701366";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#701366";
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddClassModal
          onClose={() => setShowAddModal(false)}
          onCreated={refreshClasses}
        />
      )}

      {editingClass && (
        <EditClassModal
          classItem={editingClass}
          onClose={() => setEditingClass(null)}
          onUpdated={refreshClasses}
        />
      )}
    </DashboardLayout>
  );
}