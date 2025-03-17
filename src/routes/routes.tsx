
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import People from '@/pages/People';
import NotFound from '@/pages/NotFound';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/people',
    element: <People />,
  },
  // Future routes to be implemented
  {
    path: '/hiring',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '/devices',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '/apps',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '/salary',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '/calendar',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '/reviews',
    element: <NotFound />, // Placeholder until implemented
  },
  {
    path: '*',
    element: <NotFound />,
  }
];
