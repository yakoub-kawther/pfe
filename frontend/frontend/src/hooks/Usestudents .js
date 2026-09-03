import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export function useStudents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await apiFetch("/persons/students/");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    staleTime: 30 * 1000, // 30s — same as teachers list
  });

  return { students: data ?? [], loading: isLoading, error: error?.message ?? null };
}