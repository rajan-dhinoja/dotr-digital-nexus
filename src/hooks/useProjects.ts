import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  description: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  cover_image: string | null;
  technologies: string[] | null;
  testimonial: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  project_url: string | null;
  is_featured: boolean | null;
  completed_at: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export const useProjects = (limit?: number) => {
  return useQuery({
    queryKey: ["projects", limit],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*")
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

export const useFeaturedProjects = (limit?: number) => {
  return useQuery({
    queryKey: ["featured-projects", limit],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*")
        .eq("is_featured", true)
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

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Project | null;
    },
    enabled: !!slug,
  });
};

export const useProjectGallery = (projectId: string) => {
  return useQuery({
    queryKey: ["project-gallery", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_gallery")
        .select("*")
        .eq("project_id", projectId)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};
