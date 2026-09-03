import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

function buildParams(search, filter) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (filter && filter !== "All") params.set("status", filter.toLowerCase());
  return params.toString();
}

export function useEmployees(search, filter) {
  const qs = buildParams(search, filter);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["employees", qs],
    queryFn: async () => {
      const res = await apiFetch(`/persons/employees/non-teachers/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    placeholderData: keepPreviousData, // keep old results visible while a new search/filter loads
    staleTime: 30 * 1000, // 30s — same as teachers/students
  });

  return {
    employees: data ?? [],
    loading: isLoading,
    fetching: isFetching,
    error: error?.message ?? null,
  };
}