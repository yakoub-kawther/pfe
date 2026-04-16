import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Plus, ChevronDown } from "lucide-react";

const Searchbar = ({
  placeholder = "Search...",
  filterOptions = [],
  addPath = "/",
  showAdd = true,
  onSearchChange,
  onFilterChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setDropdownOpen(false);
    if (onFilterChange) onFilterChange(option);
  };

  return (
    <div className="flex items-center justify-end w-full flex-wrap gap-3">
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#701366] pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full text-center border border-[#701366] bg-white text-sm w-64 h-9 outline-none focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Filter Button with Dropdown */}
        {filterOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Filter"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#701366] bg-white text-[#701366] hover:bg-[#701366] hover:text-white transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#f0c0f0] rounded-xl shadow-md z-50 overflow-hidden">
                {["All", ...filterOptions].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(option)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedFilter === option
                        ? "bg-[#701366] text-white"
                        : "text-[#701366] hover:bg-[#f8e0f8]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Button */}
        {showAdd && (
          <Link
            to={addPath}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#701366] text-white hover:bg-white hover:text-[#701366] hover:border-[#701366] border border-[#701366] transition-all hover:scale-110"
          >
            <Plus className="w-4 h-4" />
          </Link>
        )}

      </div>
    </div>
  );
};

export default Searchbar;