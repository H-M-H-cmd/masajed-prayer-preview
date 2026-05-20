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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export interface ComboboxItem {
  id: string | number;
  name: string;
  searchText?: string; // Optional search text that includes both languages
}

interface ComboboxSelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
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

// Create a custom loading component
const CommandLoadingState = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {text}
  </div>
);

export function ComboboxSelect({
  value,
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
}: ComboboxSelectProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const commandListRef = React.useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.searchText 
        ? item.searchText.toLowerCase().includes(query)
        : item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const selectedItem = React.useMemo(
    () => items.find((item) => String(item.id) === String(value)),
    [items, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            error && "border-destructive",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span className="truncate">
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              "border-none focus:ring-0 px-2 text-start"
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
                    value={String(item.id)}
                    onSelect={() => {
                      onValueChange(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        language === 'ar' ? "ml-2" : "mr-2",
                        String(value) === String(item.id) ? "opacity-100" : "opacity-0"
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