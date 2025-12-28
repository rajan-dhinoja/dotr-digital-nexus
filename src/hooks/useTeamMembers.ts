import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data as TeamMember[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedTeamMembers = () => {
  return useQuery({
    queryKey: ["featured-team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_featured", true)
        .order("display_order");
      
      if (error) throw error;
      return data as TeamMember[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
