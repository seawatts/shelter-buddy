"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { WalkTypeWithRelations } from "@acme/db/schema";
import { cn } from "@acme/ui/lib/utils";

import { DIFFICULTY_CONFIG } from "../../../_utils/difficulty-config";
import { BackIcon } from "./icons";

interface WalkHeaderProps {
  walk: WalkTypeWithRelations;
}

export function WalkHeader({ walk }: WalkHeaderProps) {
  const { animal } = walk;
  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b bg-background transition-all duration-200",
        isScrolled ? "h-14" : "h-24 sm:h-24",
      )}
    >
      <div className="container h-full max-w-3xl">
        <div className="flex h-full items-center gap-4">
          <Link
            href={`/animals`}
            className="text-muted-foreground hover:text-foreground"
          >
            <BackIcon />
          </Link>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1
                className={cn(
                  "font-bold transition-all duration-200",
                  isScrolled ? "text-2xl" : "text-3xl",
                )}
              >
                {walk.animal.name}
              </h1>
              {!isScrolled && (
                <p className="text-sm text-muted-foreground">
                  Walk in progress...
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex gap-2",
                isScrolled
                  ? "flex-row items-center"
                  : "flex-col sm:flex-row sm:items-center",
              )}
            >
              <div className="rounded-full bg-secondary px-3 py-1 text-center text-sm font-medium">
                {walk.animal.name}
              </div>
              <div
                className="rounded-full px-3 py-1 text-center text-sm font-medium"
                style={{
                  backgroundColor: difficultyConfig.color,
                  color: "white",
                }}
              >
                {difficultyConfig.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
