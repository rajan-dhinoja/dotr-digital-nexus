import { useMemo } from 'react';
import type { EntityType } from '@/types/entitySchema';
import { getEntitySchema } from '@/lib/entitySchemas';
import type { EntitySchema } from '@/types/entitySchema';

export function useEntitySchema(entityType: EntityType): EntitySchema | null {
  return useMemo(() => {
    return getEntitySchema(entityType);
  }, [entityType]);
}
