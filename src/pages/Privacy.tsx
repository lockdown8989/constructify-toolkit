
import React from 'react';
import { useAuth } from '@/hooks/auth';
import GDPRDashboard from '@/components/gdpr/GDPRDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Privacy Dashboard
              </CardTitle>
              <CardDescription>
                Please sign in to access your privacy settings and data management tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Sign In to Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <GDPRDashboard />
    </div>
  );
};

export default Privacy;
