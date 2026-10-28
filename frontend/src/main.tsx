import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./vero.css";
import "./storefront.css";
import "./product-media.css";
import "./dark-mode.css";
import { applyShopTheme, readShopTheme } from "./hooks/useShopTheme";
import App from "./App.tsx";

// Apply the remembered theme before React renders to avoid a bright flash.
applyShopTheme(readShopTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
