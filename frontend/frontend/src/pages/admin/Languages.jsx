import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";
import { SquarePen, Loader2, X } from "lucide-react";
import { apiFetch } from "../../services/api";

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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e2d0e2",
  outline: "none",
  fontSize: "14px",
  color: "#701366",
  fontFamily: "Inter, sans-serif",
};

const labelStyle = {
  fontSize: "13px",
  color: "#6b7280",
  fontFamily: "Inter, sans-serif",
};

function EditLanguageModal({ lang, onClose, onSaved }) {
  const [languageName, setLanguageName] = useState(lang.language_name ?? "");
  const [shortcut, setShortcut]         = useState(lang.shortcut ?? "");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/academic/languages/${lang.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language_name: languageName, shortcut }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const updated = await res.json();
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Failed to save language.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: "16px", padding: "28px",
          width: "380px", maxWidth: "90vw", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#701366", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Edit Language
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "#701366", cursor: "pointer", padding: "4px", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Language</label>
            <input style={inputStyle} value={languageName} onChange={(e) => setLanguageName(e.target.value)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Shortcut</label>
            <input style={inputStyle} value={shortcut} onChange={(e) => setShortcut(e.target.value)} />
          </div>

          {error && <div style={{ color: "#dc2626", fontSize: "13px" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "9px 18px", borderRadius: "8px", border: "1px solid #701366",
                background: "white", color: "#701366", fontSize: "13px", fontWeight: 600,
                cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 18px", borderRadius: "8px", border: "none",
                background: "#701366", color: "white", fontSize: "13px", fontWeight: 600,
                cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {saving && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Languages() {
  const classTabs = [
    { name: "Classes", path: "/Classes" },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language", path: "/Languages" },
    { name: "Positions", path: "/Positions" },
  ];

  const [languages, setLanguages] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [editingLang, setEditingLang] = useState(null);

  const fetchLanguages = useCallback(async (searchVal) => {
    setLoading(true);
    setError(null);
    try {
      const qs = searchVal.trim() ? `?search=${encodeURIComponent(searchVal.trim())}` : "";
      const res = await apiFetch(`/academic/languages/${qs}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setLanguages(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load languages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchLanguages(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchLanguages]);

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

  const handleSaved = (updated) => {
    setLanguages((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    setEditingLang(null);
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
            Language
          </h1>
          <p style={{ fontSize: "14px", color: "#701366", opacity: 0.55, margin: "4px 0 0" }}>
            Manage languages and shortcuts
          </p>
        </div>

        {/* Tabs + Search */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={classTabs} />
          <Searchbar
            placeholder="Search by id, language, shortcut..."
            addPath="/Add_language"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
          />
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
                <th style={{ ...thStyle, paddingLeft: "24px", textAlign: "left", width: "25%" }}>ID</th>
                <th style={{ ...thStyle, textAlign: "left", width: "25%" }}>Language</th>
                <th style={{ ...thStyle, width: "25%" }}>Shortcut</th>
                <th style={{ ...thStyle, width: "25%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading languages...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && languages.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No languages found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                languages.map((lang) => (
                  <tr
                    key={lang.id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s", cursor: "pointer" }}
                    onClick={() => setEditingLang(lang)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fffafe")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "24px", textAlign: "left" }}>{lang.id}</td>
                    <td style={{ ...tdStyle, textAlign: "left" }}>{lang.language_name || "---"}</td>
                    <td style={tdStyle}>{lang.shortcut || "---"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <button
                          aria-label="Edit"
                          onClick={(e) => { e.stopPropagation(); setEditingLang(lang); }}
                          style={actionBtn}
                          onMouseEnter={actionHover}
                          onMouseLeave={actionLeave}
                        >
                          <SquarePen style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingLang && (
        <EditLanguageModal
          lang={editingLang}
          onClose={() => setEditingLang(null)}
          onSaved={handleSaved}
        />
      )}
    </DashboardLayout>
  );
}