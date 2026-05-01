import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import Searchbar from "../../components/Searchbar.jsx";
import Table from "../../components/Table.jsx";

const Students = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Search */}
        <section className="flex items-center gap-4" style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "24px", color: "#701366", margin: 0, flexShrink: 0 }}>
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

        {/* Table — pass search & filter as props if your Table supports it */}
        <section>
          <Table search={search} filter={filter} role="admin" />
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Students;