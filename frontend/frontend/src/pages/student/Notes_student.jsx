import { useState, useEffect } from "react";
import Student_layout from "../../layouts/Student_layout";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const levelColors = {
  A1: { bg: "#e0f2fe", color: "#0369a1" },
  A2: { bg: "#dbeafe", color: "#1d4ed8" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fae8ff", color: "#a21caf" },
  C1: { bg: "#fce7f3", color: "#be185d" },
  C2: { bg: "#ffe4e6", color: "#be123c" },
};

const extractLevel = (className = "") => {
  const match = className.match(/\b([ABC][12])\b/i);
  return match ? match[1].toUpperCase() : null;
};

// Safe fetch helper
const safeFetch = async (path) => {
  const res = await apiFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${path}\n${text.slice(0, 200)}`);
  }
  return res.json();
};

// Group flat notes list by inscription → one row per class
// Each note has: id, inscription, component ("oral"/"written"), mark, class_name, student_name
const groupByInscription = (notes) => {
  const map = {};
  for (const n of notes) {
    const key = n.inscription;
    if (!map[key]) {
      map[key] = {
        inscription_id: n.inscription,
        class_name:     n.class_name,
        level:          extractLevel(n.class_name),
        oral:           null,
        written:        null,
      };
    }
    const comp = n.component?.toLowerCase();
    if (comp === "oral")    map[key].oral    = n.mark;
    if (comp === "written") map[key].written = n.mark;
  }
  return Object.values(map);
};

const getAverage = (oral, written) => {
  const vals = [oral, written].filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

const ScoreCell = ({ val }) => (
  <td style={{ padding: "12px 16px", fontSize: "14px", color: val !== null && val !== undefined ? "#701366" : "#d1bbd0" }}>
    {val !== null && val !== undefined ? `${val}/100` : "—"}
  </td>
);

export default function Notes_student() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    safeFetch("/account/me/")
      .then(account => {
        const studentId = account?.person_id ?? null;
        if (!studentId) throw new Error("Could not resolve student ID.");
        return safeFetch(`/notes/student/?student_id=${studentId}`);
      })
      .then(data => setRows(groupByInscription(data)))
      .catch(err => setError(err.message || "Failed to load results."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r =>
    r.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#b48ab0", fontFamily: "Inter, sans-serif" }}>
        Loading...
      </div>
    </Student_layout>
  );

  if (error) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#dc2626", fontWeight: 500 }}>Failed to load results</p>
        <pre style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "pre-wrap", maxWidth: "600px", margin: "12px auto 0" }}>{error}</pre>
      </div>
    </Student_layout>
  );

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>My Results</h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
              Your grades across all enrolled classes
            </p>
          </div>
          <div style={{ flex: 1, maxWidth: "380px", minWidth: "200px" }}>
            <Searchbar
              placeholder="Search by class..."
              showAdd={false}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Class",    width: "22%", pl: "28px" },
                  { label: "Level",    width: "12%" },
                  { label: "Oral",     width: "16%" },
                  { label: "Written",  width: "16%" },
                  { label: "Average",  width: "16%" },
                  { label: "Result",   width: "18%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "12px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                    No results found.
                  </td>
                </tr>
              ) : filtered.map((row) => {
                const avg    = getAverage(row.oral, row.written);
                const passed = avg !== null ? Number(avg) >= 50 : null;
                const lc     = levelColors[row.level] || { bg: "#f3f4f6", color: "#374151" };

                return (
                  <tr key={row.inscription_id} style={{ height: "56px", borderBottom: "1px solid #faeaf9" }}>

                    {/* Class name */}
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 500, color: "#701366" }}>
                      {row.class_name || "—"}
                    </td>

                    {/* Level badge */}
                    <td style={{ padding: "12px 16px" }}>
                      {row.level ? (
                        <span style={{ background: lc.bg, color: lc.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          {row.level}
                        </span>
                      ) : <span style={{ color: "#d1bbd0" }}>—</span>}
                    </td>

                    {/* Oral */}
                    <ScoreCell val={row.oral} />

                    {/* Written */}
                    <ScoreCell val={row.written} />

                    {/* Average */}
                    <ScoreCell val={avg} />

                    {/* Result */}
                    <td style={{ padding: "12px 16px" }}>
                      {passed === null ? (
                        <span style={{ background: "#f3f4f6", color: "#6b7280", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          Pending
                        </span>
                      ) : passed ? (
                        <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          Pass
                        </span>
                      ) : (
                        <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          Fail
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Student_layout>
  );
}