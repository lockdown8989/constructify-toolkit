import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, UserCheck, DollarSign, FileText, ChevronDown, Users, TrendingUp, Shield, Smartphone, Download, Timer, AlarmClock, BarChart3, Settings } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
const LandingPage: React.FC = () => {
  const {
    user,
    isManager
  } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();
  const [yearly, setYearly] = React.useState(false);
  const handleStripe = () => {
    toast.info('Stripe checkout coming soon. This button will start Stripe.', {
      duration: 3500
    });
  };
  const handleAppDownload = (platform: 'ios' | 'android') => {
    if (platform === 'android') {
      toast.info('To get the TeamPulse APK, please follow the setup instructions below.', {
        duration: 4000
      });
    } else {
      toast.info('iOS app coming soon!');
    }
  };
  const faqs = [{
    q: 'What is TeamPulse?',
    a: 'TeamPulse is a comprehensive employee management platform that streamlines scheduling, attendance, payroll, and team collaboration with real-time synchronization.'
  }, {
    q: 'Is it mobile-friendly?',
    a: 'Absolutely! TeamPulse is designed mobile-first with an Android app available now (iOS coming soon), plus a responsive web interface optimized for all devices.'
  }, {
    q: 'How do I get started?',
    a: 'Simply click "Get Started" to create your free account. Our guided onboarding will help you set up your team and create your first schedule in minutes.'
  }, {
    q: 'Do you support payroll integration?',
    a: 'Yes! Our platform automatically calculates payroll from attendance data, overtime hours, and leave records with instant payslip generation.'
  }, {
    q: 'Is TeamPulse GDPR compliant?',
    a: 'We take data privacy seriously. TeamPulse is fully GDPR compliant with built-in consent management, data portability, and deletion tools.'
  }, {
    q: 'What kind of support do you offer?',
    a: 'We provide 24/7 email support for all plans, priority support for Pro users, and dedicated account management for Enterprise customers.'
  }, {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time with no questions asked. Your data remains accessible during your current billing period.'
  }, {
    q: 'Do you offer a free trial?',
    a: 'Yes! Get started with our free plan that includes up to 5 employees and basic features. No credit card required.'
  }];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>TeamPulse - Modern Employee Management Platform</title>
        <meta name="description" content="Boost productivity with better employee management. Modern scheduling, attendance tracking, and payroll automation in one platform." />
        <meta name="keywords" content="employee management, scheduling software, attendance tracking, payroll automation, team collaboration" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <header className="relative backdrop-blur-sm bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <nav className="responsive-container py-4 md:py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover-scale" aria-label="TeamPulse Home">
            <img src="/lovable-uploads/6498c422-3293-40e4-99c1-a94a137934f6.png" alt="TeamPulse Logo" className="h-10 w-auto animate-bounce hover:animate-spin hover:scale-110 transition-all duration-500 cursor-pointer" />
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">TeamPulse</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#resources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Resources</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? <>
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                  <Link to="/auth?tab=signup">Sign up</Link>
                </Button>
              </> : <>
                <Button asChild size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link to="/schedule">{isManager ? 'Manage' : 'Schedule'}</Link>
                </Button>
              </>}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="responsive-container pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-left space-y-8 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                  Increase Productivity Through{' '}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    Better Employee Management
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  By implementing these methods, you can boost productivity, reduce turnover, and ultimately achieve your business objectives with a more engaged and high-performing team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? <>
                      <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg text-base px-8">
                        <Link to="/dashboard">Open Dashboard</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="text-base px-8">
                        <Link to="/schedule">View Schedule</Link>
                      </Button>
                    </> : <>
                      <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg text-base px-8 hover:shadow-xl transition-all">
                        <Link to="/auth?tab=signup">Get started</Link>
                      </Button>
                      <Button variant="outline" size="lg" className="text-base px-8" onClick={() => document.getElementById('demo')?.scrollIntoView({
                    behavior: 'smooth'
                  })}>
                        See demo
                      </Button>
                    </>}
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background flex items-center justify-center text-sm">
                        {i === 3 ? '👤' : ''}
                      </div>)}
                  </div>
                  <div>
                    <p className="text-3xl font-bold">500K+</p>
                    <p className="text-sm text-muted-foreground">Currently active users from various countries. Very helpful in work</p>
                  </div>
                </div>
              </div>
              <div className="relative animate-scale-in">
                <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
                  {/* Mock Dashboard */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/20"></div>
                        <span className="font-semibold text-sm">Employee Dashboard</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-lg">
                        <div className="text-xs text-orange-600 mb-1">Profit</div>
                        <div className="font-bold text-orange-800">$30,666</div>
                        <div className="text-xs text-green-600">+2.5%</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 mb-1">Survey</div>
                        <div className="space-y-1">
                          <div className="w-full bg-blue-200 h-1 rounded-full"></div>
                          <div className="w-3/4 bg-blue-300 h-1 rounded-full"></div>
                          <div className="w-1/2 bg-blue-400 h-1 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-600 mb-1">Team</div>
                        <div className="flex -space-x-1">
                          <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                          <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">List Employee</div>
                      <div className="space-y-2">
                        {['Bruno Cooper', 'Amy Hopkins', 'Mia', 'Jason Lee', 'Charley Mary'].map((name, i) => <div key={name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10"></div>
                              <span className="text-sm">{name}</span>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {i % 2 === 0 ? 'Available' : 'Busy'}
                            </div>
                          </div>)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-lg"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Logos */}
        

        {/* Best Platform Section */}
        <section className="responsive-container py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Best Platform for Employee Management</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              With advanced features tailored to meet the unique needs of modern businesses, 
              you can now achieve new levels of efficiency and teamwork.
            </p>
            <Button size="lg" className="mt-8 bg-gradient-to-r from-primary to-primary/90 shadow-lg">
              Learn more
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
            <Card className="group hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Menu that makes management easy</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Experience the future of seamless and stress-free control in one convenient menu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 text-primary font-semibold">Read details</Button>
              </CardContent>
            </Card>

            <Card className="group hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Control the duty to be carried out</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Achieve your goals with precision by taking control of your duties today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-green-200 rounded-lg flex items-center justify-center">
                    <Shield className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 text-primary font-semibold">Read details</Button>
              </CardContent>
            </Card>

            <Card className="group hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">View additional profit status charts</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Unlock a wealth of financial knowledge at your fingertips with our enhanced profit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-purple-200 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 text-primary font-semibold">Read details</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Schedule Management Section */}
        <section className="responsive-container py-24 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 border">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Schedule</h3>
                    <Button variant="ghost" size="sm">×</Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="text-muted-foreground">Team</span>
                    </div>
                    <hr className="border-border/50" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-sm font-medium">Night shift</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                      <Button variant="ghost" size="sm">✎</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium">Morning shift</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Active</span>
                      <Button variant="ghost" size="sm">✎</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium">Morning shift</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Active</span>
                      <Button variant="ghost" size="sm">✎</Button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Morning shift</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Night shift</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/90">Add</Button>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Manage Employee Schedules According to Regulations
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Discover the best practices for maintaining fair and compliant schedules while ensuring your employees' well-being.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg text-lg px-8">
                Learn more
              </Button>
            </div>
          </div>
        </section>

        {/* Real-time Monitoring Section */}
        <section id="demo" className="responsive-container py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Monitor Project Progress in Real-time
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                With up-to-the-minute data and visual insights, you can effortlessly track tasks, milestones, and team performance as they happen.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg text-lg px-8">
                Learn more
              </Button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Current Project</h3>
                  <Button variant="link" className="text-primary text-sm">See all ›</Button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">SaaS Finance</span>
                      <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full">In progress</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      <div className="flex justify-between">
                        <span>Project manager</span>
                        <span>Design lead</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-green-400"></div>
                          <span>Devon Lane</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-blue-400"></div>
                          <span>Irma</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Start date</span>
                        <span>Due date</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>4 Jan, 2023</span>
                        <span>31 Jan, 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="responsive-container py-24 bg-gradient-to-br from-background to-primary/5 rounded-3xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">What You Can Do With TeamPulse</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real features from your app — click to jump in.
            </p>
          </div>
          {(() => {
          const target = (path: string) => isAuthenticated ? path : '/auth?tab=signup';
          const featureItems = [{
            icon: <CalendarDays className="h-10 w-10" />,
            title: 'Scheduling',
            description: 'Create and manage shifts with conflict detection and notifications.',
            href: target('/schedule')
          }, {
            icon: <Clock className="h-10 w-10" />,
            title: 'Attendance',
            description: 'Track working hours and attendance across teams.',
            href: target('/attendance')
          }, {
            icon: <UserCheck className="h-10 w-10" />,
            title: 'Leave Management',
            description: 'Request, approve and track leave balances seamlessly.',
            href: target('/leave-management')
          }, {
            icon: <Timer className="h-10 w-10" />,
            title: 'Time Clock',
            description: 'Kiosk and mobile clock-in/out for staff and managers.',
            href: target('/time-clock')
          }, {
            icon: <AlarmClock className="h-10 w-10" />,
            title: 'Overtime',
            description: 'Configure rules and track overtime automatically.',
            href: target('/overtime-management')
          }, {
            icon: <DollarSign className="h-10 w-10" />,
            title: 'Payroll',
            description: 'Automate payroll from attendance and overtime data.',
            href: target('/payroll')
          }, {
            icon: <FileText className="h-10 w-10" />,
            title: 'Payslips',
            description: 'Generate and distribute digital payslips with ease.',
            href: target('/payslips')
          }, {
            icon: <BarChart3 className="h-10 w-10" />,
            title: 'Reports',
            description: 'Analytics dashboards for workforce and payroll insights.',
            href: target('/payroll-reports')
          }, {
            icon: <Users className="h-10 w-10" />,
            title: 'People',
            description: 'Centralized employee directory with roles.',
            href: target('/people')
          }, {
            icon: <Settings className="h-10 w-10" />,
            title: 'Profile & Settings',
            description: 'Manage profile, preferences and security.',
            href: target('/settings')
          }];
          return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featureItems.map(f => <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} href={f.href} ctaLabel={isAuthenticated ? 'Open' : 'Explore'} />)}
              </div>;
        })()}
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="responsive-container py-24">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Our Plans Suit Your Business</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your business best and take a step closer to achieving your objectives with ease.
            </p>
            <div className="inline-flex items-center rounded-full bg-muted p-1 shadow-inner">
              <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                Monthly
              </button>
              <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                Annually
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {yearly ? 'Save 20% with annual billing' : 'Switch to annual and save 20%'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[{
            name: 'Basic',
            subtitle: 'For individuals',
            monthly: 10,
            popular: false,
            description: 'This plan offers the essential features to start your journey to success without spending a lot of money.',
            features: ['All analytics features', 'Normal support', 'Up to 3 team members']
          }, {
            name: 'Pro',
            subtitle: 'For startups',
            monthly: 50,
            popular: true,
            description: 'It is the choice of professional and businesses who want to improve their performance and capabilities.',
            features: ['All analytics features', 'Premium support', 'Up to 40 team members']
          }, {
            name: 'Enterprise',
            subtitle: 'For big companies',
            monthly: 100,
            popular: false,
            description: 'Designed offers a comprehensive set of features and services to drive your success.',
            features: ['All analytics features', 'Normal support', 'Up to 100 team members']
          }].map(plan => {
            const discountedPerMo = Math.round(plan.monthly * 12 * 0.8 / 12);
            const price = yearly ? discountedPerMo : plan.monthly;
            return <Card key={plan.name} className={`relative group hover:-translate-y-2 transition-all duration-300 border-2 ${plan.popular ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl' : 'border-border hover:border-primary/50 shadow-lg hover:shadow-xl'}`}>
                  {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                        For startups
                      </span>
                    </div>}
                  <CardHeader className="text-center pb-8">
                    <div className="space-y-3">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                      <div className="space-y-1">
                        <div className="text-5xl font-bold">
                          £{price}
                          <span className="text-lg text-muted-foreground">/monthly</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {plan.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <p className="font-semibold">What's included</p>
                      <ul className="space-y-3">
                        {plan.features.map(feature => <li key={feature} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <span className="text-sm">{feature}</span>
                          </li>)}
                      </ul>
                    </div>
                    <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl' : ''}`} onClick={handleStripe}>
                      Get started
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>
        </section>

        {/* App Download Section */}
        <section id="resources" className="responsive-container py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Download Our Mobile App</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Take TeamPulse with you anywhere. Android available today; iOS coming soon.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" variant="outline" className="flex items-center gap-3 px-8 py-6 text-base bg-black text-white hover:bg-black/90 border-black rounded-xl" onClick={() => handleAppDownload('ios')} disabled aria-disabled="true">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-300">COMING SOON</div>
                <div className="font-semibold">App Store</div>
              </div>
            </Button>
            <Button size="lg" variant="outline" className="flex items-center gap-3 px-8 py-6 text-base bg-black text-white hover:bg-black/90 border-black rounded-xl" onClick={() => handleAppDownload('android')}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-300">GET IT ON</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="responsive-container py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about TeamPulse, all in one place.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => <details key={index} className="group rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <summary className="cursor-pointer list-none p-6 font-semibold text-lg flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <span className="flex-1 text-left">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </details>)}
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      {!isAuthenticated && isMobile && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 p-3 flex items-center justify-between">
          <span className="text-sm">Start free today</span>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleStripe}>Subscribe</Button>
          </div>
        </div>}

      {/* Newsletter */}
      <section aria-labelledby="newsletter" className="responsive-container mt-16 md:mt-24">
        <div className="rounded-xl border bg-card p-6 md:p-8">
          <h2 id="newsletter" className="text-xl md:text-2xl font-semibold">Join our newsletter</h2>
          <p className="mt-1 text-sm text-muted-foreground">We’ll send you one nice email per week. No spam.</p>
          <form className="mt-4 flex flex-col sm:flex-row gap-3" onSubmit={e => {
          e.preventDefault();
          toast.success('Subscribed. Thanks for joining!');
        }}>
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" name="email" type="email" required placeholder="Enter your email" className="flex-1 rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
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
    </div>;
};
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  href,
  ctaLabel = 'Explore'
}) => {
  return <Card className="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
          <div className="text-primary">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
        <div className="mt-4">
          <Button asChild variant="link" className="p-0">
            <Link to={href} aria-label={`${ctaLabel} ${title}`}>{ctaLabel} →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default LandingPage;