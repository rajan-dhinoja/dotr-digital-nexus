import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, Download, CheckCircle2, XCircle, AlertCircle, FileJson, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { PageSection, SectionType } from '@/hooks/usePageSections';
import { validateJson, getSchemaDefinition } from '@/lib/sectionSchemaUtils';
import type { ValidationResult } from '@/types/sectionSchema';

interface SectionJsonEditorProps {
  section: PageSection;
  sectionType: SectionType | undefined;
  onContentChange: (content: Record<string, unknown>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function SectionJsonEditor({
  section,
  sectionType,
  onContentChange,
  onValidationChange,
}: SectionJsonEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  
  const [jsonValue, setJsonValue] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('light');

  // Get schema definition
  const schemaDef = sectionType ? getSchemaDefinition(sectionType.schema) : null;
  const exampleJson = schemaDef?.example || {};

  // Track if user is actively editing to prevent auto-updates
  const [isUserEditing, setIsUserEditing] = useState(false);
  const previousContentRef = useRef<string>('');

  // Initialize JSON value from section content
  useEffect(() => {
    try {
      const content = (section.content as Record<string, unknown>) || {};
      const formatted = JSON.stringify(content, null, 2);
      
      // Only update if content actually changed and user isn't actively editing
      if (formatted !== previousContentRef.current && !isUserEditing) {
        setJsonValue(formatted);
        setParseError(null);
        previousContentRef.current = formatted;
      }
    } catch (error) {
      setParseError('Failed to parse section content');
      setJsonValue('{}');
      previousContentRef.current = '{}';
    }
  }, [section.content, isUserEditing]);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEditorTheme(isDark ? 'vs-dark' : 'light');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  // Debounced validation
  const validateDebounced = useCallback(
    debounce((value: string) => {
      setIsValidating(true);
      try {
        const parsed = JSON.parse(value);
        const result = validateJson(parsed, sectionType?.schema);
        setValidationResult(result);
        setParseError(null);
        
        if (onValidationChange) {
          onValidationChange(result.valid);
        }

        // Update Monaco editor markers
        if (editorRef.current) {
          const monaco = (window as any).monaco;
          if (monaco) {
            const model = editorRef.current.getModel();
            const markers = result.errors.map((error) => {
              const line = error.instancePath
                ? parseInt(error.instancePath.match(/\[(\d+)\]/)?.[1] || '1')
                : 1;
              return {
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: 1000,
                message: error.message,
              };
            });
            monaco.editor.setModelMarkers(model, 'json-validator', markers);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Invalid JSON syntax';
        setParseError(errorMessage);
        setValidationResult({ valid: false, errors: [{ path: '/', message: errorMessage }] });
        
        if (onValidationChange) {
          onValidationChange(false);
        }
      } finally {
        setIsValidating(false);
      }
    }, 500),
    [sectionType, onValidationChange]
  );

  // Validate on JSON value change
  useEffect(() => {
    if (jsonValue) {
      validateDebounced(jsonValue);
    }
  }, [jsonValue, validateDebounced]);

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setIsUserEditing(true);
      setJsonValue(value);
      // Reset editing flag after a delay to allow external updates
      setTimeout(() => setIsUserEditing(false), 1000);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      wordWrap: 'on',
      minimap: { enabled: false },
      formatOnPaste: true,
      formatOnType: true,
    });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a .json file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        
        // Validate against schema
        const result = validateJson(parsed, sectionType?.schema);
        
        if (result.valid) {
          setJsonValue(JSON.stringify(parsed, null, 2));
          onContentChange(parsed);
          toast({
            title: 'File uploaded',
            description: 'JSON file loaded successfully',
          });
        } else {
          toast({
            title: 'Validation failed',
            description: `File contains ${result.errors.length} validation error(s)`,
            variant: 'destructive',
          });
          setJsonValue(JSON.stringify(parsed, null, 2));
          setValidationResult(result);
        }
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: error instanceof Error ? error.message : 'Failed to parse JSON file',
          variant: 'destructive',
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: 'File read error',
        description: 'Failed to read the file',
        variant: 'destructive',
      });
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Sanitize filename
      const sectionName = section.section_type || 'section';
      const sectionId = section.id ? `-${section.id.slice(0, 8)}` : '';
      link.download = `${sectionName}${sectionId}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'JSON file downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Invalid JSON cannot be exported',
        variant: 'destructive',
      });
    }
  };

  // Handle format
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonValue(formatted);
      toast({
        title: 'Formatted',
        description: 'JSON has been formatted',
      });
    } catch (error) {
      toast({
        title: 'Format failed',
        description: 'Invalid JSON cannot be formatted',
        variant: 'destructive',
      });
    }
  };

  // Update content when valid JSON is entered (debounced to avoid excessive updates)
  useEffect(() => {
    if (validationResult.valid && !parseError && jsonValue && isUserEditing) {
      const timeoutId = setTimeout(() => {
        try {
          const parsed = JSON.parse(jsonValue);
          onContentChange(parsed);
        } catch {
          // Ignore parse errors here, they're handled in validation
        }
      }, 300); // Small delay to batch rapid changes

      return () => clearTimeout(timeoutId);
    }
  }, [validationResult.valid, parseError, jsonValue, onContentChange, isUserEditing]);

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-card border-border text-foreground hover:bg-muted hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-card border-border text-foreground hover:bg-muted hover:text-foreground"
            onClick={handleExport}
            disabled={!validationResult.valid || !!parseError}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-card border-border text-foreground hover:bg-muted hover:text-foreground"
            onClick={handleFormat}
            disabled={!!parseError}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Format
          </Button>
        </div>
        
        {/* Validation Status */}
        <div className="flex items-center gap-2">
          {isValidating && (
            <Badge variant="outline" className="animate-pulse">
              Validating...
            </Badge>
          )}
          {!isValidating && validationResult.valid && !parseError && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          )}
          {!isValidating && (!validationResult.valid || parseError) && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              {parseError ? 'Parse Error' : `${validationResult.errors.length} Error(s)`}
            </Badge>
          )}
        </div>
      </div>

      {/* Editor and Schema Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] xl:grid-cols-[60%_40%] gap-4 flex-1 min-h-0">
        {/* JSON Editor */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">JSON Editor</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
              <Editor
                height="100%"
                language="json"
                theme={editorTheme}
                value={jsonValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-sm text-foreground/70">Loading editor...</div>
                  </div>
                }
                options={{
                  fontSize: 14,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  renderWhitespace: 'selection',
                  smoothScrolling: true,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                  },
                }}
              />
            </div>
            
            {/* Parse Error Display */}
            {parseError && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      JSON Parse Error
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {parseError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schema Example Panel */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Example JSON Structure</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                {schemaDef ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-foreground/80 mb-3 leading-relaxed">
                        This is an example JSON structure for this section type. Use this as a reference when writing or uploading JSON data. All fields shown are based on the section schema.
                      </p>
                      <div className="relative">
                        <pre className="text-xs bg-muted/30 border border-border p-3 rounded-md overflow-x-auto font-mono text-foreground dark:bg-muted/20 whitespace-pre-wrap break-words max-w-full">
                          {JSON.stringify(exampleJson, null, 2)}
                        </pre>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 px-2 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(exampleJson, null, 2));
                            toast({
                              title: 'Copied',
                              description: 'Example JSON copied to clipboard',
                            });
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    {validationResult.errors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">
                          Validation Errors:
                        </p>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {validationResult.errors.map((error, index) => (
                              <div
                                key={index}
                                className="p-2 bg-red-50 dark:bg-red-950 rounded text-xs"
                              >
                                <p className="font-medium text-red-800 dark:text-red-200">
                                  {error.path}
                                </p>
                                <p className="text-red-600 dark:text-red-400">
                                  {error.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-foreground/70">
                    No schema available for this section type
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
