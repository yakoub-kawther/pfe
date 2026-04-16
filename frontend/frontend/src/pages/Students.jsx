import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import Searchbar from "../components/Searchbar.jsx";
import Table from "../components/Table.jsx";

const Students = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pt-6">

        {/* Search */}
        <section className="flex items-center gap-4" style={{ marginTop: "30px" }}>
          <h1 className="text-2xl text-[#701366] text-left whitespace-nowrap">Students List</h1>
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
          <Table search={search} filter={filter} />
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Students;