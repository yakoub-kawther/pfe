import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

function buildParams(search, filter) {
  const params = new URLSearchParams();
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    if (q === "yes")      params.set("is_head_teacher", "true");
    else if (q === "no")  params.set("is_head_teacher", "false");
    else                  params.set("search", search.trim());
  }
  if (filter && filter !== "All") {
    params.set("employee__status", filter.toLowerCase());
  }
  return params.toString();
}

export function useTeachers(search, filter) {
  const qs = buildParams(search, filter);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["teachers", qs],
    queryFn: async () => {
      const res = await apiFetch(`/persons/teachers/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    // Keeps the previous result on screen while a new search/filter is
    // loading, instead of flashing a full "Loading..." state every time.
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s — teacher list changes more than reference data
  });

  return {
    teachers: data ?? [],
    loading: isLoading,   // true only on the very first load for this query key
    fetching: isFetching, // true during any refetch, including background ones
    error: error?.message ?? null,
  };
}