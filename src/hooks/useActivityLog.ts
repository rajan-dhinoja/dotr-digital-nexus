import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LogActivityParams {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  details?: Record<string, any>;
}

export const useActivityLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: async ({ action, entity_type, entity_id, entity_name, details }: LogActivityParams) => {
      if (!user) return;
      
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type,
        entity_id,
        entity_name,
        details: details || {},
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });

  const logActivity = (params: LogActivityParams) => {
    logMutation.mutate(params);
  };

  return { logActivity };
};
