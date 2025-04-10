
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/auth';
import WorkflowPage from './pages/WorkflowPage';

const App = () => {
  const { session } = useAuth();
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  React.useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsAuthReady(true);
    };

    checkAuth();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthReady) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <Routes>
          <Route
            path="/login"
            element={
              !session ? (
                <div>Login Page Placeholder</div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Home Page Placeholder</div>
              </ProtectedRoute>
            }
          />
          <Route path="/workflow" element={
            <ProtectedRoute>
              <WorkflowPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
