import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_image: string | null;
  content: string;
  rating: number | null;
  project_id: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
}

export const useTestimonials = (limit?: number) => {
  return useQuery({
    queryKey: ["testimonials", limit],
    queryFn: async () => {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("display_order");
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useFeaturedTestimonials = (limit?: number) => {
  return useQuery({
    queryKey: ["featured-testimonials", limit],
    queryFn: async () => {
      let query = supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("display_order");
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
};
