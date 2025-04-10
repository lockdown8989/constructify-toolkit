
import { Link } from "react-router-dom"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
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
