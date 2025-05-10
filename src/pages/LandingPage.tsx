
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, UserCheck, DollarSign, FileText } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user, isManager } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Synchronized Employee Management System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive platform for managing shifts, attendance, leave, payroll, and payslips - all seamlessly synchronized.
        </p>
        
        <div className="mt-8 flex justify-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Button asChild size="lg">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/schedule">{isManager ? 'Manage Schedule' : 'View My Schedule'}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        <FeatureCard 
          icon={<Clock className="h-8 w-8" />}
          title="Time & Attendance"
          description="Track employee time, automate attendance, and manage clock-in/clock-out with ease."
        />
        <FeatureCard 
          icon={<CalendarDays className="h-8 w-8" />}
          title="Shift Management"
          description="Create, assign and manage employee shifts with notifications and conflict detection."
        />
        <FeatureCard 
          icon={<UserCheck className="h-8 w-8" />}
          title="Leave Management"
          description="Streamlined leave requests, approvals and balance tracking integrated with shifts."
        />
        <FeatureCard 
          icon={<DollarSign className="h-8 w-8" />}
          title="Payroll Processing"
          description="Automatically calculate salaries based on attendance, overtime and leave data."
        />
        <FeatureCard 
          icon={<FileText className="h-8 w-8" />}
          title="Payslip Generation"
          description="Generate and distribute digital payslips with detailed breakdowns and tax calculations."
        />
        <FeatureCard 
          icon={<Clock className="h-8 w-8" />}
          title="Synchronized Data"
          description="All employee information stays in sync across modules for consistent, accurate records."
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default LandingPage;
