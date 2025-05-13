
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/auth';
import App from './App.tsx';
import './index.css';

// Make sure AuthProvider wraps everything to fix the "useAuth must be used within an AuthProvider" error
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
