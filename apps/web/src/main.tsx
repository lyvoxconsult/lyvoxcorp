import "@fontsource/cormorant-sc/latin-600.css";
import "@fontsource/cormorant-sc/latin-ext-600.css";
import "@fontsource/cormorant-sc/latin-700.css";
import "@fontsource/cormorant-sc/latin-ext-700.css";
import "@fontsource/alegreya-sc/latin-500.css";
import "@fontsource/alegreya-sc/latin-ext-500.css";
import "@fontsource/alegreya-sc/latin-700.css";
import "@fontsource/alegreya-sc/latin-ext-700.css";
import "@fontsource/rasa/latin-400.css";
import "@fontsource/rasa/latin-ext-400.css";
import "@fontsource/rasa/latin-600.css";
import "@fontsource/rasa/latin-ext-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-ext-400.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { SessionProvider } from "./auth/session-context";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><SessionProvider><App /></SessionProvider></BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
