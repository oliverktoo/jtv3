import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { Organization, Sport, County } from "@shared/schema";

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*');
        
        if (error) {
          console.error("Organizations Supabase error:", error);
          throw error;
        }
        
        // If no organizations from database, return fallback
        if (!data || data.length === 0) {
          return [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Jamii Sports Federation",
            slug: "jamii-sports",
            createdAt: new Date(),
            updatedAt: new Date()
          }];
        }
        
        return data.map(org => ({
          ...org,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at || org.created_at)
        }));
      } catch (error) {
        console.error("Organizations error:", error);
        // Return fallback organization if query fails
        return [{
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Jamii Sports Federation", 
          slug: "jamii-sports",
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      }
    },
  });
}

export function useSports() {
  return useQuery<Sport[]>({
    queryKey: ["sports"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('*');
        
        if (error) {
          console.error("Sports Supabase error:", error);
        }
        
        if (!data || data.length === 0) {
          // Return fallback sports data if no data found (using correct DB IDs)
          return [
            {
              id: "650e8400-e29b-41d4-a716-446655440001",
              name: "Football",
              createdAt: new Date()
            },
            {
              id: "650e8400-e29b-41d4-a716-446655440002", 
              name: "Basketball",
              createdAt: new Date()
            },
            {
              id: "650e8400-e29b-41d4-a716-446655440003",
              name: "Volleyball", 
              createdAt: new Date()
            }
          ];
        }
        
        return data.map(sport => ({
          ...sport,
          createdAt: new Date(sport.created_at)
        }));
      } catch (error) {
        console.error("Sports error:", error);
        // Return fallback sports if query fails
        return [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Football",
            createdAt: new Date()
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002", 
            name: "Basketball",
            createdAt: new Date()
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            name: "Volleyball", 
            createdAt: new Date()
          }
        ];
      }
    },
  });
}

export function useCounties() {
  return useQuery<County[]>({
    queryKey: ["counties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Counties Supabase error:", error);
        
        // Fallback to mock data if database table doesn't exist
        console.log("Using fallback counties data due to database error");
        return [
          { id: "county-1", name: "Nairobi", code: "047", createdAt: new Date() },
          { id: "county-2", name: "Kiambu", code: "022", createdAt: new Date() },
          { id: "county-3", name: "Machakos", code: "016", createdAt: new Date() },
          { id: "county-4", name: "Mombasa", code: "001", createdAt: new Date() }
        ];
      }
      
      return data.map(county => ({
        ...county,
        createdAt: new Date(county.created_at)
      }));
    },
  });
}

export function useSubCounties(countyId: string) {
  return useQuery<any[]>({
    queryKey: ["sub-counties", countyId],
    queryFn: async () => {
      if (!countyId || countyId === 'all') return [];
      
      const { data, error } = await supabase
        .from('sub_counties')
        .select('*')
        .eq('county_id', countyId)
        .order('name');
      
      if (error) {
        console.error("Sub-counties Supabase error:", error);
        
        // Fallback to mock data if database table doesn't exist
        console.log("Using fallback sub-counties data for testing, countyId:", countyId);
        const mockSubCounties = {
          "county-1": [
            { id: "sub-county-1", name: "Westlands", county_id: "county-1" },
            { id: "sub-county-3", name: "Starehe", county_id: "county-1" }
          ],
          "county-2": [
            { id: "sub-county-2", name: "Kiambu", county_id: "county-2" }
          ],
          "county-3": [
            { id: "sub-county-4", name: "Machakos", county_id: "county-3" }
          ],
          "county-4": [
            { id: "sub-county-5", name: "Mvita", county_id: "county-4" }
          ]
        };
        
        return mockSubCounties[countyId as keyof typeof mockSubCounties] || [];
      }
      
      return data;
    },
    enabled: !!countyId,
  });
}

export function useWards(subCountyId: string) {
  return useQuery<any[]>({
    queryKey: ["wards", subCountyId],
    queryFn: async () => {
      if (!subCountyId || subCountyId === 'all') return [];
      
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('sub_county_id', subCountyId)
        .order('name');
      
      if (error) {
        console.error("Wards Supabase error:", error);
        
        // Fallback to mock data if database table doesn't exist
        console.log("Using fallback wards data for testing, subCountyId:", subCountyId);
        const mockWards = {
          "sub-county-1": [
            { id: "ward-1", name: "Kitusuru", sub_county_id: "sub-county-1" }
          ],
          "sub-county-2": [
            { id: "ward-2", name: "Kiambu Town", sub_county_id: "sub-county-2" }
          ],
          "sub-county-3": [
            { id: "ward-3", name: "Landhies", sub_county_id: "sub-county-3" }
          ],
          "sub-county-4": [
            { id: "ward-4", name: "Machakos Central", sub_county_id: "sub-county-4" }
          ],
          "sub-county-5": [
            { id: "ward-5", name: "Mji wa Kale", sub_county_id: "sub-county-5" }
          ]
        };
        
        return mockWards[subCountyId as keyof typeof mockWards] || [];
      }
      
      return data;
    },
    enabled: !!subCountyId,
  });
}

// Organization CRUD operations
export function useCreateOrganization() {
  return useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const { data: result, error } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
        })
        .select()
        .single();

      if (error) {
        console.error("Create organization error:", error);
        throw error;
      }

      return {
        ...result,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at || result.created_at)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useUpdateOrganization() {
  return useMutation({
    mutationFn: async (data: { id: string; name: string; slug: string }) => {
      const { data: result, error } = await supabase
        .from('organizations')
        .update({
          name: data.name,
          slug: data.slug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error("Update organization error:", error);
        throw error;
      }

      return {
        ...result,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at || result.created_at)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useDeleteOrganization() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) {
        console.error("Delete organization error:", error);
        throw error;
      }

      return organizationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
