import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { format } from 'date-fns';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'client';
  created_at: string;
  email?: string;
}

const ROLE_COLORS: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  editor: 'secondary',
  client: 'outline',
};

export default function AdminUsers() {
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: role as 'admin' | 'editor' | 'client' })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity({
        action: 'update',
        entity_type: 'user_role',
        entity_id: editingUser?.user_id,
        details: { new_role: selectedRole },
      });
      setEditingUser(null);
      toast({ title: 'User role updated' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity({
        action: 'delete',
        entity_type: 'user',
        entity_id: userToDelete?.user_id,
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({ title: 'User removed' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleEditRole = (user: UserRole) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const columns = [
    { 
      key: 'user_id', 
      label: 'User ID',
      render: (u: UserRole) => (
        <code className="text-xs bg-card border border-border px-2 py-1 rounded text-foreground font-mono">{u.user_id.slice(0, 8)}...</code>
      ),
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (u: UserRole) => (
        <Badge variant={ROLE_COLORS[u.role] || 'outline'}>
          {u.role}
        </Badge>
      ),
    },
    { 
      key: 'created_at', 
      label: 'Joined',
      render: (u: UserRole) => format(new Date(u.created_at), 'MMM d, yyyy'),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={isLoading}
        onEdit={handleEditRole}
        onDelete={(u) => {
          setUserToDelete(u);
          setDeleteDialogOpen(true);
        }}
      />

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              User ID: <code className="bg-card border border-border px-2 py-1 rounded text-foreground font-mono">{editingUser?.user_id}</code>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="editor">Editor - Content management</SelectItem>
                  <SelectItem value="client">Client - Limited access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button 
              onClick={() => editingUser && updateRoleMutation.mutate({ userId: editingUser.user_id, role: selectedRole })}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this user's role? They will lose access to the admin panel.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.user_id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Removing...' : 'Remove User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
