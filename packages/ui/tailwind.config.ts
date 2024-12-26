/*
 * This file is not used for any compilation purpose, it is only used
 * for Tailwind Intellisense & Autocompletion in the source files
 */
import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config/web";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx"],
  presets: [baseConfig],
} satisfies Config;
