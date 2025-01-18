"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

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
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

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

  const handleSignOut = async () => {
    await signOut();
  };

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

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-8 rounded-full">
              <Avatar className="size-8">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName ?? "User avatar"}
                />
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="flex flex-col items-start">
              <div className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icons.SunMedium className="mr-2 size-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Icons.SunMedium className="mr-2 size-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Icons.Moon className="mr-2 size-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Icons.Laptop className="mr-2 size-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={handleSignOut}>
              <Icons.LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
