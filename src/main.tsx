import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { CosmeticsProvider } from "@/providers/cosmetics-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { SaveProvider } from "@/providers/save-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "@/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <SettingsProvider>
          <CosmeticsProvider>
            <SaveProvider>
              <App />
            </SaveProvider>
          </CosmeticsProvider>
        </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
