import React, { useState } from "react";
import Secretary_layout from "../../layouts/Secretary_layout";
import Tabs from "../../components/Tabs";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Searchbar from "../../components/Searchbar";

export default function Languages() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const classTabs = [
    { name: "Classes",    path: "/Classes_secretary"    },
    { name: "Classrooms", path: "/Classrooms_secretary" },
    { name: "Language",   path: "/Languages_secretary"  },
  ];

  const [languagesData, setLanguagesData] = useState([
    { id: "LNG-001", language: "English", shortcut: "EN" },
    { id: "LNG-002", language: "French",  shortcut: "FR" },
    { id: "LNG-003", language: "Arabic",  shortcut: "AR" },
    { id: "LNG-004", language: "Spanish", shortcut: "ES" },
    { id: "LNG-005", language: "Italian", shortcut: "IT" },
  ]);

  const filteredLanguages = languagesData.filter((lang) => {
    const q = search.toLowerCase();
    return (
      !q ||
      lang.id.toLowerCase().includes(q)       ||
      lang.language.toLowerCase().includes(q) ||
      lang.shortcut.toLowerCase().includes(q)
    );
  });

  return (
    <Secretary_layout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-xl sm:text-2xl text-[#701366]">Language</h1>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs tabs={classTabs} />
          <div className="flex items-center gap-3">
            <Searchbar
              placeholder="Search by id, language, shortcut..."
              addPath="/Add_language_secretary"
              showAdd={true}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-100 text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 pl-6 lg:pl-8 whitespace-nowrap" style={{ paddingLeft: "50px" }}>ID</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Language</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Shortcut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">
              {filteredLanguages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-[#701366] opacity-50">
                    No languages found.
                  </td>
                </tr>
              ) : (
                filteredLanguages.map((lang, idx) => (
                  <tr key={idx} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                    <td className="py-3 pl-6 lg:pl-8 text-[#701366] font-Inter whitespace-nowrap"style={{ paddingLeft: "50px" }}>{lang.id}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{lang.language}</td>
                    <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter bg-[#F8E0F8] text-[#701366]">
                        {lang.shortcut}
                      </span>
                    </td>
                   
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Secretary_layout>
  );
}