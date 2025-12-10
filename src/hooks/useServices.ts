import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  features: any[] | null;
  process_steps: any[] | null;
  faqs: any[] | null;
  technologies: any[] | null;
  pricing: any[] | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
  service_categories?: ServiceCategory;
}

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
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
        .select("*, service_categories(*)")
        .order("display_order");
      
      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useFeaturedServices = () => {
  return useQuery({
    queryKey: ["featured-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, service_categories(*)")
        .eq("is_featured", true)
        .order("display_order");
      
      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useServiceBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, service_categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Service | null;
    },
    enabled: !!slug,
  });
};

export const useServicesWithCategories = () => {
  return useQuery({
    queryKey: ["services-with-categories"],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from("service_categories")
        .select("*")
        .order("display_order");
      
      if (catError) throw catError;

      const { data: services, error: servError } = await supabase
        .from("services")
        .select("*")
        .order("display_order");
      
      if (servError) throw servError;

      return (categories as ServiceCategory[]).map(category => ({
        ...category,
        services: (services as Service[]).filter(s => s.category_id === category.id),
      }));
    },
  });
};
