import { useQuery } from "@tanstack/react-query";
import type { Organization, Sport, County } from "@shared/schema";

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });
}

export function useSports() {
  return useQuery<Sport[]>({
    queryKey: ["/api/sports"],
  });
}

export function useCounties() {
  return useQuery<County[]>({
    queryKey: ["/api/counties"],
  });
}

export function useSubCounties(countyId: string) {
  return useQuery<any[]>({
    queryKey: [`/api/counties/${countyId}/sub-counties`],
    enabled: !!countyId,
  });
}

export function useWards(subCountyId: string) {
  return useQuery<any[]>({
    queryKey: [`/api/sub-counties/${subCountyId}/wards`],
    enabled: !!subCountyId,
  });
}
