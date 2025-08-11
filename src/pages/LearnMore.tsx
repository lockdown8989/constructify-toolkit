import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const scrollToHash = (hash: string) => {
  if (!hash) return;
  const el = document.querySelector(hash);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const LearnMore: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { hash } = useLocation();

  useEffect(() => {
    scrollToHash(hash);
  }, [hash]);

  const ctaHref = isAuthenticated ? '/dashboard' : '/auth?tab=signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>TeamPulse Learn More - Features & Demo</title>
        <meta name="description" content="Explore TeamPulse features: scheduling, time clock, payroll, monitoring. Learn how it boosts productivity." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="responsive-container py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold story-link" aria-label="Back to homepage">← Back</Link>
          <div className="flex items-center gap-3">
            <Button asChild size="sm"><Link to={ctaHref}>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</Link></Button>
          </div>
        </div>
      </header>

      <main className="responsive-container py-10 md:py-16 space-y-16 md:space-y-24">
        <section id="features" className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">TeamPulse Features Overview</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">A comprehensive workforce management platform designed for modern businesses. Explore our complete feature set below.</p>
          <div className="pt-2">
            <Button asChild><Link to={ctaHref}>Try it now</Link></Button>
          </div>
        </section>

        {/* Core Features */}
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Core Features</h2>
          
          <section id="time-tracking" className="space-y-3">
            <h3 className="text-2xl font-semibold">Smart Time Tracking</h3>
            <p className="text-muted-foreground max-w-3xl">Advanced attendance system with face recognition, GPS verification, and mobile clock-in/out functionality. Prevent time theft and ensure accurate records with automated break tracking.</p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/attendance' : '/auth?tab=signup'}>View Attendance</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/manager-time-clock' : '/auth?tab=signup'}>Manager Time Clock</Link></Button>
            </div>
          </section>

          <section id="scheduling" className="space-y-3">
            <h3 className="text-2xl font-semibold">Advanced Scheduling</h3>
            <p className="text-muted-foreground max-w-3xl">Intelligent scheduling with shift calendar, employee rotas, conflict detection, and automatic notifications. Create templates, manage rotations, and ensure fair distribution of shifts.</p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild><Link to={isAuthenticated ? '/schedule' : '/auth?tab=signup'}>Open Scheduler</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/shift-calendar' : '/auth?tab=signup'}>Shift Calendar</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/rota-employee' : '/auth?tab=signup'}>Employee Rotas</Link></Button>
            </div>
          </section>

          <section id="leave-management" className="space-y-3">
            <h3 className="text-2xl font-semibold">Leave Management</h3>
            <p className="text-muted-foreground max-w-3xl">Streamlined leave request system with approval workflows, balance tracking, and automated policy enforcement. Employees can submit requests, managers can approve, and HR can track patterns.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/leave-management' : '/auth?tab=signup'}>Manage Leaves</Link></Button>
            </div>
          </section>

          <section id="payroll" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payroll Automation</h3>
            <p className="text-muted-foreground max-w-3xl">Complete payroll processing with overtime calculation, tax deductions, compliance tracking, and instant payslip generation. Automated from attendance data with full audit trails.</p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild><Link to={isAuthenticated ? '/payroll' : '/auth?tab=signup'}>Payroll Processing</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/payroll-dashboard' : '/auth?tab=signup'}>Payroll Dashboard</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/payroll-reports' : '/auth?tab=signup'}>Reports</Link></Button>
              <Button asChild variant="outline"><Link to={isAuthenticated ? '/payslips' : '/auth?tab=signup'}>Payslips</Link></Button>
            </div>
          </section>
        </div>

        {/* Employee Features */}
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Employee Features</h2>
          
          <section id="mobile-time-clock" className="space-y-3">
            <h3 className="text-2xl font-semibold">Mobile Time Clock</h3>
            <p className="text-muted-foreground max-w-3xl">Clock in/out from anywhere with GPS verification and face recognition. Secure, accurate, and prevents buddy punching. Available on mobile apps for iOS and Android.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/attendance' : '/auth?tab=signup'}>Try Time Clock</Link></Button>
            </div>
          </section>

          <section id="employee-leave" className="space-y-3">
            <h3 className="text-2xl font-semibold">Employee Leave Requests</h3>
            <p className="text-muted-foreground max-w-3xl">Submit leave requests with calendar integration, track balances in real-time, view approval status, and receive notifications. Support for multiple leave types and policies.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/leave-management' : '/auth?tab=signup'}>Request Leave</Link></Button>
            </div>
          </section>

          <section id="employee-schedule" className="space-y-3">
            <h3 className="text-2xl font-semibold">Schedule Access & Requests</h3>
            <p className="text-muted-foreground max-w-3xl">View your schedule, request changes, swap shifts with colleagues, and get notifications for updates. Mobile-optimized interface for on-the-go access.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/schedule-requests' : '/auth?tab=signup'}>Schedule Requests</Link></Button>
            </div>
          </section>
        </div>

        {/* Manager Features */}
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Manager & Administrator Features</h2>
          
          <section id="people-management" className="space-y-3">
            <h3 className="text-2xl font-semibold">People Management</h3>
            <p className="text-muted-foreground max-w-3xl">Comprehensive employee directory with profiles, roles, permissions, and organizational hierarchy. Manage onboarding, offboarding, and employee lifecycle.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/people' : '/auth?tab=signup'}>Manage People</Link></Button>
            </div>
          </section>

          <section id="shift-calendar" className="space-y-3">
            <h3 className="text-2xl font-semibold">Shift Calendar</h3>
            <p className="text-muted-foreground max-w-3xl">Visual scheduling interface with drag-and-drop functionality, shift templates, bulk operations, and conflict detection. Color-coded views for easy management.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/shift-calendar' : '/auth?tab=signup'}>Open Calendar</Link></Button>
            </div>
          </section>

          <section id="employee-rotas" className="space-y-3">
            <h3 className="text-2xl font-semibold">Employee Rotas</h3>
            <p className="text-muted-foreground max-w-3xl">Create rotating schedules, manage shift patterns, ensure fair distribution of shifts and overtime. Automated rotation with customizable patterns and rules.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/rota-employee' : '/auth?tab=signup'}>Manage Rotas</Link></Button>
            </div>
          </section>

          <section id="workflow-management" className="space-y-3">
            <h3 className="text-2xl font-semibold">Employee Workflow</h3>
            <p className="text-muted-foreground max-w-3xl">Track tasks, processes, and employee performance with customizable workflows. Set priorities, deadlines, and monitor progress across teams.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/employee-workflow' : '/auth?tab=signup'}>Manage Workflows</Link></Button>
            </div>
          </section>

          <section id="manager-time-clock" className="space-y-3">
            <h3 className="text-2xl font-semibold">Manager Time Clock</h3>
            <p className="text-muted-foreground max-w-3xl">Monitor employee attendance, approve timesheets, manage exceptions, and handle overtime approvals. Real-time visibility into who's working when.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/manager-time-clock' : '/auth?tab=signup'}>Manager Clock</Link></Button>
            </div>
          </section>

          <section id="manager-analytics" className="space-y-3">
            <h3 className="text-2xl font-semibold">Analytics Dashboard</h3>
            <p className="text-muted-foreground max-w-3xl">Real-time insights, attendance reports, performance metrics, and labor cost analysis. Visual dashboards help you make data-driven decisions.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/dashboard' : '/auth?tab=signup'}>View Dashboard</Link></Button>
            </div>
          </section>
        </div>

        {/* Payroll Features */}
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Payroll Administrator Features</h2>
          
          <section id="payroll-processing" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payroll Processing</h3>
            <p className="text-muted-foreground max-w-3xl">Automated payroll runs with overtime calculation, tax deductions, benefits integration, and compliance features. Process payroll with confidence and accuracy.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/payroll' : '/auth?tab=signup'}>Process Payroll</Link></Button>
            </div>
          </section>

          <section id="payroll-dashboard" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payroll Dashboard</h3>
            <p className="text-muted-foreground max-w-3xl">Real-time payroll analytics, cost tracking, budget monitoring, and trend analysis. Visual insights into labor costs and payroll metrics.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/payroll-dashboard' : '/auth?tab=signup'}>Payroll Analytics</Link></Button>
            </div>
          </section>

          <section id="payroll-reports" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payroll Reports</h3>
            <p className="text-muted-foreground max-w-3xl">Comprehensive reporting for tax filings, audits, financial analysis, and compliance. Export data in multiple formats for accounting systems.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/payroll-reports' : '/auth?tab=signup'}>View Reports</Link></Button>
            </div>
          </section>

          <section id="payslip-management" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payslip Management</h3>
            <p className="text-muted-foreground max-w-3xl">Generate, distribute, and manage digital payslips with employee portal access. Secure delivery with email notifications and download options.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/payslips' : '/auth?tab=signup'}>Manage Payslips</Link></Button>
            </div>
          </section>
        </div>

        {/* Integrations */}
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Advanced Integrations</h2>
          
          <section id="payment-integration" className="space-y-3">
            <h3 className="text-2xl font-semibold">Payment Processing</h3>
            <p className="text-muted-foreground max-w-3xl">Stripe integration for seamless payment handling, reimbursements, subscription management, and financial transactions. Secure and compliant payment processing.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/integrations' : '/auth?tab=signup'}>Payment Setup</Link></Button>
            </div>
          </section>

          <section id="notifications" className="space-y-3">
            <h3 className="text-2xl font-semibold">Smart Notifications</h3>
            <p className="text-muted-foreground max-w-3xl">Email and SMS alerts for schedules, payroll, leave requests, and important updates. Customizable notification preferences for different user types.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/integrations' : '/auth?tab=signup'}>Configure Notifications</Link></Button>
            </div>
          </section>

          <section id="calendar-sync" className="space-y-3">
            <h3 className="text-2xl font-semibold">Calendar Sync</h3>
            <p className="text-muted-foreground max-w-3xl">Two-way sync with Google Calendar and Outlook for seamless schedule management. Automatic updates and conflict resolution.</p>
            <div>
              <Button asChild><Link to={isAuthenticated ? '/integrations' : '/auth?tab=signup'}>Calendar Integration</Link></Button>
            </div>
          </section>
        </div>

        <aside className="rounded-xl border bg-card p-6 md:p-8">
          <h3 className="text-xl font-semibold">Want a quick demo?</h3>
          <p className="text-muted-foreground mt-1">Go back to the homepage and use the See demo button to preview real-time monitoring.</p>
          <div className="mt-3">
            <Button asChild variant="ghost"><Link to="/">Go to Homepage</Link></Button>
          </div>
        </aside>
      </main>

      <footer className="responsive-container py-10 border-t mt-10">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TeamPulse</p>
      </footer>
    </div>
  );
};

export default LearnMore;
