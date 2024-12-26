"use client";

import { useEffect, useState } from "react";

import { cn } from "@acme/ui/lib/utils";

import { ViewModeToggle } from "./view-mode-toggle";

interface HeaderProps {
  dayAndMonth: string;
  fullDate: string;
  currentShift: {
    label: string;
    variant: "default" | "secondary" | "outline";
  };
}

export function Header({ dayAndMonth, fullDate, currentShift }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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
