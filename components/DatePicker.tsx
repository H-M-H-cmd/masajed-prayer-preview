"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useId } from "react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const DatePicker = ({
  className,
  date,
  setDate,
  label,
  placeHolder = "Pick a date",
}: {
  className?: string;
  date?: string;
  setDate: (date: string | undefined) => void;
  label?: string;
  placeHolder?: string;
}) => {
  const id = useId();
  const { language } = useLanguage();

  const formatDate = (date: string) => {
    return format(parseISO(date), "PPP", { locale: language === 'ar' ? ar : undefined });
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className={cn(
                "group w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20",
                !date && "text-muted-foreground"
              )}
            >
              <span className={cn("truncate", !date && "text-muted-foreground")}>
                {date ? formatDate(date) : placeHolder}
              </span>
              <CalendarIcon
                size={16}
                strokeWidth={2}
                className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar 
              mode="single" 
              selected={date ? parseISO(date) : undefined} 
              onSelect={(selectedDate) => setDate(selectedDate ? selectedDate.toISOString() : undefined)}
              initialFocus 
              locale={language === 'ar' ? ar : undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
