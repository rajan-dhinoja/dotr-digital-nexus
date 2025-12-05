import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Project = Tables<"projects"> & {
  project_services?: {
    service_id: string;
    services?: Tables<"services"> & {
      services_categories?: Tables<"services_categories">;
    };
  }[];
};

export const useProjects = (limit?: number) => {
  return useQuery({
    queryKey: ["projects", limit],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select(`
          *,
          project_services(
            service_id,
            services(
              *,
              services_categories(*)
            )
          )
        `)
        .order("display_order");
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Project[];
    },
  });
};
