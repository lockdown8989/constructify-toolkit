
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/core/ErrorBoundary";

// Silence debug logs in production to improve performance
if (import.meta.env.MODE === 'production') {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.time = noop as any;
  console.timeEnd = noop as any;
  console.trace = noop as any;
  console.group = noop as any;
  console.groupCollapsed = noop as any;
  console.groupEnd = noop as any;
  console.table = noop as any;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
