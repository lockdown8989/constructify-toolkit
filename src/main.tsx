
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/auth';
import App from './App.tsx';
import './index.css';

// Remove the BrowserRouter since it's already in the router created in routes.tsx
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
