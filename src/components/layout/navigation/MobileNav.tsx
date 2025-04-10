
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Home, User, Users, Calendar, Clock, FileText, Workflow, PanelLeft, DollarSign, Receipt } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/auth"

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const { isManager } = useAuth();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="text-left">
          <SheetTitle>TeamPulse</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          <Link
            to="/"
            className="flex items-center py-2 text-lg font-semibold"
          >
            <Home className="mr-2 h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className="flex items-center py-2 text-lg font-semibold"
          >
            <FileText className="mr-2 h-5 w-5" />
            <span>About</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center py-2 text-lg font-semibold"
          >
            <User className="mr-2 h-5 w-5" />
            <span>Contact</span>
          </Link>
          {isAuthenticated && (
            <>
              <hr className="my-2" />
              <Link
                to="/profile"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <User className="mr-2 h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/people"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Employees</span>
              </Link>
              <Link
                to="/employee-workflow"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <Workflow className="mr-2 h-5 w-5" />
                <span>Employee Workflow</span>
              </Link>
              <Link
                to="/leave-management"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                <span>Leave Management</span>
              </Link>
              <Link
                to="/schedule-requests"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <Clock className="mr-2 h-5 w-5" />
                <span>Schedule Requests</span>
              </Link>
              <Link
                to="/salary"
                className="flex items-center py-2 text-lg font-semibold"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                <span>Salary</span>
              </Link>
              {isManager && (
                <Link
                  to="/payroll"
                  className="flex items-center py-2 text-lg font-semibold"
                >
                  <Receipt className="mr-2 h-5 w-5" />
                  <span>Payslip</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
