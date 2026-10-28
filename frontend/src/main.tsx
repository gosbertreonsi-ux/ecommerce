import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./vero.css";
import "./storefront.css";
import "./product-media.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
