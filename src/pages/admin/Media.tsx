import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Grid, List, Trash2, Image, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  name: string;
  bucket: string;
  url: string;
  size: number;
  created_at: string;
}

const BUCKETS = [
  { value: 'all', label: 'All Buckets' },
  { value: 'service-images', label: 'Service Images' },
  { value: 'project-images', label: 'Project Images' },
  { value: 'blog-images', label: 'Blog Images' },
  { value: 'team-images', label: 'Team Images' },
];

export default function AdminMedia() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBucket, setSelectedBucket] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const buckets = BUCKETS.filter(b => b.value !== 'all').map(b => b.value);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['admin-media', selectedBucket],
    queryFn: async () => {
      const bucketsToQuery = selectedBucket === 'all' ? buckets : [selectedBucket];
      const allFiles: MediaFile[] = [];

      for (const bucket of bucketsToQuery) {
        const { data, error } = await supabase.storage.from(bucket).list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) continue;

        const filesWithUrls = (data || []).map((file) => ({
          id: `${bucket}/${file.name}`,
          name: file.name,
          bucket,
          url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at || '',
        }));

        allFiles.push(...filesWithUrls);
      }

      return allFiles;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      for (const fileId of fileIds) {
        const [bucket, ...nameParts] = fileId.split('/');
        const fileName = nameParts.join('/');
        const { error } = await supabase.storage.from(bucket).remove([fileName]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setSelectedFiles([]);
      setDeleteDialogOpen(false);
      toast({ title: 'Files deleted successfully' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage all uploaded files across the site</p>
        </div>
        {selectedFiles.length > 0 && (
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedFiles.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedBucket} onValueChange={setSelectedBucket}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUCKETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground/70">Loading files...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto text-foreground/50 mb-4" />
          <p className="text-foreground/70">No files found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className={cn(
                "group cursor-pointer overflow-hidden transition-all",
                selectedFiles.includes(file.id) && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-0 relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => toggleFileSelection(file.id)}
                  />
                </div>
                <div 
                  className="aspect-square bg-muted flex items-center justify-center"
                  onClick={() => setPreviewFile(file)}
                >
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs truncate font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.bucket}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedFiles.includes(file.id) && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => toggleFileSelection(file.id)}
                />
                <div 
                  className="h-12 w-12 bg-muted rounded flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => setPreviewFile(file)}
                >
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.bucket}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSelectedFiles([file.id]);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={previewFile?.url} 
              alt={previewFile?.name}
              className="max-h-[60vh] object-contain rounded"
            />
          </div>
          <div className="text-sm text-foreground/80">
            <p>Bucket: {previewFile?.bucket}</p>
            <p>URL: <code className="text-xs bg-card border border-border px-2 py-1 rounded break-all text-foreground font-mono">{previewFile?.url}</code></p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Files</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedFiles.length} file(s)? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(selectedFiles)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
