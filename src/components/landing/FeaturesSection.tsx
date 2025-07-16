
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, UserCheck, DollarSign, FileText, Settings } from 'lucide-react';

const features = [
  {
    icon: <Clock className="h-12 w-12" />,
    title: "Smart Shift Planning",
    description: "AI-powered scheduling that optimizes shift assignments based on availability, skills, and business needs."
  },
  {
    icon: <UserCheck className="h-12 w-12" />,
    title: "Advanced Clock In/Out",
    description: "Facial recognition, GPS tracking, and PIN verification ensure accurate time tracking and prevent buddy punching."
  },
  {
    icon: <CalendarDays className="h-12 w-12" />,
    title: "Interactive Calendar & Rota",
    description: "Drag-and-drop scheduling with real-time conflict detection and automatic notifications."
  },
  {
    icon: <FileText className="h-12 w-12" />,
    title: "Leave Management",
    description: "Streamlined leave requests with automated approval workflows and balance tracking."
  },
  {
    icon: <DollarSign className="h-12 w-12" />,
    title: "Automated Payroll",
    description: "Calculate wages, overtime, and deductions automatically based on attendance and shift data."
  },
  {
    icon: <Settings className="h-12 w-12" />,
    title: "Complete Integration",
    description: "All modules work together seamlessly for consistent, accurate workforce management."
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Modern Workplaces
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to manage your workforce efficiently, all in one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-6 rounded-2xl w-fit mx-auto mb-4 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                  <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl text-white group-hover:text-blue-200 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
