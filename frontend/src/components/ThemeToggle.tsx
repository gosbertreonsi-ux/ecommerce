import { Moon, Sun } from "lucide-react";
import { useShopTheme } from "../hooks/useShopTheme";

/** Works in the customer header and on admin pages. */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useShopTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-label="Dark mode"
      aria-checked={dark}
      title={dark ? "Switch to light mode" : "Switch to intense dark mode"}
      className="esh-theme-toggle"
      onClick={toggleTheme}
    >
      <span className="esh-theme-toggle__track" aria-hidden="true">
        <Sun className="esh-theme-toggle__symbol esh-theme-toggle__symbol--sun" size={16} />
        <Moon className="esh-theme-toggle__symbol esh-theme-toggle__symbol--moon" size={16} />
        <span className="esh-theme-toggle__thumb">
          {dark ? <Moon size={16} /> : <Sun size={16} />}
        </span>
      </span>
    </button>
  );
}
