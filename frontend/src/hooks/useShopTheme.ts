import { useEffect, useState } from "react";

export type ShopTheme = "light" | "dark";

const STORAGE_KEY = "eshop-theme";

/** Light stays the default. A visitor's explicit choice is remembered. */
export function readShopTheme(): ShopTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyShopTheme(theme: ShopTheme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private-browsing or restricted storage: theme still works for this page.
  }
}

export function useShopTheme() {
  const [theme, setTheme] = useState<ShopTheme>(readShopTheme);

  useEffect(() => {
    applyShopTheme(theme);
  }, [theme]);

  useEffect(() => {
    function syncTabs(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setTheme(event.newValue === "dark" ? "dark" : "light");
      }
    }
    window.addEventListener("storage", syncTabs);
    return () => window.removeEventListener("storage", syncTabs);
  }, []);

  return {
    theme,
    toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
  };
}
