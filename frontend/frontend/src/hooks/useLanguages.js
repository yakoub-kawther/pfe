import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export function useLanguages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["languages"],
    queryFn: () => apiFetch("/academic/languages/").then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5 min — rarely changes
  });
  return { languages: data ?? [], loading: isLoading, error };
}