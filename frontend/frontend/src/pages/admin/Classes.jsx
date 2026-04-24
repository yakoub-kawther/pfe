// pages/Classes.jsx

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Searchbar from "../../components/Searchbar";

const BASE_URL = 'http://127.0.0.1:8000/api/academic';

export default function Classes() {
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [search,  setSearch]  = useState('');
    const [filter,  setFilter]  = useState('All');

    const classTabs = [
        { name: 'Classes',    path: '/Classes'    },
        { name: 'Classrooms', path: '/Classrooms' },
        { name: 'Language',   path: '/Languages'  },
    ];

    const statusStyles = {
        active:    'bg-green-100 text-green-600',
        inactive:  'bg-red-100   text-red-600',
        completed: 'bg-blue-100  text-blue-600',
        cancelled: 'bg-gray-100  text-gray-600',
    };

    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search)           params.append('search', search);
            if (filter !== 'All') params.append('status', filter.toLowerCase());
            const url = `${BASE_URL}/classes/?${params.toString()}`;
            console.log('Fetching:', url);

            const res  = await fetch(`${BASE_URL}/classes/?${params}`);
            if (!res.ok) throw new Error('Failed to fetch classes');
            const data = await res.json();
            setClasses(data.results ?? data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, filter]);

    useEffect(() => {
        const delay = setTimeout(fetchClasses, 300);
        return () => clearTimeout(delay);
    }, [fetchClasses]);

    function renderBody() {
        if (loading) return (
            <tr>
                <td colSpan={8} className="text-center py-10 text-[#701366] opacity-50">
                    Loading...
                </td>
            </tr>
        );

        if (error) return (
            <tr>
                <td colSpan={8} className="text-center py-10 text-red-400">
                    {error}
                </td>
            </tr>
        );

        if (classes.length === 0) return (
            <tr>
                <td colSpan={8} className="text-center py-10 text-[#701366] opacity-50">
                    No classes found.
                </td>
            </tr>
        );

        return classes.map((cls) => (
            <tr key={cls.id} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                <td className="py-3 text-[#701366] font-Inter whitespace-nowrap" style={{ paddingLeft: '50px' }}>
                    {cls.name}
                </td>
                <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {cls.language?.language_name ?? '—'}
                </td>
                <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {cls.level?.level_name ?? '—'}
                </td>
                <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {cls.teacher?.full_name ?? '—'}
                </td>
                <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {cls.students_count ?? '—'}
                </td>
                <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {cls.start_date}
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[cls.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </span>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                    <button
                        onClick={() => navigate('/Classes_information', { state: { cls } })}
                        className="p-1.5 rounded-sm text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </td>
            </tr>
        ));
    }

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

                {/* Header */}
                <div className="flex items-center justify-between mt-6">
                    <h1 className="text-xl sm:text-2xl text-[#701366]">Classes</h1>
                </div>

                {/* Tabs + Search */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Tabs tabs={classTabs} />
                    <div className="flex items-center gap-3">
                        <Searchbar
                            placeholder="Search by name, language, teacher..."
                            filterOptions={['Active', 'Inactive']}
                            addPath="/Add_classe"
                            showAdd={true}
                            onSearchChange={(val) => setSearch(val)}
                            onFilterChange={(val) => setFilter(val)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="w-full bg-white rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full min-w-160 text-sm">
                        <thead>
                            <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                                <th className="py-3 whitespace-nowrap" style={{ paddingLeft: '50px' }}>Name</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Language</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Level</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Teacher</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Students</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Start Date</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Status</th>
                                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f8e0f8]">
                            {renderBody()}
                        </tbody>
                    </table>
                </div>

            </div>
        </DashboardLayout>
    );
}