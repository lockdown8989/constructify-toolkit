
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Calendar, FileText, DollarSign, Settings } from 'lucide-react';

const About = () => {
  return (
    <div className="container max-w-5xl py-12 px-4 md:px-6">
      <div className="space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About TeamPulse</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive HR management platform designed to streamline employee scheduling, attendance tracking, 
            payroll processing, and more.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="team">Our Team</TabsTrigger>
            <TabsTrigger value="mission">Mission</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>TeamPulse HR Management Platform</CardTitle>
                <CardDescription>Modern solution for HR management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TeamPulse is a comprehensive HR management platform designed specifically for businesses 
                  with complex scheduling, payroll, and personnel management needs. Our solution helps 
                  streamline operations, improve communication between managers and employees, and ensure 
                  accurate attendance and payroll processing.
                </p>
                <p>
                  With TeamPulse, you can manage your entire workforce from a single dashboard - from 
                  scheduling shifts and tracking attendance to processing payroll and managing leave requests.
                  The intuitive interface ensures that both managers and employees can easily navigate the 
                  system with minimal training.
                </p>
                <p>
                  Built with modern technologies and designed with user experience in mind, TeamPulse 
                  is the ideal solution for businesses looking to modernize their HR operations and 
                  improve workforce management.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={<Clock className="h-8 w-8" />}
                title="Time & Attendance"
                description="Automated time tracking with clock-in/out functionality, attendance analytics, and real-time monitoring."
              />
              <FeatureCard 
                icon={<Calendar className="h-8 w-8" />}
                title="Shift Scheduling"
                description="Intuitive drag-and-drop interface for creating and managing employee schedules with conflict detection."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8" />}
                title="Employee Management"
                description="Comprehensive employee profiles, document management, and organization hierarchy visualization."
              />
              <FeatureCard 
                icon={<FileText className="h-8 w-8" />}
                title="Leave Management"
                description="Streamlined request workflow with automatic balance calculation and calendar integration."
              />
              <FeatureCard 
                icon={<DollarSign className="h-8 w-8" />}
                title="Payroll Processing"
                description="Automatic salary calculation based on attendance data with customizable payment rules."
              />
              <FeatureCard 
                icon={<Settings className="h-8 w-8" />}
                title="System Configuration"
                description="Highly customizable settings to adapt to your organization's specific needs and workflows."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
                <CardDescription>The people behind TeamPulse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TeamPulse was developed by a dedicated team of HR specialists, software engineers, and UX designers
                  who understand the challenges of modern workforce management. Our diverse team brings together
                  expertise from various industries to create a solution that meets real-world needs.
                </p>
                <p>
                  Our development philosophy centers around continuous improvement based on customer feedback.
                  We regularly update the platform with new features and enhancements requested by our users.
                </p>
                <p>
                  We're proud to have assembled a team that is passionate about creating tools that make work
                  life better for both employees and managers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mission" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
                <CardDescription>Why we built TeamPulse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our mission is to simplify workforce management while empowering both employees and managers
                  with the tools they need to be more productive, engaged, and satisfied at work.
                </p>
                <p>
                  We believe that seamless HR operations are the backbone of successful businesses, and our
                  goal is to provide a platform that eliminates administrative overhead, reduces errors, and
                  improves communication throughout the organization.
                </p>
                <p>
                  By automating routine tasks and providing insightful analytics, TeamPulse helps organizations
                  focus on their core business while ensuring their workforce is well-managed and engaged.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company History</CardTitle>
                <CardDescription>The TeamPulse journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TeamPulse was founded in 2023 in response to the growing need for more integrated and user-friendly
                  HR management solutions. After extensive research and consultation with HR professionals across
                  various industries, we identified common pain points in existing systems.
                </p>
                <p>
                  The first version of TeamPulse was launched as a scheduling and attendance solution, but we quickly
                  expanded our offering based on customer feedback. Within the first year, we added payroll processing,
                  leave management, and comprehensive reporting capabilities.
                </p>
                <p>
                  Today, TeamPulse serves businesses of all sizes across multiple industries, helping them streamline
                  their HR operations and improve workforce management.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">Support:</p>
                <p>Email: support@teampulse.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Hours: Monday-Friday, 9am-5pm EST</p>
                
                <div className="py-2"></div>
                
                <p className="font-medium">Sales Inquiries:</p>
                <p>Email: sales@teampulse.com</p>
                <p>Phone: +1 (555) 987-6543</p>
                
                <div className="py-2"></div>
                
                <p className="font-medium">Headquarters:</p>
                <p>123 Business Park Drive</p>
                <p>Suite 456</p>
                <p>Tech City, TX 78901</p>
                <p>United States</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default About;
