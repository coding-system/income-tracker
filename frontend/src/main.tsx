import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.scss";
import App from "./App.tsx";
import { applyTheme, getStoredTheme } from "./utils/theme";

const storedTheme = getStoredTheme();
if (storedTheme) {
   applyTheme(storedTheme);
}

createRoot(document.getElementById("root")!).render(
   <StrictMode>
      <BrowserRouter>
         <App />
      </BrowserRouter>
   </StrictMode>,
);
