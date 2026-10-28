import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { dismissPrerender } from "./lib/prerender";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Safety net: if a route never hands over from the prerendered shell, reveal the app anyway
window.setTimeout(() => dismissPrerender(true), 8000);
