import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from '@/components/ui/button';

const MobileNav = () => {
  const { user, signOut } = useAuth();

  const activeClassName = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2";
  const inactiveClassName = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2";

  const closeMenu = () => {
    const sheet = document.querySelector('.radix-ui-portal[data-state="open"]');
    if (sheet) {
      (sheet as any).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate the application
          </SheetDescription>
        </SheetHeader>
        {user ? (
          <nav className="grid gap-y-6 py-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Employees
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Projects
            </NavLink>
            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Payroll
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Attendance
            </NavLink>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Documents
            </NavLink>
            <NavLink
              to="/leave"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Leave
            </NavLink>
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Schedule
            </NavLink>
            <NavLink
              to="/ScheduleRequests"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Schedule Requests
            </NavLink>
            <NavLink
              to="/workflow"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Workflow
            </NavLink>
            <Button variant="outline" onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </nav>
        ) : (
          <nav className="grid gap-y-6 py-6">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? activeClassName : inactiveClassName
              }
              onClick={closeMenu}
            >
              Register
            </NavLink>
          </nav>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
