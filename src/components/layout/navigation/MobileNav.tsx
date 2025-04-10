
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
        <Button variant="ghost" size="icon" className="lg:hidden touch-target">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] max-w-[300px] pb-safe-area-inset-bottom">
        <SheetHeader className="text-left">
          <SheetTitle>TeamPulse</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-4 py-4 overflow-y-auto momentum-scroll">
          <Link
            to="/"
            className="flex items-center py-3 text-lg font-semibold touch-target"
          >
            <Home className="mr-2 h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className="flex items-center py-3 text-lg font-semibold touch-target"
          >
            <FileText className="mr-2 h-5 w-5" />
            <span>About</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center py-3 text-lg font-semibold touch-target"
          >
            <User className="mr-2 h-5 w-5" />
            <span>Contact</span>
          </Link>
          {isAuthenticated && (
            <>
              <hr className="my-2" />
              <Link
                to="/profile"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <User className="mr-2 h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/people"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Employees</span>
              </Link>
              <Link
                to="/employee-workflow"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <Workflow className="mr-2 h-5 w-5" />
                <span>Employee Workflow</span>
              </Link>
              <Link
                to="/leave-management"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <Calendar className="mr-2 h-5 w-5" />
                <span>Leave Management</span>
              </Link>
              <Link
                to="/salary"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                <span>Salary</span>
              </Link>
              <Link
                to="/payroll"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <Receipt className="mr-2 h-5 w-5" />
                <span>Payslip</span>
              </Link>
              <Link
                to="/schedule-requests"
                className="flex items-center py-3 text-lg font-semibold touch-target"
              >
                <Clock className="mr-2 h-5 w-5" />
                <span>Schedule Requests</span>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
