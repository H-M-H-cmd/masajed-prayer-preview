"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/providers/language-provider";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { MOSQUE_MENU_ITEMS } from "./menu-items";
import Link from "next/link";

export function MosqueMenu() {
  const { t, direction } = useLanguage();
  const params = useParams();
  const activeSegment = useSelectedLayoutSegment() || MOSQUE_MENU_ITEMS[0].id;
  
  return (
    <div className="sticky top-4 h-fit">
      <Tabs value={activeSegment}  dir={direction}>
        <TabsList className="flex h-auto flex-col space-y-2 bg-transparent p-6">
          {MOSQUE_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSegment === item.id;
            return ( item.is_active &&
              <Link 
                key={item.id}
                href={`/dashboard/mosques/${params.id}/${item.id}`}
                className="w-full"
              >
                <TabsTrigger
                  value={item.id}
                  className={`w-full gap-2 justify-start data-[state=active]:bg-primary/10 rounded-lg py-2 ${
                    isActive ? 'bg-primary/10' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.translationKey)}
                </TabsTrigger>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
} 