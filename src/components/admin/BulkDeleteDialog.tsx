import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
  isLoading?: boolean;
  itemName?: string;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  isLoading = false,
  itemName = 'items',
}: BulkDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete {count} {itemName}?</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone. This will permanently delete the selected {itemName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : `Delete ${count} ${itemName}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
