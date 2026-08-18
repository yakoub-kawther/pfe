import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import Searchbar from "../../components/Searchbar.jsx";
import Table from "../../components/Table.jsx";
import { Users, UserCheck, UserX } from "lucide-react";
import { apiFetch } from "../../services/api";

const SummaryCard = ({ icon, label, value, color, background }) => (
  <div style={{
    flex: 1,
    background: background || "white",
    borderRadius: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }}>
    <div style={{
      width: "44px", height: "44px", borderRadius: "12px",
      background: `${color}1a`, color, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "13px", color: "#701366", opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#701366" }}>{value}</div>
    </div>
  </div>
);

const Students = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/persons/students/")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCount    = students.length;
  const activeCount   = students.filter(s => (s.status ?? "active").toLowerCase() === "active").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>


        {/* Page Title */}
<div style={{ marginBottom: "4px" }}>
  <h1 style={{
    fontSize: "32px",
    fontWeight: 700,
    color: "#701366",
    margin: 0,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  }}>
    Students
  </h1>
  <p style={{
    fontSize: "14px",
    color: "#701366",
    opacity: 0.55,
    margin: "4px 0 0",
  }}>
    Manage enrolled students, attendance, and language progress
  </p>
</div>
        {/* Summary */}
        <section style={{ display: "flex", gap: "16px", marginTop: "0px" }}>
          <SummaryCard icon={<Users size={22} />}     label="Total Students"    value={totalCount}    color="#701366" />
          <SummaryCard icon={<UserCheck size={22} />} label="Active Students"   value={activeCount}   color="#1a7f4b" />
          <SummaryCard icon={<UserX size={22} />}      label="Inactive Students" value={inactiveCount} color="#c92c2c" />
        </section>

        {/* Search */}
        <section className="flex items-center gap-4">
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#701366", margin: 0, flexShrink: 0 }}>
            Students List</h2>
          <Searchbar
            placeholder="Search by Name, Phone..."
            filterOptions={["Active", "Inactive", "Graduated"]}
            addPath="/Add_student"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </section>

        {/* Table */}
        <section>
          <Table students={students} loading={loading} search={search} filter={filter} role="admin" />
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Students;