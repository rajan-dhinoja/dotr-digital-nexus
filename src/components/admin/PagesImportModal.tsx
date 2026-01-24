import { useState, useRef } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  usePagesImportExport,
  type PagesImportMode,
  type PagesImportResult,
} from '@/hooks/usePagesImportExport';
import {
  parsePagesMenuFile,
  validatePagesMenuImportData,
  type PagesMenuValidationResult,
} from '@/lib/pagesMenuImportExport';

interface PagesImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PagesImportModal({ open, onOpenChange }: PagesImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<PagesImportMode>('skip');
  const [validation, setValidation] = useState<PagesMenuValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<PagesImportResult | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { importPagesMenu } = usePagesImportExport();

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
      const importData = await parsePagesMenuFile(selectedFile);
      setPageCount(importData.pages.length);
      setMenuCount(importData.menu_items.length);
      const validationResult = validatePagesMenuImportData(importData);
      setValidation(validationResult);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [
          {
            path: '/',
            message:
              error instanceof Error ? error.message : 'Failed to parse file',
          },
        ],
      });
      setPageCount(0);
      setMenuCount(0);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validation?.valid) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importPagesMenu(file, { onConflict: importMode });
      setImportResult(result);

      if (result.success) {
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
        errors: [
          {
            error:
              error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidation(null);
    setImportResult(null);
    setPageCount(0);
    setMenuCount(0);
    setImportMode('skip');
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

  const canImport =
    Boolean(file) &&
    Boolean(validation?.valid) &&
    !isImporting &&
    !isValidating;
  const hasErrors = Boolean(validation && !validation.valid);
  const hasWarnings = Boolean(
    validation?.warnings && validation.warnings.length > 0
  );

  const formatValidationError = (e: {
    message: string;
    pageIndex?: number;
    menuItemIndex?: number;
  }) => {
    if (e.pageIndex != null) return `Page ${e.pageIndex + 1}: ${e.message}`;
    if (e.menuItemIndex != null)
      return `Menu item ${e.menuItemIndex + 1}: ${e.message}`;
    return e.message;
  };

  const formatResultError = (e: PagesImportResult['errors'][number]) => {
    if (e.pageIndex != null) return `Page ${e.pageIndex + 1}: ${e.error}`;
    if (e.menuItemIndex != null)
      return `Menu item ${e.menuItemIndex + 1}: ${e.error}`;
    return e.error;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Pages &amp; Menu</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select JSON File</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pages-import-file"
                  disabled={isImporting || isValidating}
                />
                <label htmlFor="pages-import-file">
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

            {isValidating && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validating file...</span>
              </div>
            )}

            {validation && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 ${validation.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
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
                              <li
                                key={idx}
                                className="text-red-600 dark:text-red-400"
                              >
                                {formatValidationError(error)}
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
                                {warning.pageIndex != null
                                  ? `Page ${warning.pageIndex + 1}: `
                                  : ''}
                                {warning.menuItemIndex != null
                                  ? `Menu item ${warning.menuItemIndex + 1}: `
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

                {validation.valid && file && (pageCount > 0 || menuCount > 0) && (
                  <div className="text-sm text-muted-foreground">
                    Found {pageCount} page{pageCount !== 1 ? 's' : ''},{' '}
                    {menuCount} menu item{menuCount !== 1 ? 's' : ''} to import
                  </div>
                )}
              </div>
            )}

            {validation?.valid && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import Mode</Label>
                  <RadioGroup
                    value={importMode}
                    onValueChange={(v) => setImportMode(v as PagesImportMode)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="pm-skip" />
                      <Label
                        htmlFor="pm-skip"
                        className="font-normal cursor-pointer"
                      >
                        Skip Existing – skip pages/menu items that already exist
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overwrite" id="pm-overwrite" />
                      <Label
                        htmlFor="pm-overwrite"
                        className="font-normal cursor-pointer"
                      >
                        Overwrite – replace existing with imported data
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="merge" id="pm-merge" />
                      <Label
                        htmlFor="pm-merge"
                        className="font-normal cursor-pointer"
                      >
                        Merge – merge imported data with existing
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing pages and menu…</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {importResult && (
              <Card
                className={
                  importResult.success
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-red-200 dark:border-red-800'
                }
              >
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div
                      className={`flex items-center gap-2 font-medium ${importResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {importResult.success ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <span>
                        Import {importResult.success ? 'Completed' : 'Failed'}
                      </span>
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
                              <li
                                key={idx}
                                className="text-red-600 dark:text-red-400"
                              >
                                {formatResultError(error)}
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

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={!canImport}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Pages & Menu'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
