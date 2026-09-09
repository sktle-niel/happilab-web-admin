import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/frame.css";
import "./styles/dashboard.css";
import "./styles/lists.css";
import "./styles/products.css";
import "./styles/search.css";
import "./styles/support.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
