import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export function useAccounts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch("/account/accounts/").then((res) => res.json()), // TODO: confirm this matches your urls.py path
    staleTime: 60 * 1000, // 1 min — changes more often than languages/positions
  });
  const accounts = Array.isArray(data) ? data : (data?.results ?? []);
  return { accounts, loading: isLoading, error };
}