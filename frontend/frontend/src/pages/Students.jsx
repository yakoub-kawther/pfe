import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import Searchbar from "../components/Searchbar.jsx";
import Table from "../components/Table.jsx";

const Students = () => {

 const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pt-6">

        {/* Search */}
        <section className="flex items-center gap-4" style={{ marginTop: "30px" }}>         
         <h1 className="text-2xl text-[#701366] text-left whitespace-nowrap"> Students List</h1>
          <Searchbar onAdd={() => navigate("/Add_student")} />
        </section>

        {/* Table */}
        <section>
          <Table />
        </section>

      </div>

    </DashboardLayout>
  );
};

export default Students;