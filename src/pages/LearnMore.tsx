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
        <section id="best-platform" className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">Why TeamPulse?</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">A modern, mobile-first platform that unifies scheduling, attendance, payroll, and real-time insights to help managers and teams do their best work.</p>
          <div className="pt-2">
            <Button asChild><Link to={ctaHref}>Try it now</Link></Button>
          </div>
        </section>

        <section id="management-menu" className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Menu that makes management easy</h2>
          <p className="text-muted-foreground max-w-3xl">Quick access to People, Attendance, Payroll, and Schedule with sensible defaults and clear status indicators.</p>
          <div>
            <Button asChild variant="outline"><Link to={isAuthenticated ? '/people' : '/auth?tab=signup'}>Explore People</Link></Button>
          </div>
        </section>

        <section id="duty-control" className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Control the duty to be carried out</h2>
          <p className="text-muted-foreground max-w-3xl">Set roles, permissions, and shift rules. Use alerts to prevent missed breaks and overtime issues.</p>
          <div>
            <Button asChild variant="outline"><Link to={isAuthenticated ? '/schedule' : '/auth?tab=signup'}>Manage Schedules</Link></Button>
          </div>
        </section>

        <section id="profit-charts" className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">View additional performance insights</h2>
          <p className="text-muted-foreground max-w-3xl">Dashboards visualize attendance trends, labor costs, and productivity so you can act quickly.</p>
          <div>
            <Button asChild variant="outline"><Link to={isAuthenticated ? '/' : '/auth?tab=signup'}>Open Analytics</Link></Button>
          </div>
        </section>

        <section id="schedule" className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Manage Employee Schedules</h2>
          <p className="text-muted-foreground max-w-3xl">Create conflict-free shifts, handle rotations, and notify staff instantly. Mobile view makes swaps simple for employees.</p>
          <div>
            <Button asChild><Link to={isAuthenticated ? '/schedule' : '/auth?tab=signup'}>Open Scheduler</Link></Button>
          </div>
        </section>

        <section id="monitoring" className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Monitor progress in real-time</h2>
          <p className="text-muted-foreground max-w-3xl">Live attendance, task status, and alerts help managers resolve issues immediately and keep projects on track.</p>
          <div>
            <Button asChild variant="outline"><Link to={isAuthenticated ? '/attendance' : '/auth?tab=signup'}>View Attendance</Link></Button>
          </div>
        </section>

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
