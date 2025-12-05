import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ServiceCategory = Tables<"services_categories">;
export type Service = Tables<"services"> & {
  services_categories?: ServiceCategory;
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services_categories")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data as ServiceCategory[];
    },
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, services_categories(*)")
        .order("display_order");
      
      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useServicesWithCategories = () => {
  return useQuery({
    queryKey: ["services-with-categories"],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from("services_categories")
        .select("*")
        .order("display_order");
      
      if (catError) throw catError;

      const { data: services, error: servError } = await supabase
        .from("services")
        .select("*")
        .order("display_order");
      
      if (servError) throw servError;

      return categories.map(category => ({
        ...category,
        services: services.filter(s => s.category_id === category.id),
      }));
    },
  });
};
