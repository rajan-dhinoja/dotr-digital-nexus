import { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionImportExport, type ImportOptions, type ImportResult } from '@/hooks/useSectionImportExport';
import { parseSectionImportFile, validateSectionImportData, type SectionValidationResult } from '@/lib/sectionImportExport';
import type { SectionType } from '@/hooks/usePageSections';

interface SectionImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageType: string;
  entityId?: string;
  sectionTypes: SectionType[];
  queryKey: string[];
}

type ImportMode = 'skip' | 'overwrite' | 'merge';
type ReorderStrategy = 'preserve' | 'append' | 'renumber';

export function SectionImportModal({
  open,
  onOpenChange,
  pageType,
  entityId,
  sectionTypes,
  queryKey,
}: SectionImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('skip');
  const [reorderStrategy, setReorderStrategy] = useState<ReorderStrategy>('append');
  const [validation, setValidation] = useState<SectionValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [sectionCount, setSectionCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { importSections } = useSectionImportExport({
    pageType,
    entityId,
    queryKey,
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    setFile(selectedFile);
    setValidation(null);
    setImportResult(null);
    setIsValidating(true);

    try {
      const importData = await parseSectionImportFile(selectedFile);
      setSectionCount(importData.sections.length);
      const validationResult = await validateSectionImportData(
        importData,
        pageType,
        sectionTypes.map(st => ({
          slug: st.slug,
          schema: st.schema,
          is_active: st.is_active,
        }))
      );
      setValidation(validationResult);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [{
          path: '/',
          message: error instanceof Error ? error.message : 'Failed to parse file',
        }],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validation?.valid) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const options: ImportOptions = {
        onConflict: importMode,
        reorderStrategy,
        validateSchemas: true,
      };

      const result = await importSections(file, sectionTypes, options);
      setImportResult(result);

      if (result.success) {
        // Reset form after successful import
        setTimeout(() => {
          handleReset();
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        total: 0,
        imported: 0,
        skipped: 0,
        overwritten: 0,
        failed: 1,
        errors: [{ sectionIndex: -1, error: error instanceof Error ? error.message : 'Unknown error' }],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidation(null);
    setImportResult(null);
    setSectionCount(0);
    setImportMode('skip');
    setReorderStrategy('append');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      handleReset();
      onOpenChange(false);
    }
  };

  const canImport = file && validation?.valid && !isImporting && !isValidating;
  const hasErrors = validation && !validation.valid;
  const hasWarnings = validation && validation.warnings && validation.warnings.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Sections</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Select JSON File</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="section-import-file"
                  disabled={isImporting || isValidating}
                />
                <label htmlFor="section-import-file">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isImporting || isValidating}
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {file ? file.name : 'Choose File'}
                    </span>
                  </Button>
                </label>
                {file && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      setValidation(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isImporting || isValidating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Validation Status */}
            {isValidating && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validating file...</span>
              </div>
            )}

            {validation && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${validation.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {validation.valid ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {validation.valid ? 'File is valid' : 'Validation failed'}
                  </span>
                </div>

                {hasErrors && validation.errors.length > 0 && (
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Errors:</div>
                        <ScrollArea className="max-h-32">
                          <ul className="text-sm space-y-1">
                            {validation.errors.map((error, idx) => (
                              <li key={idx} className="text-red-600 dark:text-red-400">
                                {error.sectionIndex !== undefined
                                  ? `Section ${error.sectionIndex + 1}: `
                                  : ''}
                                {error.message}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasWarnings && validation.warnings && validation.warnings.length > 0 && (
                  <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Warnings:
                        </div>
                        <ScrollArea className="max-h-32">
                          <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                            {validation.warnings.map((warning, idx) => (
                              <li key={idx}>
                                {warning.sectionIndex !== undefined
                                  ? `Section ${warning.sectionIndex + 1}: `
                                  : ''}
                                {warning.message}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {validation.valid && file && sectionCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Found {sectionCount} section{sectionCount !== 1 ? 's' : ''} to import
                  </div>
                )}
              </div>
            )}

            {/* Import Options */}
            {validation?.valid && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import Mode</Label>
                  <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip" className="font-normal cursor-pointer">
                        Skip Existing - Skip sections that already exist
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overwrite" id="overwrite" />
                      <Label htmlFor="overwrite" className="font-normal cursor-pointer">
                        Overwrite - Replace existing sections with imported data
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="merge" id="merge" />
                      <Label htmlFor="merge" className="font-normal cursor-pointer">
                        Merge - Merge imported data with existing sections
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Reorder Strategy</Label>
                  <RadioGroup value={reorderStrategy} onValueChange={(v) => setReorderStrategy(v as ReorderStrategy)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="preserve" id="preserve" />
                      <Label htmlFor="preserve" className="font-normal cursor-pointer">
                        Preserve - Keep imported display_order values
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="append" id="append" />
                      <Label htmlFor="append" className="font-normal cursor-pointer">
                        Append - Add sections at the end
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="renumber" id="renumber" />
                      <Label htmlFor="renumber" className="font-normal cursor-pointer">
                        Renumber - Renumber all sections sequentially
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing sections...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <Card className={importResult.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 font-medium ${importResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {importResult.success ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <span>Import {importResult.success ? 'Completed' : 'Failed'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Total: {importResult.total}</div>
                      <div className="text-green-600 dark:text-green-400">
                        Imported: {importResult.imported}
                      </div>
                      {importResult.overwritten > 0 && (
                        <div className="text-blue-600 dark:text-blue-400">
                          Overwritten: {importResult.overwritten}
                        </div>
                      )}
                      {importResult.skipped > 0 && (
                        <div className="text-yellow-600 dark:text-yellow-400">
                          Skipped: {importResult.skipped}
                        </div>
                      )}
                      {importResult.failed > 0 && (
                        <div className="text-red-600 dark:text-red-400">
                          Failed: {importResult.failed}
                        </div>
                      )}
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Errors:</div>
                        <ScrollArea className="max-h-32">
                          <ul className="text-sm space-y-1">
                            {importResult.errors.map((error, idx) => (
                              <li key={idx} className="text-red-600 dark:text-red-400">
                                {error.sectionIndex >= 0
                                  ? `Section ${error.sectionIndex + 1}: `
                                  : ''}
                                {error.error}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!canImport}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Sections'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
