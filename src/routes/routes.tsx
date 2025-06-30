import { lazy } from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { Error404 } from '@/pages/Error404';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteObject } from 'react-router-dom';
import PayrollSettings from "@/pages/PayrollSettings";

const routes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('@/pages/Home')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/about',
    Component: lazy(() => import('@/pages/About')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/contact',
    Component: lazy(() => import('@/pages/Contact')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/blog',
    Component: lazy(() => import('@/pages/Blog')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/blog/:id',
    Component: lazy(() => import('@/pages/BlogPost')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/login',
    Component: lazy(() => import('@/pages/Login')),
    exact: true,
  },
  {
    path: '/register',
    Component: lazy(() => import('@/pages/Register')),
    exact: true,
  },
  {
    path: '/forgot-password',
    Component: lazy(() => import('@/pages/ForgotPassword')),
    exact: true,
  },
  {
    path: '/reset-password',
    Component: lazy(() => import('@/pages/ResetPassword')),
    exact: true,
  },
  {
    path: '/profile',
    Component: lazy(() => import('@/pages/Profile')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin',
    Component: lazy(() => import('@/pages/Admin')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin/users',
    Component: lazy(() => import('@/pages/Admin/Users')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin/users/:id',
    Component: lazy(() => import('@/pages/Admin/User')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin/posts',
    Component: lazy(() => import('@/pages/Admin/Posts')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin/posts/:id',
    Component: lazy(() => import('@/pages/Admin/Post')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/admin/settings',
    Component: lazy(() => import('@/pages/Admin/Settings')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/dashboard',
    Component: lazy(() => import('@/pages/Dashboard')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/attendance',
    Component: lazy(() => import('@/pages/Attendance')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/employees',
    Component: lazy(() => import('@/pages/Employees')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/employees/:id',
    Component: lazy(() => import('@/pages/Employee')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/payroll',
    Component: lazy(() => import('@/pages/PayrollDashboard')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/shift-patterns',
    Component: lazy(() => import('@/components/shift-patterns/ShiftPatternsPage')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/shift-patterns/settings',
    Component: lazy(() => import('@/components/shift-patterns/ShiftPatternSettings')),
    Layout: MainLayout,
    ErrorBoundary,
    exact: true,
  },
  {
    path: '/404',
    Component: Error404,
    exact: true,
  },
  {
    path: "/payroll-settings",
    element: <PayrollSettings />,
  },
];

export const createAppRoutes = () => routes;
