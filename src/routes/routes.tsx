
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import PayrollSettings from "@/pages/PayrollSettings";

const routes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('@/pages/Dashboard')),
  },
  {
    path: '/attendance',
    Component: lazy(() => import('@/pages/Attendance')),
  },
  {
    path: '/people',
    Component: lazy(() => import('@/pages/People')),
  },
  {
    path: '/payroll',
    Component: lazy(() => import('@/pages/PayrollDashboard')),
  },
  {
    path: '/payroll-settings',
    element: <PayrollSettings />,
  },
  {
    path: '/schedule',
    Component: lazy(() => import('@/pages/Schedule')),
  },
  {
    path: '/profile',
    Component: lazy(() => import('@/pages/Profile')),
  },
];

export const createAppRoutes = () => routes;
