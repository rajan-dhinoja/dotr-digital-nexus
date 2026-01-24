import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { resolveIcon, getAvailableIconNames } from "@/lib/menuUtils";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface IconPickerProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function IconPicker({ 
  value, 
  onValueChange, 
  placeholder = "Select icon...",
  disabled = false 
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIcon = value ? resolveIcon(value) : null;
  const availableIcons = getAvailableIconNames();
  
  const filteredIcons = availableIcons.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    if (value === iconName) {
      // Deselect if clicking the same icon
      onValueChange(null);
    } else {
      onValueChange(iconName);
    }
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                {React.createElement(selectedIcon, { className: "h-4 w-4" })}
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {value && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search icons..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              {filteredIcons.map((iconName) => {
                const Icon = resolveIcon(iconName);
                const isSelected = value === iconName;
                
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => handleSelect(iconName)}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center",
                      isSelected && "text-primary"
                    )}>
                      {Icon && React.createElement(Icon, { className: "h-4 w-4" })}
                    </div>
                    <span className={cn(
                      "flex-1",
                      isSelected && "font-medium"
                    )}>
                      {iconName}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
