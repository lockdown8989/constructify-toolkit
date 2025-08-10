
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, UserCheck, DollarSign, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const LandingPage: React.FC = () => {
  const { user, isManager } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();

  const handleStripe = () => {
    toast.info('Stripe checkout coming soon. This button will start Stripe.', { duration: 3500 });
  };

  const faqs = [
    { q: 'What is the Synchronized Employee Management System?', a: 'An all-in-one HR platform to manage shifts, attendance, leave, payroll, and payslips with synchronized data across modules.' },
    { q: 'Is it mobile friendly?', a: 'Yes. The interface is designed mobile-first with large touch targets, smooth animations, and responsive layouts.' },
    { q: 'How do I get started?', a: 'Click Get Started to create an account, then follow the onboarding to import employees and set up your first schedule.' },
    { q: 'Does it support payroll?', a: 'Yes. Payroll is calculated automatically from attendance, overtime, and leave data with payslip generation.' },
    { q: 'Is it GDPR compliant?', a: 'We provide tools and policies to help you stay compliant, including data access, deletion, and cookie consent controls.' },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div>
      <Helmet>
        <title>Synchronized Employee Management System</title>
        <meta name="description" content="Manage shifts, attendance, leave, payroll and payslips in one synchronized HR platform." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <header className="relative">
        <nav className="responsive-container py-4 md:py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover-scale" aria-label="Home">
            <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/20" />
            <span className="font-semibold">Synchronized EMS</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Link to="#features" className="story-link px-2 py-1">Features</Link>
            <Link to="#pricing" className="story-link px-2 py-1">Pricing</Link>
            <Link to="#faq" className="story-link px-2 py-1">FAQ</Link>
            <Link to="/privacy" className="px-2 py-1">Privacy</Link>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm">
                  <Link to="/schedule">{isManager ? 'Manage Schedule' : 'My Schedule'}</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="pointer-events-none mx-auto max-w-5xl md:max-w-6xl lg:max-w-7xl px-4">
            <div className="h-48 md:h-72 w-full bg-gradient-to-b from-primary/20 to-transparent rounded-b-[2rem] blur-2xl" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="responsive-container pt-8 md:pt-16 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight animate-fade-in">
            Synchronized Employee Management System
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Manage shifts, attendance, leave, payroll and payslips — all in one modern, mobile‑first HR platform.
          </p>
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Button asChild size={isMobile ? 'sm' : 'lg'}>
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size={isMobile ? 'sm' : 'lg'}>
                  <Link to="/schedule">{isManager ? 'Manage Schedule' : 'View Schedule'}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size={isMobile ? 'sm' : 'lg'}>
                  <Link to="/auth?tab=signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size={isMobile ? 'sm' : 'lg'} onClick={handleStripe}>
                  Subscribe (Stripe)
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-xs md:text-sm text-muted-foreground">No credit card required to start. Cancel anytime.</p>
        </section>

        {/* Feature grid */}
        <section id="features" className="responsive-container mt-12 md:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Clock className="h-8 w-8" />} title="Time & Attendance" description="Track time, automate attendance, and manage clock-in/clock-out with ease." />
            <FeatureCard icon={<CalendarDays className="h-8 w-8" />} title="Shift Management" description="Create, assign and manage shifts with notifications and conflict detection." />
            <FeatureCard icon={<UserCheck className="h-8 w-8" />} title="Leave Management" description="Streamlined leave requests, approvals, and balance tracking integrated with shifts." />
            <FeatureCard icon={<DollarSign className="h-8 w-8" />} title="Payroll Processing" description="Automatically calculate salaries from attendance, overtime and leave data." />
            <FeatureCard icon={<FileText className="h-8 w-8" />} title="Payslip Generation" description="Generate and distribute digital payslips with clear breakdowns and tax info." />
            <FeatureCard icon={<Clock className="h-8 w-8" />} title="Synchronized Data" description="All modules stay in sync for consistent, accurate records across the platform." />
          </div>
        </section>

        {/* Pricing placeholder for Stripe */}
        <section id="pricing" className="responsive-container mt-16 md:mt-24">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Simple pricing</h2>
            <p className="text-sm md:text-base text-muted-foreground">Upgrade anytime. Stripe checkout integration coming soon.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{name:'Starter',price:'Free',features:['Up to 5 employees','Basic scheduling','Email support']},{name:'Pro',price:'$49/mo',features:['Up to 50 employees','Attendance & leave','Priority support']},{name:'Business',price:'$99/mo',features:['Unlimited employees','Payroll & payslips','SLA support']}].map((plan)=> (
              <Card key={plan.name} className="hover:-translate-y-1 transition-transform">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <span className="text-lg md:text-xl font-semibold">{plan.price}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {plan.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <Button className="w-full" onClick={handleStripe}>Choose {plan.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="responsive-container mt-16 md:mt-24">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Frequently Asked Questions</h2>
            <p className="text-sm md:text-base text-muted-foreground">Everything you need to know, in one place.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-lg border bg-card p-4 transition-all">
                <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                  {f.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      {!isAuthenticated && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 p-3 flex items-center justify-between">
          <span className="text-sm">Start free today</span>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleStripe}>Subscribe</Button>
          </div>
        </div>
      )}

      <footer className="responsive-container mt-16 md:mt-24 py-10 border-t">
        <div className="md:flex md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Synchronized EMS</p>
          <nav className="mt-4 md:mt-0 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/cookies" className="hover:underline">Cookies</Link>
            <Link to="/gdpr" className="hover:underline">GDPR</Link>
          </nav>
        </div>
      </footer>
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
