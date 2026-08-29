import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { App } from "./App";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./components/ui/toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
