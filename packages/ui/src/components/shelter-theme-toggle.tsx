"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";

import type { ThemeConfig } from "../lib/theme-config";
import { PREDEFINED_THEMES } from "../lib/theme-config";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface ShelterThemeToggleProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => Promise<void>;
}

export function ShelterThemeToggle({
  currentTheme,
  onThemeChange,
}: ShelterThemeToggleProps) {
  const router = useRouter();
  const [isChanging, setIsChanging] = React.useState(false);
  const [themeConfig, setThemeConfig] =
    React.useState<ThemeConfig>(currentTheme);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<"preset" | "custom">(
    "preset",
  );

  const handleThemeChange = async () => {
    if (isChanging) return;

    try {
      setIsChanging(true);
      await onThemeChange(themeConfig);
      // Apply theme colors to CSS variables
      for (const [key, value] of Object.entries(themeConfig.colors)) {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
      if (themeConfig.darkMode) {
        for (const [key, value] of Object.entries(themeConfig.darkMode)) {
          document.documentElement.style.setProperty(`--${key}-dark`, value);
        }
      }
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update theme:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const updateColor = (mode: "light" | "dark", key: string, value: string) => {
    setThemeConfig((previous: ThemeConfig) => ({
      ...previous,
      [mode === "light" ? "colors" : "darkMode"]: {
        ...(mode === "light" ? previous.colors : (previous.darkMode ?? {})),
        [key]: value,
      },
    }));
  };

  const ColorInput = ({
    mode,
    colorKey,
    label,
  }: {
    mode: "light" | "dark";
    colorKey: string;
    label: string;
  }) => (
    <div className="grid gap-2">
      <Label htmlFor={`${mode}-${colorKey}`}>{label}</Label>
      <Input
        id={`${mode}-${colorKey}`}
        type="text"
        placeholder="220 90% 45%"
        value={
          mode === "light"
            ? (themeConfig.colors[
                colorKey as keyof typeof themeConfig.colors
              ] ?? "")
            : (themeConfig.darkMode?.[
                colorKey as keyof NonNullable<typeof themeConfig.darkMode>
              ] ?? "")
        }
        onChange={(event) => updateColor(mode, colorKey, event.target.value)}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Configure theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Theme Configuration</DialogTitle>
          <DialogDescription>
            Choose a predefined theme or customize your own colors.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Predefined Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4">
            <RadioGroup
              defaultValue="custom"
              onValueChange={(value) => {
                if (value !== "custom") {
                  setThemeConfig(
                    PREDEFINED_THEMES[value as keyof typeof PREDEFINED_THEMES]
                      .config,
                  );
                }
              }}
            >
              <div className="grid gap-4 py-4">
                {Object.entries(PREDEFINED_THEMES).map(([key, theme]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1">
                      {theme.name}
                    </Label>
                    <div
                      className="flex gap-2"
                      style={
                        {
                          "--preview-accent": `hsl(${theme.config.colors.accent})`,
                          "--preview-primary": `hsl(${theme.config.colors.primary})`,
                          "--preview-secondary": `hsl(${theme.config.colors.secondary})`,
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ background: "var(--preview-primary)" }}
                      />
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ background: "var(--preview-secondary)" }}
                      />
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ background: "var(--preview-accent)" }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom Theme</Label>
                </div>
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Tabs defaultValue="light" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="light">Light Mode</TabsTrigger>
                <TabsTrigger value="dark">Dark Mode</TabsTrigger>
              </TabsList>
              <TabsContent value="light" className="space-y-4">
                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <ColorInput
                    mode="light"
                    colorKey="primary"
                    label="Primary Color"
                  />
                  <ColorInput
                    mode="light"
                    colorKey="secondary"
                    label="Secondary Color"
                  />
                  <ColorInput
                    mode="light"
                    colorKey="accent"
                    label="Accent Color"
                  />
                  <ColorInput
                    mode="light"
                    colorKey="background"
                    label="Background Color"
                  />
                </div>
              </TabsContent>
              <TabsContent value="dark" className="space-y-4">
                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <ColorInput
                    mode="dark"
                    colorKey="primary"
                    label="Primary Color"
                  />
                  <ColorInput
                    mode="dark"
                    colorKey="secondary"
                    label="Secondary Color"
                  />
                  <ColorInput
                    mode="dark"
                    colorKey="accent"
                    label="Accent Color"
                  />
                  <ColorInput
                    mode="dark"
                    colorKey="background"
                    label="Background Color"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleThemeChange}
            disabled={isChanging}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
