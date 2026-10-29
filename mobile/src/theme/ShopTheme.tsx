import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/** Exact E-Shop website palette: frontend/src/vero.css and dark-mode.css. */
const colors = {
  dark: {
    background: "#060608", // --paper
    card: "#141418",       // --card
    surface: "#101014",    // --paper-deep
    text: "#eeedf1",       // --ink
    muted: "#aaa9b3",      // --muted
    border: "#303037",     // --line
    button: "#eeedf1",     // --ink
    buttonText: "#08080b", // --on-ink
  },
  light: {
    background: "#f7f4ef", // --paper
    card: "#fdfbf8",       // --card
    surface: "#efeae2",    // --paper-deep
    text: "#1c1a17",       // --ink
    muted: "#6f6a62",      // --muted
    border: "#ddd7cc",     // --line
    button: "#1c1a17",     // --ink
    buttonText: "#fbf9f5", // --on-ink
  },
} as const;

export type ShopTheme = keyof typeof colors;
export type ShopColors = (typeof colors)[ShopTheme];

type ThemeContextValue = {
  theme: ShopTheme;
  colors: ShopColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ShopThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ShopTheme>("dark");
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: colors[theme],
      toggleTheme: () => setTheme((previous) => previous === "dark" ? "light" : "dark"),
    }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useShopTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useShopTheme must be used inside ShopThemeProvider");
  return value;
}
