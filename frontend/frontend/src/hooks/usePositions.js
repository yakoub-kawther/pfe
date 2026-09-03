import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export function usePositions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["positions"],
    queryFn: () => apiFetch("/academic/positions/").then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5 min — rarely changes
  });
  const positions = Array.isArray(data) ? data : (data?.results ?? []);
  return { positions, loading: isLoading, error };
}