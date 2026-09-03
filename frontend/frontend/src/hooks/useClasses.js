import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

function buildParams(search, filter) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (filter && filter !== "All") params.set("status", filter.toLowerCase());
  return params.toString();
}

// Pass ("", "All") to get the full unfiltered list (used for summary counts) —
// it's cached under its own key, separate from any filtered/searched view.
export function useClasses(search = "", filter = "All") {
  const qs = buildParams(search, filter);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["classes", qs],
    queryFn: async () => {
      const res = await apiFetch(`/academic/classes/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); // newest-created on top
      return list;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 1000,
  });

  return {
    classes: data ?? [],
    loading: isLoading,
    fetching: isFetching,
    error: error?.message ?? null,
  };
}