"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Icon as TablerIcon } from '@tabler/icons-react';

interface Tab {
  title: string;
  icon: TablerIcon;
  href?: string;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  activeIndex?: number | null;
  onChange?: (index: number | null, tab?: Tab) => void;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  activeIndex,
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(activeIndex ?? null);

  // Update selected when activeIndex changes
  React.useEffect(() => {
    setSelected(activeIndex ?? null);
  }, [activeIndex]);

  const handleSelect = (index: number) => {
    const tab = tabs[index];
    if (tab.type === "separator") return;

    setSelected(index);
    onChange?.(index, tab);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      className={cn(
        "flex items-center w-full gap-1 rounded-2xl bg-background/90 backdrop-blur-xl p-1 shadow-sm border border-border/40",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const tabItem = tab as Tab;
        const Icon = tabItem.icon;
        return (
          <button
            key={tabItem.title}
            onClick={() => handleSelect(index)}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium flex-1 min-w-0 transition-colors",
              selected === index
                ? cn("bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5", activeColor)
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="whitespace-nowrap text-sm font-medium">
              {tabItem.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}