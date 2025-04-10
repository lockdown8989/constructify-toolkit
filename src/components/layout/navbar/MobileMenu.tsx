
import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";

const MobileMenu = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're
            done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          <Link to="/" className="hover:underline underline-offset-4">
            Home
          </Link>
          <Link
            to="/about"
            className="hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:underline underline-offset-4"
          >
            Contact
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className="hover:underline underline-offset-4"
              >
                Profile
              </Link>
              <Link
                to="/employee-workflow"
                className="hover:underline underline-offset-4"
              >
                Employee Workflow
              </Link>
              <Link
                to="/leave-management"
                className="hover:underline underline-offset-4"
              >
                Leave Management
              </Link>
              <Link
                to="/schedule-requests"
                className="hover:underline underline-offset-4"
              >
                Schedule Requests
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
