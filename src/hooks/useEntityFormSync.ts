import { useState, useEffect, useCallback, useRef } from 'react';
import type { EntityType } from '@/types/entitySchema';
import { formToJson, jsonToForm, mergeJsonWithForm, getFormJsonDiff } from '@/lib/entityJson/transformers';

interface UseEntityFormSyncOptions {
  entityType: EntityType;
  initialFormData?: Record<string, unknown>;
  initialJsonData?: Record<string, unknown>;
  onFormChange?: (formData: Record<string, unknown>) => void;
  onJsonChange?: (jsonData: Record<string, unknown>) => void;
  syncMode?: 'bidirectional' | 'form-to-json' | 'json-to-form';
}

export function useEntityFormSync({
  entityType,
  initialFormData = {},
  initialJsonData = {},
  onFormChange,
  onJsonChange,
  syncMode = 'bidirectional',
}: UseEntityFormSyncOptions) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormData);
  const [jsonData, setJsonData] = useState<Record<string, unknown>>(initialJsonData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  
  // Track last update source to prevent sync loops
  const lastUpdateSourceRef = useRef<'form' | 'json' | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from props
  useEffect(() => {
    if (Object.keys(initialFormData).length > 0) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  useEffect(() => {
    if (Object.keys(initialJsonData).length > 0) {
      setJsonData(initialJsonData);
    }
  }, [initialJsonData]);

  // Check for conflicts
  useEffect(() => {
    const diff = getFormJsonDiff(formData, jsonData);
    setHasConflict(diff.different.length > 0 || diff.formOnly.length > 0 || diff.jsonOnly.length > 0);
  }, [formData, jsonData]);

  // Sync form to JSON
  const syncFormToJson = useCallback((newFormData: Record<string, unknown>) => {
    if (lastUpdateSourceRef.current === 'form') {
      return; // Prevent loop
    }

    setIsSyncing(true);
    lastUpdateSourceRef.current = 'form';

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const newJsonData = formToJson(entityType, newFormData);
      setJsonData(newJsonData);
      if (onJsonChange) {
        onJsonChange(newJsonData);
      }
      setIsSyncing(false);
      lastUpdateSourceRef.current = null;
    }, 300); // Debounce sync
  }, [entityType, onJsonChange]);

  // Sync JSON to form
  const syncJsonToForm = useCallback((newJsonData: Record<string, unknown>) => {
    if (lastUpdateSourceRef.current === 'json') {
      return; // Prevent loop
    }

    setIsSyncing(true);
    lastUpdateSourceRef.current = 'json';

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const newFormData = jsonToForm(entityType, newJsonData);
      setFormData(newFormData);
      if (onFormChange) {
        onFormChange(newFormData);
      }
      setIsSyncing(false);
      lastUpdateSourceRef.current = null;
    }, 300); // Debounce sync
  }, [entityType, onFormChange]);

  // Update form data
  const updateFormData = useCallback((updates: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => {
    setFormData((prev) => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      
      // Sync to JSON if enabled
      if (syncMode === 'bidirectional' || syncMode === 'form-to-json') {
        syncFormToJson(newData);
      }
      
      if (onFormChange) {
        onFormChange(newData);
      }
      
      return newData;
    });
  }, [syncMode, syncFormToJson, onFormChange]);

  // Update JSON data
  const updateJsonData = useCallback((updates: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => {
    setJsonData((prev) => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      
      // Sync to form if enabled
      if (syncMode === 'bidirectional' || syncMode === 'json-to-form') {
        syncJsonToForm(newData);
      }
      
      if (onJsonChange) {
        onJsonChange(newData);
      }
      
      return newData;
    });
  }, [syncMode, syncJsonToForm, onJsonChange]);

  // Resolve conflict by choosing form or JSON as source of truth
  const resolveConflict = useCallback((source: 'form' | 'json') => {
    if (source === 'form') {
      syncFormToJson(formData);
    } else {
      syncJsonToForm(jsonData);
    }
    setHasConflict(false);
  }, [formData, jsonData, syncFormToJson, syncJsonToForm]);

  // Merge JSON into form (for partial JSON updates)
  const mergeJsonIntoForm = useCallback((jsonUpdates: Record<string, unknown>) => {
    const merged = mergeJsonWithForm(entityType, formData, jsonUpdates);
    setFormData(merged);
    if (onFormChange) {
      onFormChange(merged);
    }
  }, [entityType, formData, onFormChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    jsonData,
    isSyncing,
    hasConflict,
    updateFormData,
    updateJsonData,
    resolveConflict,
    mergeJsonIntoForm,
    syncFormToJson,
    syncJsonToForm,
  };
}
