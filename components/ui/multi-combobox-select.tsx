"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "@/components/ui/badge";

export interface ComboboxItem {
  id: number;
  name: string;
  searchText?: string;
}

interface MultiComboboxSelectProps {
  value?: number[];
  onValueChange: (value: number[]) => void;
  items: ComboboxItem[];
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  loadingText?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch?: (value: string) => void;
}

const CommandLoadingState = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {text}
  </div>
);

export function MultiComboboxSelect({
  value = [],
  onValueChange,
  items = [],
  placeholder,
  isLoading = false,
  disabled = false,
  error,
  searchPlaceholder,
  noResultsText,
  loadingText,
  hasMore,
  onLoadMore,
  onSearch,
}: MultiComboboxSelectProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const commandListRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.searchText 
        ? item.searchText.toLowerCase().includes(query)
        : item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const selectedItems = React.useMemo(
    () => items.filter((item) => value.includes(item.id)),
    [items, value]
  );

  const toggleItem = (itemId: number) => {
    const newValue = value.includes(itemId)
      ? value.filter(id => id !== itemId)
      : [...value, itemId];
    onValueChange(newValue);
  };

  const removeItem = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter(id => id !== itemId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-10 h-auto",
            "px-3 py-2",
            !value.length && "text-muted-foreground",
            error && "border-destructive",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          <div className="flex flex-wrap gap-1 pe-2 items-center">
            {selectedItems.length > 0 ? (
              selectedItems.map(item => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="me-1 mb-1 max-w-[calc(100%-2rem)]"
                >
                  <span className="truncate">{item.name}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 shrink-0 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeItem(item.id, e as unknown as React.MouseEvent);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => removeItem(item.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[var(--radix-popover-trigger-width)]" 
        align="start"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <Command shouldFilter={false} className={cn(
          language === 'ar' && "[&_[cmdk-item]]:rtl [&_[cmdk-input]]:rtl"
        )}>
          <CommandInput
            placeholder={searchPlaceholder || t('common.search')}
            value={searchQuery}
            onValueChange={(value) => {
              setSearchQuery(value);
              onSearch?.(value);
            }}
            disabled={isLoading}
            className={cn(
              "border-none focus:ring-0 px-2 text-start",
            )}
          />
          <CommandList 
            ref={commandListRef}
            className="max-h-[200px] overflow-auto"
            onScroll={(e) => {
              const target = e.currentTarget;
              if (
                hasMore &&
                !isLoading &&
                target.scrollHeight - target.scrollTop === target.clientHeight
              ) {
                onLoadMore?.();
              }
            }}
          >
            <CommandEmpty>{noResultsText || t('common.noResults')}</CommandEmpty>
            {isLoading && filteredItems.length === 0 ? (
              <CommandLoadingState text={loadingText || t('common.loading')} />
            ) : (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.searchText || item.name}
                    onSelect={() => toggleItem(item.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        language === 'ar' ? "ml-2" : "mr-2",
                        value.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 