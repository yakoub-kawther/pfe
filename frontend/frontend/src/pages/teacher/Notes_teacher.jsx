import { useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";

const levelColors = {
  A1: { bg: "#e0f2fe", color: "#0369a1" },
  A2: { bg: "#dbeafe", color: "#1d4ed8" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fae8ff", color: "#a21caf" },
  C1: { bg: "#fce7f3", color: "#be185d" },
  C2: { bg: "#ffe4e6", color: "#be123c" },
};

export default function Notes_teacher() {
  const navigate = useNavigate();
  const [search,  setSearch]  = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    apiFetch("/account/me/")
      .then(r => r.json())
      .then(account => {
        const teacherId = account?.person_id ?? null;
        if (!teacherId) throw new Error("Could not resolve teacher ID.");
        return apiFetch(`/academic/classes/?teacher=${teacherId}`);
      })
      .then(r => r.json())
      .then(data => setClasses(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(err => setError(err.message || "Failed to load classes."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = classes.filter(c =>
    (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.language?.language_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>Manage Results</h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>Select a class to manage student notes</p>
          </div>
          <div style={{ flex: 1, maxWidth: "380px", minWidth: "200px" }}>
            <Searchbar placeholder="Search by class or language..." showAdd={false} onSearchChange={val => setSearch(val)} />
          </div>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}

        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Class",    width: "25%", pl: "28px" },
                  { label: "Language", width: "22%" },
                  { label: "Level",    width: "15%" },
                  { label: "Status",   width: "18%" },
                  { label: "Start",    width: "20%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "12px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>No classes found.</td></tr>
              ) : filtered.map(cls => {
                const levelName = cls.level?.level_name ?? "";
                const lc = levelColors[levelName] ?? { bg: "#f3f4f6", color: "#374151" };
                const status = (cls.status ?? "").toLowerCase();
                return (
                  <tr key={cls.id}
                    onClick={() => navigate("/Notes_students_teacher", { state: { cls } })}
                    style={{ height: "56px", borderBottom: "1px solid #faeaf9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 500, color: "#701366" }}>{cls.name}</td>
                    <td style={{ padding: "0 16px", fontSize: "14px", color: "#6b2163" }}>{cls.language?.language_name ?? "—"}</td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ background: lc.bg, color: lc.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {levelName || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600, background: status === "active" ? "#dcfce7" : "#fee2e2", color: status === "active" ? "#16a34a" : "#dc2626" }}>
                        ● {status}
                      </span>
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "13px", color: "#6b2163" }}>{cls.start_date || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Teacher_layout>
  );
}