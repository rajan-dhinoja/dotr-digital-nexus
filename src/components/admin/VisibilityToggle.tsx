import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';

interface VisibilityToggleProps {
  isActive: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  showBadge?: boolean;
}

export function VisibilityToggle({ 
  isActive, 
  onToggle, 
  disabled = false,
  showBadge = true 
}: VisibilityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      {showBadge && (
        <Badge variant={isActive ? 'default' : 'secondary'} className="gap-1">
          {isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {isActive ? 'Visible' : 'Hidden'}
        </Badge>
      )}
    </div>
  );
}

export function VisibilityBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'} className="gap-1">
      {isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {isActive ? 'Visible' : 'Hidden'}
    </Badge>
  );
}
