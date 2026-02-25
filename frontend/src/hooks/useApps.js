import { useQuery } from "@tanstack/react-query";
import { fetchApps, fetchApp, fetchCompliance } from "../lib/api";

export function useApps(filters = {}) {
  return useQuery({
    queryKey: ["apps", filters],
    queryFn: () => fetchApps(filters),
  });
}

export function useApp(id) {
  return useQuery({
    queryKey: ["app", id],
    queryFn: () => fetchApp(id),
    enabled: !!id,
  });
}

export function useCompliance() {
  return useQuery({
    queryKey: ["compliance"],
    queryFn: fetchCompliance,
  });
}
