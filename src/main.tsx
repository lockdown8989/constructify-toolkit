
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './App';
import { router } from './routes/routes';
import './index.css';

// Create the root and render the app with proper provider hierarchy
createRoot(document.getElementById("root")!).render(
  <App>
    <RouterProvider router={router} />
  </App>
);
