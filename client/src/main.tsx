import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Applies the saved light/dark theme before the first render.
import "./lib/theme";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
