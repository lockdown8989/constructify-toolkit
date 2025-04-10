
import { Home, Users, Calendar, DollarSign } from "lucide-react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

interface BottomNavProps {
  isAuthenticated: boolean;
}

const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset py-2 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        <Link to="/" className="flex flex-col items-center justify-center p-2">
          <Home 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {t('home')}
          </span>
        </Link>
        
        <Link to="/people" className="flex flex-col items-center justify-center p-2">
          <Users 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/people" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/people" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {t('team')}
          </span>
        </Link>
        
        <Link to="/shift-calendar" className="flex flex-col items-center justify-center p-2">
          <Calendar 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/shift-calendar" || location.pathname === "/restaurant-schedule" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/shift-calendar" || location.pathname === "/restaurant-schedule" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {t('schedule')}
          </span>
        </Link>
        
        <Link to="/leave-management" className="flex flex-col items-center justify-center p-2">
          <Calendar 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/leave-management" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/leave-management" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {t('leave')}
          </span>
        </Link>
        
        <Link to="/salary" className="flex flex-col items-center justify-center p-2">
          <DollarSign 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/salary" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/salary" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {t('salary')}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
