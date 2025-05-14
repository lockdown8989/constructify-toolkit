
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/auth';
import App from './App.tsx';
import './index.css';

// Create the root and render the app
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
