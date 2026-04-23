import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Plus } from "lucide-react";

const Searchbar = ({
  placeholder = "Search...",
  filterOptions = [],
  addPath = "/",
  showAdd = true,
  onSearchChange,
  onFilterChange,
}) => {
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const navigate = useNavigate();
  
  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setDropdownOpen(false);
    if (onFilterChange) onFilterChange(option);
  };

  const iconBtn = {
    width: "36px", height: "36px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "12px", border: "1px solid #701366",
    background: "white", color: "#701366",
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Search style={{ position: "absolute", left: "12px", width: "16px", height: "16px", color: "#701366", pointerEvents: "none", flexShrink: 0 }} />
          <input
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              paddingLeft: "36px", paddingRight: "16px",
              height: "36px", width: "256px",
              borderRadius: "9999px", border: "1px solid #701366",
              background: "white", fontSize: "14px",
              outline: "none", boxSizing: "border-box",
              flexShrink: 0, textAlign: "center",
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px #f3e8ff"}
            onBlur={e  => e.target.style.boxShadow = "none"}
          />
        </div>

        {/* Filter */}
        {filterOptions.length > 0 && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              aria-label="Filter"
              style={iconBtn}
              onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >
              <SlidersHorizontal style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: "176px", background: "white",
                border: "1px solid #f0c0f0", borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                zIndex: 50, overflow: "hidden",
              }}>
                {["All", ...filterOptions].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(option)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "8px 16px", fontSize: "14px",
                      border: "none", cursor: "pointer",
                      background: selectedFilter === option ? "#701366" : "white",
                      color:      selectedFilter === option ? "white"    : "#701366",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (selectedFilter !== option) e.currentTarget.style.background = "#f8e0f8"; }}
                    onMouseLeave={e => { if (selectedFilter !== option) e.currentTarget.style.background = "white"; }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add */}
        {showAdd && (
          <Link
            to={addPath}
            style={{
              ...iconBtn,
              background: "#701366", color: "white",
              borderRadius: "12px", textDecoration: "none",
              transition: "background 0.15s, color 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          </Link>
        )}

      </div>
    </div>
  );
};

export default Searchbar;