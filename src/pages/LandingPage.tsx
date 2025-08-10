
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
  const [yearly, setYearly] = React.useState(false);

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

        {/* Logo cloud + social proof */}
        <section aria-label="Trusted by companies" className="responsive-container mt-12 md:mt-16">
          <p className="text-center text-sm md:text-base text-muted-foreground">Join 4,000+ companies already growing</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-70">
            {['Layers','Sisyphus','Circooles','Catalog','Quotient'].map((brand) => (
              <span key={brand} className="text-sm md:text-base">{brand}</span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Platform usage stats" className="responsive-container mt-10 md:mt-14">
          <div className="mx-auto max-w-3xl text-center rounded-xl border bg-card p-6 md:p-8">
            <div className="text-3xl md:text-4xl font-bold">500K+</div>
            <p className="mt-1 text-sm md:text-base text-muted-foreground">Active users across industries</p>
          </div>
        </section>

        {/* Best Platform section */}
        <section className="responsive-container mt-12 md:mt-20">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Best Platform for Employee Management</h2>
            <p className="text-sm md:text-base text-muted-foreground">Advanced features tailored to modern teams.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Menu that makes management easy', desc: 'Experience seamless, stress‑free control in one hub.' },
              { title: 'Control the duty to be carried out', desc: 'Achieve goals with precision and clear responsibilities.' },
              { title: 'View additional profit status charts', desc: 'Unlock insights with our enhanced reports.' },
            ].map((item) => (
              <Card key={item.title} className="hover:-translate-y-1 transition-transform">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-28 md:h-36 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 border" aria-hidden="true"></div>
                  <Button variant="link" className="mt-3 px-0">Read details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Regulations section */}
        <section className="responsive-container mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Manage Employee Schedules According to Regulations</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">Maintain fair, compliant schedules and employee well‑being.</p>
            <div className="mt-4">
              <Button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Learn more</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4" aria-hidden="true">
            <div className="h-28 rounded-xl bg-gradient-to-br from-primary/15 to-transparent border" />
            <div className="h-28 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border" />
            <div className="col-span-2 h-28 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border" />
          </div>
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

        <section id="pricing" className="responsive-container mt-16 md:mt-24">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Our Plans Suit Your Business</h2>
            <p className="text-sm md:text-base text-muted-foreground">Choose a plan that fits your team. Stripe checkout coming soon.</p>
            <div className="mt-4 inline-flex items-center rounded-full border p-1">
              <button
                type="button"
                aria-pressed={!yearly}
                onClick={() => setYearly(false)}
                className={`px-4 py-1.5 rounded-full text-sm ${!yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={yearly}
                onClick={() => setYearly(true)}
                className={`px-4 py-1.5 rounded-full text-sm ${yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Annually
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{yearly ? 'Save about 20% with annual billing' : 'Switch to annual and save ~20%'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', monthly: 0, features: ['Up to 5 employees', 'Basic scheduling', 'Email support'] },
              { name: 'Pro', monthly: 49, features: ['Up to 50 employees', 'Attendance & leave', 'Priority support'] },
              { name: 'Business', monthly: 99, features: ['Unlimited employees', 'Payroll & payslips', 'SLA support'] },
            ].map((plan) => {
              const discountedPerMo = Math.round(((plan.monthly * 12 * 0.8) / 12));
              const label = plan.monthly === 0 ? 'Free' : (yearly ? `$${discountedPerMo}/mo` : `$${plan.monthly}/mo`);
              return (
                <Card key={plan.name} className="hover:-translate-y-1 transition-transform">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      <span className="text-lg md:text-xl font-semibold">{label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {plan.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <Button className="w-full" onClick={handleStripe}>Choose {plan.name}</Button>
                  </CardContent>
                </Card>
              );
            })}
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

      {/* Newsletter */}
      <section aria-labelledby="newsletter" className="responsive-container mt-16 md:mt-24">
        <div className="rounded-xl border bg-card p-6 md:p-8">
          <h2 id="newsletter" className="text-xl md:text-2xl font-semibold">Join our newsletter</h2>
          <p className="mt-1 text-sm text-muted-foreground">We’ll send you one nice email per week. No spam.</p>
          <form
            className="mt-4 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed. Thanks for joining!'); }}
          >
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" name="email" type="email" required placeholder="Enter your email"
              className="flex-1 rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>

      <footer className="responsive-container mt-12 md:mt-16 py-10 border-t">
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
