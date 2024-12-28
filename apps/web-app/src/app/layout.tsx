import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { PostHogProvider } from "@acme/analytics/posthog/client";
import { AnalyticsProviders } from "@acme/analytics/providers";
import { cn } from "@acme/ui/lib/utils";

import "@acme/ui/globals.css";

import { SidebarProvider } from "@acme/ui/sidebar";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";
import { TooltipProvider } from "@acme/ui/tooltip";

import { AppSidebar } from "~/components/app-sidebar";
import { env } from "~/env";
import { getCurrentShelter } from "~/lib/shelter";

export const metadata: Metadata = {
  description: "ShelterBuddy is a tool for shelters to manage their animals",
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://shelterbuddy.vercel.app"
      : "http://localhost:3000",
  ),
  openGraph: {
    description: "ShelterBuddy is a tool for shelters to manage their animals",
    siteName: "ShelterBuddy",
    title: "ShelterBuddy",
    url: "https://shelterbuddy.vercel.app",
  },
  title: "ShelterBuddy",
  twitter: {
    card: "summary_large_image",
    creator: "@seawatts",
    site: "@seawatts",
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const shelter = (await getCurrentShelter()) ?? null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "relative min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ClerkProvider>
          <AnalyticsProviders identifyUser>
            <NuqsAdapter>
              <TooltipProvider>
                <PostHogProvider>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                  >
                    <SidebarProvider defaultOpen={defaultOpen}>
                      <AppSidebar shelter={shelter} />
                      <main className="flex-1">{props.children}</main>
                    </SidebarProvider>
                    <Toaster />
                  </ThemeProvider>
                </PostHogProvider>
              </TooltipProvider>
            </NuqsAdapter>
          </AnalyticsProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
