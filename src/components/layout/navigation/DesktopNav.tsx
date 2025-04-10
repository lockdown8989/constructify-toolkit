
import { Link } from "react-router-dom"
import { DollarSign, Receipt } from "lucide-react"
import { useAuth } from "@/hooks/auth"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { isManager } = useAuth();
  
  return (
    <div className="mx-auto flex items-center space-x-6">
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
            to="/people"
            className="hover:underline underline-offset-4"
          >
            Employees
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
            to="/salary"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Salary
          </Link>
          <Link
            to="/payroll"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Receipt className="h-4 w-4 mr-1" />
            Payslip
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
  );
};

export default DesktopNav;
