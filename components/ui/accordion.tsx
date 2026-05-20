'use client';
import {
  motion,
  AnimatePresence,
  Transition,
  Variants,
  Variant,
  MotionConfig,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import React, { useContext, useState, ReactNode } from 'react';
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: "single" | "multiple";
  expandedValues: React.Key[];
  toggleItem: (value: React.Key) => void;
  variants?: {
    expanded: Variant;
    collapsed: Variant;
  };
  sidebarState?: {
    open: boolean;
    onOpen?: () => void;
  };
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
}

type AccordionProviderProps = {
  children: ReactNode;
  type: AccordionType;
  variants?: { expanded: Variant; collapsed: Variant };
  expandedValues?: React.Key[];
  onValuesChange?: (values: React.Key[]) => void;
  sidebarState?: {
    open: boolean;
    onOpen?: () => void;
  };
};

function AccordionProvider({
  children,
  type,
  variants,
  expandedValues: externalExpandedValues,
  onValuesChange,
  sidebarState,
}: AccordionProviderProps) {
  const [internalExpandedValues, setInternalExpandedValues] = useState<React.Key[]>([]);

  const expandedValues =
    externalExpandedValues !== undefined
      ? externalExpandedValues
      : internalExpandedValues;

  const toggleItem = (value: React.Key) => {
    const newValues = type === 'single'
      ? expandedValues.includes(value) ? [] : [value]
      : expandedValues.includes(value)
      ? expandedValues.filter((v) => v !== value)
      : [...expandedValues, value];

    if (onValuesChange) {
      onValuesChange(newValues);
    } else {
      setInternalExpandedValues(newValues);
    }
  };

  const contextValue: AccordionContextValue = {
    type,
    expandedValues,
    toggleItem,
    variants,
    sidebarState,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      {children}
    </AccordionContext.Provider>
  );
}

type AccordionProps = {
  children: ReactNode;
  className?: string;
  transition?: Transition;
  variants?: { expanded: Variant; collapsed: Variant };
  type: AccordionType;
  collapsible?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  expandedValues?: React.Key[];
  onValuesChange?: (values: React.Key[]) => void;
  sidebarState?: {
    open: boolean;
    onOpen?: () => void;
  };
};

function Accordion({
  children,
  className,
  transition,
  variants,
  type = 'single',
  value,
  onValueChange,
  expandedValues,
  onValuesChange,
  sidebarState,
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(value);
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const currentValue = value !== undefined ? value : internalValue;
  const currentExpandedValues = expandedValues || (currentValue ? [currentValue] : []);
  const currentOnValuesChange = onValuesChange || ((values: React.Key[]) => {
    handleValueChange(values[0]?.toString() || '');
  });

  return (
    <MotionConfig transition={transition}>
      <div className={cn('relative', className)} aria-orientation='vertical'>
        <AccordionProvider
          type={type}
          variants={variants}
          expandedValues={currentExpandedValues}
          onValuesChange={currentOnValuesChange}
          sidebarState={sidebarState}
        >
          {children}
        </AccordionProvider>
      </div>
    </MotionConfig>
  );
}

type AccordionItemProps = {
  value: React.Key;
  children: ReactNode;
  className?: string;
};

interface AccordionChildProps {
  value?: React.Key;
  expanded?: boolean;
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedValues } = useAccordion();
  const isExpanded = expandedValues.includes(value);

  return (
    <div
      className={cn('overflow-hidden', className)}
      data-state={isExpanded ? 'expanded' : 'collapsed'}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<AccordionChildProps>, {
            value,
            expanded: isExpanded,
          });
        }
        return child;
      })}
    </div>
  );
}

type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
  value?: React.Key;
  onClick?: () => void;
};

function AccordionTrigger({
  children,
  className,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const { toggleItem, expandedValues, sidebarState } = useAccordion();
  const { language } = useLanguage();
  const value = (props as { value?: React.Key }).value;
  const isExpanded = value !== undefined && expandedValues.includes(value);

  const handleClick = () => {
    if (value !== undefined) {
      if (sidebarState && !sidebarState.open && sidebarState.onOpen) {
        sidebarState.onOpen();
      }
      toggleItem(value);
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      aria-expanded={isExpanded}
      type='button'
      className={cn('group w-full flex items-center', className)}
      data-state={isExpanded ? 'expanded' : 'collapsed'}
    >
      {children}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{
          opacity: sidebarState?.open ? 1 : 0,
          width: sidebarState?.open ? "auto" : 0,
        }}
        transition={{
          duration: 0.2,
          delay: sidebarState?.open ? 0.1 : 0
        }}
      >
        <ChevronRight 
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            language === 'ar' ? "mr-2" : "ml-2",
            language === 'ar' 
              ? [
                  "rotate-180",
                  "group-data-[state=expanded]:rotate-[270deg]"
                ]
              : "group-data-[state=expanded]:rotate-90"
          )} 
        />
      </motion.div>
    </button>
  );
}

type AccordionContentProps = {
  children: ReactNode;
  className?: string;
  value?: React.Key;
};

function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps) {
  const { expandedValues, variants, sidebarState } = useAccordion();
  const value = (props as { value?: React.Key }).value;
  const isExpanded = value !== undefined && expandedValues.includes(value) && sidebarState?.open;

  const BASE_VARIANTS: Variants = {
    expanded: { height: 'auto', opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  };

  const combinedVariants = {
    expanded: { ...BASE_VARIANTS.expanded, ...variants?.expanded },
    collapsed: { ...BASE_VARIANTS.collapsed, ...variants?.collapsed },
  };

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial='collapsed'
          animate='expanded'
          exit='collapsed'
          variants={combinedVariants}
          className={className}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
