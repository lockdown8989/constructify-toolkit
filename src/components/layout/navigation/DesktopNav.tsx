
import { Link } from "react-router-dom"
import { Calendar, DollarSign, Receipt, Settings } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { useLanguage } from "@/hooks/use-language"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { isManager } = useAuth();
  const { t } = useLanguage();
  
  return (
    <div className="mx-auto flex items-center space-x-6">
      <Link to="/" className="hover:underline underline-offset-4">
        {t('home')}
      </Link>
      <Link
        to="/about"
        className="hover:underline underline-offset-4"
      >
        {t('about')}
      </Link>
      <Link
        to="/contact"
        className="hover:underline underline-offset-4"
      >
        {t('contact')}
      </Link>
      {isAuthenticated && (
        <>
          <Link
            to="/profile"
            className="hover:underline underline-offset-4"
          >
            {t('profile')}
          </Link>
          <Link
            to="/settings"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            {t('settings')}
          </Link>
          <Link
            to="/people"
            className="hover:underline underline-offset-4"
          >
            {t('employees')}
          </Link>
          <Link
            to="/employee-workflow"
            className="hover:underline underline-offset-4"
          >
            {t('employeeWorkflow')}
          </Link>
          <Link
            to="/leave-management"
            className="hover:underline underline-offset-4"
          >
            {t('leaveManagement')}
          </Link>
          <Link
            to="/shift-calendar"
            className="hover:underline underline-offset-4"
          >
            {t('shiftCalendar')}
          </Link>
          <Link
            to="/salary"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            {t('salary')}
          </Link>
          <Link
            to="/payroll"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Receipt className="h-4 w-4 mr-1" />
            {t('payslip')}
          </Link>
          <Link
            to="/schedule-requests"
            className="hover:underline underline-offset-4"
          >
            {t('scheduleRequests')}
          </Link>
        </>
      )}
    </div>
  );
};

export default DesktopNav;
