"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selected, setSelected] = useState<number | null>(activeIndex ?? null);

  // Update selected when activeIndex changes
  useEffect(() => {
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
        "flex items-center gap-2 p-2 rounded-2xl bg-background/90 backdrop-blur-xl shadow-sm border border-border/40",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const tabItem = tab as Tab;
        const Icon = tabItem.icon;
        const isActive = selected === index;

        return (
          <motion.div
            key={tabItem.title}
            layout
            className={cn(
              "flex items-center justify-center rounded-xl cursor-pointer overflow-hidden h-[44px]",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
              isActive ? "flex-1" : "flex-none"
            )}
            onClick={() => handleSelect(index)}
            initial={false}
            animate={{
              width: isActive ? "auto" : 44,
              minWidth: isActive ? 120 : 44,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            <motion.div
              className="flex items-center justify-center h-[44px] px-3"
              initial={{ filter: "blur(10px)" }}
              animate={{ filter: "blur(0px)" }}
              exit={{ filter: "blur(10px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Icon className="flex-shrink-0 w-5 h-5" />
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="ml-2 font-medium text-sm whitespace-nowrap"
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ originX: 0 }}
                  >
                    {tabItem.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}