import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Search, Download, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type FormSubmission = Tables<'form_submissions'>;

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  new: { label: 'New', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  read: { label: 'Read', variant: 'secondary', icon: <Eye className="h-3 w-3" /> },
  processed: { label: 'Processed', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
};

export default function AdminFormSubmissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin-form-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('form_submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-form-submissions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('form_submissions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-form-submissions'] });
      setSelectedSubmission(null);
      toast({ title: 'Submission deleted' });
    },
  });

  const uniquePages = [...new Set(submissions.map(s => s.page_type))];

  const filteredSubmissions = submissions.filter(sub => {
    const formData = sub.form_data as Record<string, any>;
    const searchStr = JSON.stringify(formData).toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPage = pageFilter === 'all' || sub.page_type === pageFilter;
    
    return matchesSearch && matchesStatus && matchesPage;
  });

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    if (submission.status === 'new') {
      updateStatusMutation.mutate({ id: submission.id, status: 'read' });
    }
  };

  const exportToCsv = () => {
    if (filteredSubmissions.length === 0) return;
    
    // Get all unique keys from form_data
    const allKeys = new Set<string>();
    filteredSubmissions.forEach(sub => {
      const formData = sub.form_data as Record<string, any>;
      Object.keys(formData).forEach(key => allKeys.add(key));
    });
    
    const headers = ['Date', 'Page', 'Status', ...Array.from(allKeys)];
    const rows = filteredSubmissions.map(sub => {
      const formData = sub.form_data as Record<string, any>;
      return [
        format(new Date(sub.created_at!), 'yyyy-MM-dd HH:mm:ss'),
        sub.page_type,
        sub.status || 'new',
        ...Array.from(allKeys).map(key => String(formData[key] || '')),
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Form Submissions</h1>
          <p className="text-muted-foreground">View and manage submissions from dynamic forms</p>
        </div>
        <Button variant="outline" onClick={exportToCsv} disabled={filteredSubmissions.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageFilter} onValueChange={setPageFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            {uniquePages.map(page => (
              <SelectItem key={page} value={page}>{page}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'new').length}</div>
            <p className="text-sm text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'read').length}</div>
            <p className="text-sm text-muted-foreground">Read</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'processed').length}</div>
            <p className="text-sm text-muted-foreground">Processed</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground/70">Loading submissions...</div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 text-foreground/70">No submissions found</div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const formData = sub.form_data as Record<string, any>;
            const statusConfig = STATUS_CONFIG[sub.status || 'new'];
            
            return (
              <Card key={sub.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleViewSubmission(sub)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusConfig.variant} className="gap-1">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{sub.page_type}</span>
                      </div>
                      <p className="text-sm truncate">
                        {formData.name || formData.email || Object.values(formData)[0] || 'No data'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-foreground/70 whitespace-nowrap">
                      {format(new Date(sub.created_at!), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Form Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={STATUS_CONFIG[selectedSubmission.status || 'new'].variant}>
                  {STATUS_CONFIG[selectedSubmission.status || 'new'].label}
                </Badge>
                <Select 
                  value={selectedSubmission.status || 'new'} 
                  onValueChange={(status) => {
                    updateStatusMutation.mutate({ id: selectedSubmission.id, status });
                    setSelectedSubmission({ ...selectedSubmission, status });
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-foreground/80">
                  <p>Page: {selectedSubmission.page_type}</p>
                  <p>Submitted: {format(new Date(selectedSubmission.created_at!), 'MMM d, yyyy HH:mm:ss')}</p>
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Form Data</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedSubmission.form_data as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="col-span-2 break-words">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedSubmission.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
