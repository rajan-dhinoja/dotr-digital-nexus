import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

interface GalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  display_order: number | null;
  created_at: string;
}

interface Props {
  projectId: string;
}

export function ProjectGalleryManager({ projectId }: Props) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [] } = useQuery({
    queryKey: ['project-gallery', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('project_gallery')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order');
      return (data ?? []) as GalleryImage[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newImageUrl) return;
      const { error } = await supabase.from('project_gallery').insert({
        project_id: projectId,
        image_url: newImageUrl,
        caption: newCaption || null,
        display_order: images.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-gallery', projectId] });
      setNewImageUrl('');
      setNewCaption('');
      toast({ title: 'Image added' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-gallery', projectId] });
      toast({ title: 'Image removed' });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Gallery Images</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.image_url}
              alt={img.caption || 'Gallery'}
              className="w-full h-24 object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteMutation.mutate(img.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {img.caption && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{img.caption}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <ImageUpload
          bucket="project-images"
          value={newImageUrl || undefined}
          onChange={(url) => setNewImageUrl(url ?? '')}
        />
        <Input
          placeholder="Caption (optional)"
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
        />
        <Button
          onClick={() => addMutation.mutate()}
          disabled={!newImageUrl || addMutation.isPending}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Add to Gallery
        </Button>
      </div>
    </div>
  );
}
