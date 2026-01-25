import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { resolveIcon, getAvailableIconNames } from "@/lib/menuUtils";
import { cn } from "@/lib/utils";
import { Check, X, Search } from "lucide-react";

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
      <PopoverContent className="w-[90vw] sm:w-[500px] md:w-[600px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* Icons grid */}
          <div className="p-3 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No icons found.
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {filteredIcons.map((iconName) => {
                  const Icon = resolveIcon(iconName);
                  const isSelected = value === iconName;
                  
                  if (!Icon) return null;
                  
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={cn(
                        "relative flex items-center justify-center h-10 w-10 rounded-lg transition-all",
                        "hover:bg-accent hover:scale-110",
                        "active:scale-95",
                        isSelected 
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                          : "bg-muted/50 text-foreground"
                      )}
                      title={iconName}
                    >
                      {React.createElement(Icon, { className: "h-5 w-5" })}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
