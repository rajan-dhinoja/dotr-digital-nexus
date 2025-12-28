import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_id: string | null;
  is_published: boolean | null;
  published_at: string | null;
  read_time: number | null;
  views: number | null;
  created_at: string;
  updated_at: string;
  team_members?: {
    id: string;
    name: string;
    role: string;
    image_url: string | null;
  };
  blog_post_categories?: {
    category_id: string;
    blog_categories: BlogCategory;
  }[];
}

export const useBlogPosts = (limit?: number) => {
  return useQuery({
    queryKey: ["blog-posts", limit],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          team_members(id, name, role, image_url),
          blog_post_categories(
            category_id,
            blog_categories(*)
          )
        `)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BlogPost[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          team_members(id, name, role, image_url),
          blog_post_categories(
            category_id,
            blog_categories(*)
          )
        `)
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
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
      return data as BlogCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
