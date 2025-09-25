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
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  animate: (isSelected: boolean) => ({
    paddingLeft: isSelected ? "12px" : "8px",
    paddingRight: isSelected ? "12px" : "8px",
  }),
};

const spanVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    x: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: 10,
  },
};

const spanTransition = {
  opacity: { duration: 0.2 },
  scale: { type: "spring" as const, stiffness: 400, damping: 25 },
  x: { type: "spring" as const, stiffness: 400, damping: 25 },
};

const transition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
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
        "flex items-center w-full gap-1 rounded-xl bg-background/90 backdrop-blur-xl p-1 shadow-sm border border-border/40",
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
              "relative flex items-center justify-center rounded-lg py-2 text-sm font-medium flex-1 min-w-0",
              selected === index
                ? cn("bg-background text-foreground shadow-sm", activeColor)
                : "text-muted-foreground hover:text-foreground hover:bg-background/30"
            )}
            style={{
              transition: "all 0.2s ease"
            }}
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={spanTransition}
                  className="ml-1.5 whitespace-nowrap text-sm font-medium"
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