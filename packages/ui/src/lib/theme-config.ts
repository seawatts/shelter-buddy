export interface ThemeConfig {
  colors: {
    accent: string;
    background?: string;
    border?: string;
    foreground?: string;
    muted?: string;
    primary: string;
    secondary: string;
  };
  darkMode?: {
    accent: string;
    background?: string;
    border?: string;
    foreground?: string;
    muted?: string;
    primary: string;
    secondary: string;
  };
}

// Predefined themes that shelters can use
export const PREDEFINED_THEMES = {
  calm: {
    config: {
      colors: {
        // Light Blue-Gray
        accent: "201 96% 42%",
        // Bright Blue
        background: "0 0% 100%",
        border: "220 13% 91%",
        foreground: "224 71.4% 4.1%",
        muted: "220 14.3% 95.9%",
        primary: "201 96% 32%",
        // Deep Blue
        secondary: "199 33% 90%",
      },
      darkMode: {
        accent: "201 96% 52%",
        background: "224 71.4% 4.1%",
        border: "220 13% 11%",
        foreground: "0 0% 100%",
        muted: "220 14.3% 15.9%",
        primary: "201 96% 42%",
        secondary: "199 33% 20%",
      },
    },
    name: "Calm & Professional",
  },
  nature: {
    config: {
      colors: {
        // Light Sage
        accent: "142 76% 46%",
        // Bright Green
        background: "0 0% 100%",
        border: "144 5.9% 90%",
        foreground: "144 10% 4.1%",
        muted: "140 4.8% 95.9%",
        primary: "142 76% 36%",
        // Forest Green
        secondary: "84 59% 90%",
      },
      darkMode: {
        accent: "142 76% 56%",
        background: "144 10% 4.1%",
        border: "144 5.9% 10%",
        foreground: "140 4.8% 95.9%",
        muted: "144 14.3% 15.9%",
        primary: "142 76% 46%",
        secondary: "84 59% 20%",
      },
    },
    name: "Natural & Earthy",
  },
  warm: {
    config: {
      colors: {
        // Light Yellow
        accent: "22 100% 60%",
        // Bright Orange
        background: "0 0% 100%",
        border: "20 5.9% 90%",
        foreground: "20 14.3% 4.1%",
        muted: "60 4.8% 95.9%",
        primary: "22 100% 50%",
        // Warm Orange
        secondary: "48 96% 89%",
      },
      darkMode: {
        accent: "22 100% 70%",
        background: "20 14.3% 4.1%",
        border: "20 5.9% 10%",
        foreground: "60 4.8% 95.9%",
        muted: "20 14.3% 15.9%",
        primary: "22 100% 60%",
        secondary: "48 96% 19%",
      },
    },
    name: "Warm & Welcoming",
  },
} as const;
