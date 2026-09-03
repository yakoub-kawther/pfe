import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export function useLevels() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["levels"],
    queryFn: () => apiFetch("/academic/levels/").then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // rarely changes, same as languages/positions
  });
  const levels = Array.isArray(data) ? data : (data?.results ?? []);
  return { levels, loading: isLoading, error };
}