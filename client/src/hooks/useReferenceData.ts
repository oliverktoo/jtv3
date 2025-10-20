import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useOrganizations() {
  return useQuery({
    queryKey: ["/api/organizations"],
    queryFn: () => apiRequest("GET", "/api/organizations"),
  });
}

export function useSports() {
  return useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => apiRequest("GET", "/api/sports"),
  });
}

export function useCounties() {
  return useQuery({
    queryKey: ["/api/counties"],
    queryFn: () => apiRequest("GET", "/api/counties"),
  });
}

export function useSubCounties(countyId: string) {
  return useQuery({
    queryKey: ["/api/counties", countyId, "sub-counties"],
    queryFn: () => apiRequest("GET", `/api/counties/${countyId}/sub-counties`),
    enabled: !!countyId,
  });
}

export function useWards(subCountyId: string) {
  return useQuery({
    queryKey: ["/api/sub-counties", subCountyId, "wards"],
    queryFn: () => apiRequest("GET", `/api/sub-counties/${subCountyId}/wards`),
    enabled: !!subCountyId,
  });
}
