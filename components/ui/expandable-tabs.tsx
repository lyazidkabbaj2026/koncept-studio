"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
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

const buttonVariants = {
  initial: {
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  animate: (isSelected: boolean) => ({
    paddingLeft: isSelected ? "20px" : "12px",
    paddingRight: isSelected ? "20px" : "12px",
  }),
};

const spanVariants = {
  initial: {
    width: 0,
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    width: "auto",
    opacity: 1,
    scale: 1,
    transition: {
      width: { type: "spring", stiffness: 600, damping: 30 },
      opacity: { duration: 0.15 },
      scale: { type: "spring", stiffness: 600, damping: 25 },
    }
  },
  exit: {
    width: 0,
    opacity: 0,
    scale: 0.8,
    transition: {
      width: { type: "spring", stiffness: 600, damping: 30 },
      opacity: { duration: 0.1 },
      scale: { type: "spring", stiffness: 600, damping: 25 },
    }
  },
};

const transition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
};

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  activeIndex,
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(activeIndex ?? null);
  const outsideClickRef = React.useRef(null);

  // Update selected when activeIndex changes
  React.useEffect(() => {
    setSelected(activeIndex ?? null);
  }, [activeIndex]);

  useOnClickOutside(outsideClickRef, () => {
    // Don't reset selection if activeIndex is provided (route-controlled)
    if (activeIndex === undefined) {
      setSelected(null);
      onChange?.(null);
    }
  });

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
      ref={outsideClickRef}
      className={cn(
        "flex items-center w-full gap-0.5 rounded-2xl bg-background/80 backdrop-blur-xl p-1.5 shadow-sm border border-border/50 overflow-visible",
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
          <motion.button
            key={tabItem.title}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center justify-center rounded-xl py-2.5 text-sm font-medium min-w-0 flex-1 overflow-visible",
              selected === index
                ? cn("bg-background text-foreground shadow-md ring-1 ring-black/5 dark:ring-white/10", activeColor)
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            style={{
              transition: "color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease"
            }}
          >
            <Icon size={20} className="flex-shrink-0" />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="ml-2 whitespace-nowrap text-sm font-medium"
                >
                  {tabItem.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}