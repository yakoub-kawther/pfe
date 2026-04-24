import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";

const BASE_URL = 'http://127.0.0.1:8000/api/academic';

export default function Classrooms() {
    const classTabs = [
        { name: "Classes",    path: "/Classes"    },
        { name: "Classrooms", path: "/Classrooms" },
    ];

    const [classrooms, setClassrooms] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [search,     setSearch]     = useState('');

    const fetchClassrooms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search.trim()) params.append('search', search.trim());

            const res  = await fetch(`${BASE_URL}/classrooms/?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch classrooms');
            const data = await res.json();
            setClassrooms(data.results ?? data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const delay = setTimeout(fetchClassrooms, 300);
        return () => clearTimeout(delay);
    }, [fetchClassrooms]);

    function renderBody() {
        if (loading) return (
            <tr>
                <td colSpan={2} className="py-8 text-center text-[#701366] opacity-50">
                    Loading...
                </td>
            </tr>
        );

        if (error) return (
            <tr>
                <td colSpan={2} className="py-8 text-center text-red-400">
                    {error}
                </td>
            </tr>
        );

        if (classrooms.length === 0) return (
            <tr>
                <td colSpan={2} className="py-8 text-center text-[#701366] opacity-50">
                    No classrooms found.
                </td>
            </tr>
        );

        return classrooms.map((room) => (
            <tr key={room.id} className="hover:bg-[#fffafe] transition h-12">
                <td className="py-3 text-[#701366]" style={{ paddingLeft: '50px' }}>
                    {room.name}
                </td>
                <td className="px-4 py-3 text-[#701366]">
                    {room.capacity}
                </td>
            </tr>
        ));
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-6">

                {/* Header */}
                <h2 className="text-2xl mt-6 text-[#701366]">Classrooms</h2>

                {/* Tabs + Searchbar */}
                <div className="flex items-center justify-between">
                    <Tabs tabs={classTabs} />
                    <Searchbar
                        placeholder="Search by name or capacity..."
                        addPath="/Add-Classrooms"
                        showAdd={true}
                        onSearchChange={(val) => setSearch(val)}
                    />
                </div>

                {/* Table */}
                <div className="w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                                <th className="py-3" style={{ paddingLeft: '50px' }}>Name</th>
                                <th className="px-4 py-3">Capacity</th>
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