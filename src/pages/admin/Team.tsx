import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { teamMemberSchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type TeamMember = Tables<'team_members'>;

export default function AdminTeam() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*').order('display_order');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (member: Partial<TeamMember>) => {
      if (editing) {
        const { error } = await supabase.from('team_members').update(member).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team_members').insert(member as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Member updated' : 'Member added' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast({ title: 'Member deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    // Parse social links JSON safely
    let socialLinks = null;
    const socialLinksStr = form.get('social_links')?.toString() || '';
    if (socialLinksStr.trim()) {
      try {
        socialLinks = JSON.parse(socialLinksStr);
      } catch {
        toast({ title: 'Validation Error', description: 'Social Links must be valid JSON', variant: 'destructive' });
        return;
      }
    }
    
    const validation = validateFormData(teamMemberSchema, form, {
      name: (v) => v?.toString() ?? '',
      title: (v) => v?.toString() ?? '',
      bio: (v) => v?.toString() || null,
      profile_image_url: (v) => v?.toString() || null,
      social_links: () => socialLinks,
      display_order: (v) => Number(v) || 0,
    });

    if (!validation.success) {
      toast({ title: 'Validation Error', description: (validation as { success: false; error: string }).error, variant: 'destructive' });
      return;
    }

    saveMutation.mutate((validation as { success: true; data: typeof validation.data }).data);
  };

  const columns = [
    {
      key: 'profile_image_url',
      label: 'Photo',
      render: (m: TeamMember) => m.profile_image_url ? (
        <img src={m.profile_image_url} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : '-',
    },
    { key: 'name', label: 'Name' },
    { key: 'title', label: 'Title' },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      <DataTable
        data={members}
        columns={columns}
        loading={isLoading}
        onEdit={(m) => { setEditing(m); setOpen(true); }}
        onDelete={(m) => deleteMutation.mutate(m.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editing?.name} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={editing?.title} required maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea name="bio" defaultValue={editing?.bio ?? ''} rows={3} maxLength={2000} />
            </div>
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <ImageUpload
                bucket="team-profiles"
                value={editing?.profile_image_url ?? undefined}
                onChange={(url) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="profile_image_url"]');
                  if (input) input.value = url ?? '';
                }}
              />
              <input type="hidden" name="profile_image_url" defaultValue={editing?.profile_image_url ?? ''} />
            </div>
            <div className="space-y-2">
              <Label>Social Links (JSON)</Label>
              <Textarea
                name="social_links"
                defaultValue={JSON.stringify(editing?.social_links ?? {}, null, 2)}
                rows={3}
                placeholder='{"linkedin": "url", "twitter": "url"}'
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} min={0} max={9999} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
