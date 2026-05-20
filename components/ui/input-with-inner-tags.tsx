"use client";

import { Label } from "@/components/ui/label";
import { Tag, TagInput } from "emblor";
import { useState, useEffect } from "react";

interface InputTagsProps {
  value: { id: string; text: string }[];
  onChange: (tags: { id: string; text: string }[]) => void;
  label?: string;
  placeholder?: string;
}

function InputTags({ value, onChange, label = "Input with inner tags", placeholder = "Add a tag" }: InputTagsProps) {
  const [exampleTags, setExampleTags] = useState<Tag[]>(value);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  useEffect(() => {
    if (JSON.stringify(exampleTags) !== JSON.stringify(value)) {
      setExampleTags(value);
    }
  }, [value, exampleTags]);

  useEffect(() => {
    onChange(exampleTags);
  }, [exampleTags, onChange]);

  return (
    <div className="space-y-4">
      <Label htmlFor="input-57">{label}</Label>
      <TagInput
        id="input-57"
        tags={exampleTags}
        setTags={setExampleTags}
        placeholder={placeholder}
        styleClasses={{
          inlineTagsContainer:
            "border-input rounded-lg bg-background shadow-sm shadow-black/5 transition-shadow focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20 p-1 gap-1",
          input: "w-full min-w-[80px] focus-visible:outline-none shadow-none px-2 h-7",
          tag: {
            body: "h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7 flex",
            closeButton:
              "absolute -inset-y-px -end-px p-0 rounded-e-lg flex size-7 transition-colors outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground/80 hover:text-foreground",
          },
        }}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
      />
    </div>
  );
}

export { InputTags };
