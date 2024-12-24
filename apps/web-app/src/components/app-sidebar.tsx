"use client";

import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  LayoutDashboard,
  Sparkles,
  User2,
} from "lucide-react";

import type { ShelterType } from "@acme/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Icons } from "@acme/ui/icons";
import { ShelterThemeToggle } from "@acme/ui/shelter-theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@acme/ui/sidebar";

import { updateShelterTheme } from "~/lib/shelter";

interface AppSidebarProps {
  shelter: ShelterType | null;
}

export function AppSidebar({ shelter }: AppSidebarProps) {
  const pathname = usePathname();

  const handleThemeChange = async (themeConfig: ShelterType["themeConfig"]) => {
    if (!shelter) return;
    await updateShelterTheme(shelter.id, themeConfig);
  };

  const monitoringItems = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      url: `/shelters`,
    },
  ];

  const developmentItems = [
    {
      icon: Sparkles,
      title: "Volunteers",
      url: `/volunteers`,
    },
    {
      icon: Bot,
      title: "Animals",
      url: `/animals`,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center gap-2">
        <SidebarTrigger className="h-8 w-8" />
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {shelter?.name ?? "ShelterBuddy"}
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Acme Inc</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Acme Corp.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitoringItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url === pathname}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Develop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developmentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url === pathname}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://docs.boundary.ml"
                target="_blank"
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  <span>Docs</span>
                </span>
                <ExternalLink className="size-4" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://docs.boundary.ml"
                target="_blank"
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Code className="size-4 shrink-0" />
                  <span>API Reference</span>
                </span>
                <ExternalLink className="size-4" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://discord.gg/boundary"
                target="_blank"
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Icons.AlertCircle className="size-4" />
                  <span>Community</span>
                </span>
                <ExternalLink className="size-4" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> seawatts
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ShelterThemeToggle
              currentTheme={
                shelter?.themeConfig ?? {
                  colors: {
                    accent: "220 90% 75%",
                    background: "0 0% 100%",
                    border: "220 13% 91%",
                    foreground: "224 71.4% 4.1%",
                    muted: "220 14.3% 95.9%",
                    primary: "220 90% 45%",
                    secondary: "220 20% 92%",
                  },
                }
              }
              onThemeChange={handleThemeChange}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
