import { supabase } from '@/integrations/supabase/client';
import { validateImageFile } from '@/lib/validations/admin';

export type BucketName = 'service-images' | 'project-images' | 'team-images' | 'blog-images';

export interface UploadResult {
  url: string | null;
  error?: string;
}

export async function uploadFile(bucket: BucketName, file: File, path?: string): Promise<UploadResult> {
  // Validate file before upload
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { url: null, error: validation.error };
  }

  const fileName = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error('Upload error:', error);
    return { url: null, error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: publicUrl };
}

export async function deleteFile(bucket: BucketName, url: string): Promise<boolean> {
  const path = url.split(`${bucket}/`)[1];
  if (!path) return false;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
