import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface PageSection {
  id: string;
  page_type: string;
  entity_id: string | null;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: Json;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  allowed_pages: string[];
  schema: Json;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export function useSectionTypes(pageType?: string) {
  return useQuery({
    queryKey: ['section-types', pageType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      // Filter by allowed_pages if pageType provided
      if (pageType && data) {
        return data.filter((st) => 
          st.allowed_pages.includes(pageType)
        ) as SectionType[];
      }
      
      return data as SectionType[];
    },
  });
}

export function usePageSections(pageType: string, entityId?: string) {
  return useQuery({
    queryKey: ['page-sections', pageType, entityId],
    queryFn: async () => {
      let query = supabase
        .from('page_sections')
        .select('*')
        .eq('page_type', pageType)
        .eq('is_active', true)
        .order('display_order');
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      } else {
        query = query.is('entity_id', null);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PageSection[];
    },
  });
}

export function useAdminPageSections(pageType: string, entityId?: string) {
  return useQuery({
    queryKey: ['admin-page-sections', pageType, entityId],
    queryFn: async () => {
      let query = supabase
        .from('page_sections')
        .select('*')
        .eq('page_type', pageType)
        .order('display_order');
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      } else {
        query = query.is('entity_id', null);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PageSection[];
    },
    enabled: !!pageType,
  });
}

export function usePageSectionMutations(pageType: string, entityId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['admin-page-sections', pageType, entityId];

  const saveMutation = useMutation({
    mutationFn: async (section: Partial<PageSection> & { id?: string }) => {
      const payload = {
        section_type: section.section_type!,
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        display_order: section.display_order,
        is_active: section.is_active,
      };

      if (section.id) {
        const { error } = await supabase
          .from('page_sections')
          .update(payload)
          .eq('id', section.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_sections')
          .insert({
            ...payload,
            page_type: pageType,
            entity_id: entityId || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (sections: { id: string; display_order: number }[]) => {
      for (const section of sections) {
        const { error } = await supabase
          .from('page_sections')
          .update({ display_order: section.display_order })
          .eq('id', section.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { saveMutation, deleteMutation, reorderMutation };
}
