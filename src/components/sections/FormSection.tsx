import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check } from 'lucide-react';

interface FormField {
  field_type: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  width?: 'half' | 'full';
}

interface FormSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
  sectionId?: string;
}

export function FormSection({ title, subtitle, content, sectionId }: FormSectionProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formTitle = (content.form_title as string) || title || 'Contact Us';
  const formDescription = (content.form_description as string) || subtitle || '';
  const submitButtonText = (content.submit_button_text as string) || 'Submit';
  const successMessage = (content.success_message as string) || 'Thank you! Your submission has been received.';
  const fields = (content.fields as FormField[]) || [];

  // Build dynamic Zod schema based on fields
  const buildSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.field_type) {
        case 'email':
          fieldSchema = z.string().email('Please enter a valid email');
          break;
        case 'phone':
          fieldSchema = z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number');
          break;
        case 'url':
          fieldSchema = z.string().url('Please enter a valid URL');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
          }
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        case 'checkbox-group':
          fieldSchema = z.array(z.string());
          break;
        default:
          fieldSchema = z.string();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).min(field.validation.min, `Minimum ${field.validation.min} characters`);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.validation.max, `Maximum ${field.validation.max} characters`);
          }
      }
      
      if (!field.required && field.field_type !== 'checkbox' && field.field_type !== 'checkbox-group') {
        fieldSchema = fieldSchema.optional().or(z.literal(''));
      }
      
      schemaFields[field.name] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const schema = buildSchema();
  type FormData = z.infer<typeof schema>;

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce((acc, field) => {
      if (field.field_type === 'checkbox-group') {
        acc[field.name] = [];
      } else if (field.field_type === 'checkbox') {
        acc[field.name] = false;
      } else {
        acc[field.name] = '';
      }
      return acc;
    }, {} as Record<string, unknown>),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Use contact_leads table for form submissions since form_submissions may not be in types yet
      const { error } = await supabase.from('contact_leads').insert({
        name: (data as Record<string, unknown>).name as string || 'Form Submission',
        email: (data as Record<string, unknown>).email as string || 'no-email@form.com',
        message: JSON.stringify(data),
        source: `form_section_${sectionId || 'dynamic'}`,
        status: 'new',
      });

      if (error) throw error;

      setIsSubmitted(true);
      reset();
      toast({
        title: 'Success',
        description: successMessage,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const errorMessage = fieldError?.message as string | undefined;

    switch (field.field_type) {
      case 'textarea':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={field.name} className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className="mt-1"
              rows={4}
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={field.name} className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Select onValueChange={controllerField.onChange} value={controllerField.value as string}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={field.placeholder || 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <RadioGroup
                  onValueChange={controllerField.onChange}
                  value={controllerField.value as string}
                  className="mt-2 space-y-2"
                >
                  {(field.options || []).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${field.name}-${option}`} />
                      <Label htmlFor={`${field.name}-${option}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className={`${field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'} flex items-start space-x-2`}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Checkbox
                  id={field.name}
                  checked={controllerField.value as boolean}
                  onCheckedChange={controllerField.onChange}
                />
              )}
            />
            <Label htmlFor={field.name} className="font-normal text-foreground cursor-pointer">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'checkbox-group':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <div className="mt-2 space-y-2">
                  {(field.options || []).map((option) => {
                    const currentValues = (controllerField.value as string[]) || [];
                    return (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.name}-${option}`}
                          checked={currentValues.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              controllerField.onChange([...currentValues, option]);
                            } else {
                              controllerField.onChange(currentValues.filter((v) => v !== option));
                            }
                          }}
                        />
                        <Label htmlFor={`${field.name}-${option}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={field.name} className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              {...register(field.name)}
              className="mt-1"
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={field.name} className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              {...register(field.name)}
              className="mt-1"
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );

      default:
        // text, email, phone, url
        return (
          <div key={field.name} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={field.name} className="text-foreground">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'url' ? 'url' : 'text'}
              placeholder={field.placeholder}
              {...register(field.name)}
              className="mt-1"
            />
            {errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {successMessage}
            </h2>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="mt-4"
            >
              Submit Another Response
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {formTitle}
            </h2>
            {formDescription && (
              <p className="text-lg text-muted-foreground">
                {formDescription}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(renderField)}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
