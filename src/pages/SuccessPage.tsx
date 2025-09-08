import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Zap, Users, Calendar, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const SuccessPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && user) {
      toast.success('Welcome to TeamPulse! 🎉');
    }
  }, [sessionId, user]);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Management',
      description: 'Manage unlimited employees and departments'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Advanced Scheduling',
      description: 'AI-powered scheduling with conflict detection'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Payroll Integration',
      description: 'Automated payroll processing and reporting'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Advanced insights and performance metrics'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>Success - TeamPulse Pro</title>
        <meta name="description" content="Welcome to TeamPulse Pro! Your subscription is now active." />
      </Helmet>

      <div className="responsive-container py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teampulse-success/20 to-teampulse-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-teampulse-success animate-scale-in" />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary via-teampulse-accent to-primary bg-clip-text text-transparent">
                TeamPulse!
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for choosing TeamPulse. 
              Get ready to transform your workforce management!
            </p>
          </div>

          {/* Session ID */}
          {sessionId && (
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Transaction ID: <code className="bg-muted px-2 py-1 rounded text-xs">{sessionId}</code>
              </p>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-left">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-left">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary via-teampulse-accent to-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Link to="/dashboard">
                <Zap className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <Link to="/schedule">
                View Schedule
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Support */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Need help getting started? We're here to support you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ghost" size="sm" asChild>
                <Link to="mailto:support@teampulse.com">Contact Support</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/help">View Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;