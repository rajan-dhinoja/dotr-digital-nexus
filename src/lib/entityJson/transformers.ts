import type { EntityType } from '@/types/entitySchema';

/**
 * Transform form data to JSON representation
 */
export function formToJson(
  entityType: EntityType,
  formData: Record<string, unknown>
): Record<string, unknown> {
  // Base transformation - can be extended per entity type
  const json: Record<string, unknown> = {};

  // Copy all form fields to JSON
  Object.keys(formData).forEach((key) => {
    const value = formData[key];
    
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
      return; // Skip empty values
    }

    // Handle arrays and objects
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      json[key] = value;
    } else {
      json[key] = value;
    }
  });

  return json;
}

/**
 * Transform JSON to form data
 */
export function jsonToForm(
  entityType: EntityType,
  jsonData: Record<string, unknown>
): Record<string, unknown> {
  // Base transformation - can be extended per entity type
  const formData: Record<string, unknown> = {};

  // Copy all JSON fields to form
  Object.keys(jsonData).forEach((key) => {
    const value = jsonData[key];
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      formData[key] = '';
      return;
    }

    // Preserve arrays and objects
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      formData[key] = value;
    } else {
      formData[key] = value;
    }
  });

  return formData;
}

/**
 * Merge JSON data with existing form data (for partial updates)
 */
export function mergeJsonWithForm(
  entityType: EntityType,
  formData: Record<string, unknown>,
  jsonData: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...formData,
    ...jsonToForm(entityType, jsonData),
  };
}

/**
 * Get fields that differ between form and JSON
 */
export function getFormJsonDiff(
  formData: Record<string, unknown>,
  jsonData: Record<string, unknown>
): {
  formOnly: string[];
  jsonOnly: string[];
  different: string[];
} {
  const formKeys = new Set(Object.keys(formData));
  const jsonKeys = new Set(Object.keys(jsonData));

  const formOnly: string[] = [];
  const jsonOnly: string[] = [];
  const different: string[] = [];

  formKeys.forEach((key) => {
    if (!jsonKeys.has(key)) {
      formOnly.push(key);
    } else {
      const formVal = JSON.stringify(formData[key]);
      const jsonVal = JSON.stringify(jsonData[key]);
      if (formVal !== jsonVal) {
        different.push(key);
      }
    }
  });

  jsonKeys.forEach((key) => {
    if (!formKeys.has(key)) {
      jsonOnly.push(key);
    }
  });

  return { formOnly, jsonOnly, different };
}
