import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadFile, BucketName } from '@/lib/storage';
import { validateImageFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/validations/admin';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  bucket: BucketName;
  value?: string;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ bucket, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      // Reset the input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    const result = await uploadFile(bucket, file);
    
    if (result.error) {
      toast({
        title: 'Upload failed',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.url) {
      onChange(result.url);
    }
    
    setUploading(false);
    
    // Reset the input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="h-32 w-auto rounded border border-border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-foreground/70" />
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-foreground/60 mb-2" />
              <p className="text-sm text-foreground/80">Click to upload</p>
              <p className="text-xs text-foreground/70 mt-1">
                Max {formatFileSize(MAX_FILE_SIZE)} • JPEG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
