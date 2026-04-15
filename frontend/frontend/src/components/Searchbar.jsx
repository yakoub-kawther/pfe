import React from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Plus } from "lucide-react";

const Searchbar = ({ onAdd = true}) => {
  return (
    <div className="flex items-center justify-end w-full flex-wrap gap-3">

      {/* RIGHT SIDE GROUP */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#701366] pointer-events-none" />
          <input
            type="text"
            id="searchInput"
            placeholder="Search by Name,Phone .."
            className="pl-9 pr-4 py-2 rounded-full text-center border border-[#701366] bg-white text-sm  w-64 h-9   outline-none focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Filter Button */}
        
        <button
          onClick={onAdd}
          aria-label="Filter"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#701366] bg-white text-[#701366] hover:bg-[#701366] hover:text-white transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Add Button */}
         {onAdd && (
        <Link
          to="/Add_student"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#701366] text-white hover:bg-white hover:text-[#701366] hover:border-[#701366] border border-[#701366] transition-all hover:scale-110">
          <Plus className="w-4 h-4" />
        </Link> )}

      </div>
    </div>
  );
};

export default Searchbar;