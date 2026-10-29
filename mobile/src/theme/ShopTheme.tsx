import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

const colors = {
  dark: {
    background: "#060608",
    card: "#141418",
    surface: "#101014",
    text: "#EEEFF3",
    muted: "#A9A9B5",
    border: "#33333D",
    button: "#E2E2EA",
    buttonText: "#09090B",
  },
  light: {
    background: "#F7F4EF",
    card: "#FDFBF8",
    surface: "#EFEAE2",
    text: "#1C1A17",
    muted: "#6F6A62",
    border: "#DDD7CC",
    button: "#1C1A17",
    buttonText: "#FBF9F5",
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
