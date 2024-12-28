"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@acme/ui/lib/utils";

import { ViewModeToggle } from "./view-mode-toggle";

function getCurrentShift(hour: number): {
  label: string;
  variant: "default" | "secondary" | "outline";
} {
  if (hour >= 5 && hour < 13) {
    return { label: "AM", variant: "default" };
  } else if (hour >= 13 && hour < 21) {
    return { label: "Mid Day", variant: "secondary" };
  } else {
    return { label: "Evening", variant: "outline" };
  }
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  const { currentShift, dayAndMonth, fullDate } = useMemo(() => {
    const now = new Date();
    return {
      currentShift: getCurrentShift(now.getHours()),
      dayAndMonth: now.toLocaleDateString("en-US", {
        weekday: "long",
      }),
      fullDate: now.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1
          className={cn(
            "font-bold transition-all duration-200",
            // isScrolled ? "text-2xl" : "text-3xl sm:text-4xl",
          )}
        >
          {dayAndMonth}, {currentShift.label}
        </h1>
        {!isScrolled && (
          <p className="mt-1 text-base text-muted-foreground sm:text-lg">
            {fullDate}
          </p>
        )}
      </div>
      <ViewModeToggle />
    </div>
  );
}
