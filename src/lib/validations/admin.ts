import { z } from 'zod';

// Common validation patterns
const slugSchema = z.string().trim().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

const displayOrderSchema = z.coerce.number().int().min(0).max(9999).default(0);

// Service validation
export const serviceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema,
  category_id: z.string().uuid('Please select a category'),
  short_summary: z.string().trim().max(500, 'Summary must be less than 500 characters').nullable().optional(),
  description: z.string().trim().max(10000, 'Description must be less than 10000 characters').nullable().optional(),
  image_url: z.string().url().nullable().optional().or(z.literal('')),
  display_order: displayOrderSchema,
});

// Project validation
export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema,
  client_name: z.string().trim().max(200, 'Client name must be less than 200 characters').nullable().optional(),
  summary: z.string().trim().max(500, 'Summary must be less than 500 characters').nullable().optional(),
  description: z.string().trim().max(10000, 'Description must be less than 10000 characters').nullable().optional(),
  achievements: z.string().trim().max(2000, 'Achievements must be less than 2000 characters').nullable().optional(),
  project_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  cover_image_url: z.string().url().nullable().optional().or(z.literal('')),
  display_order: displayOrderSchema,
});

// Blog post validation
export const blogPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300, 'Title must be less than 300 characters'),
  slug: slugSchema,
  excerpt: z.string().trim().max(500, 'Excerpt must be less than 500 characters').nullable().optional(),
  content: z.string().trim().min(1, 'Content is required').max(100000, 'Content must be less than 100000 characters'),
  cover_image_url: z.string().url().nullable().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Team member validation
export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  bio: z.string().trim().max(2000, 'Bio must be less than 2000 characters').nullable().optional(),
  profile_image_url: z.string().url().nullable().optional().or(z.literal('')),
  social_links: z.record(z.string().url()).nullable().optional(),
  display_order: displayOrderSchema,
});

// Testimonial validation
export const testimonialSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  designation: z.string().trim().max(100, 'Designation must be less than 100 characters').nullable().optional(),
  company: z.string().trim().max(100, 'Company must be less than 100 characters').nullable().optional(),
  testimonial_text: z.string().trim().min(1, 'Testimonial is required').max(2000, 'Testimonial must be less than 2000 characters'),
  photo_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  display_order: displayOrderSchema,
});

// Service category validation
export const serviceCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: slugSchema,
  description: z.string().trim().max(500, 'Description must be less than 500 characters').nullable().optional(),
  display_order: displayOrderSchema,
});

// File upload validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }
  
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed types: JPEG, PNG, GIF, WebP` };
  }
  
  return { valid: true };
}

// Helper to extract form data and validate
export function validateFormData<T extends z.ZodSchema>(
  schema: T,
  formData: FormData,
  fieldMappings: Record<string, (value: FormDataEntryValue | null) => unknown>
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const rawData: Record<string, unknown> = {};
  
  for (const [key, mapper] of Object.entries(fieldMappings)) {
    rawData[key] = mapper(formData.get(key));
  }
  
  const result = schema.safeParse(rawData);
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` };
  }
  
  return { success: true, data: result.data };
}
