import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BlogPost = Tables<"blog_posts"> & {
  blog_post_categories?: {
    category_id: string;
    blog_categories?: Tables<"blog_categories">;
  }[];
  team_members?: Tables<"team_members">;
};

export const useBlogPosts = (limit?: number) => {
  return useQuery({
    queryKey: ["blog-posts", limit],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          blog_post_categories(
            category_id,
            blog_categories(*)
          ),
          team_members(*)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Tables<"blog_categories">[];
    },
  });
};
