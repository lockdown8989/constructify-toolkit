
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, UserCheck, DollarSign, FileText, Settings } from 'lucide-react';

const features = [
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Intelligent Scheduling",
    description: "AI-powered shift planning that optimizes assignments based on availability, skills, and business requirements for maximum efficiency."
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: "Advanced Time Tracking",
    description: "Secure clock-in/out with facial recognition, GPS verification, and PIN authentication to ensure accurate attendance records."
  },
  {
    icon: <CalendarDays className="h-8 w-8" />,
    title: "Smart Calendar System",
    description: "Intuitive drag-and-drop scheduling with real-time conflict detection, automated notifications, and seamless team coordination."
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Leave Management",
    description: "Streamlined leave requests with automated approval workflows, balance tracking, and comprehensive reporting capabilities."
  },
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: "Automated Payroll",
    description: "Precise wage calculations with overtime tracking, automatic deductions, and seamless integration with your existing systems."
  },
  {
    icon: <Settings className="h-8 w-8" />,
    title: "Enterprise Integration",
    description: "Comprehensive API access and third-party integrations for seamless workflow automation across your organization."
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 relative bg-gradient-to-b from-transparent to-black/5">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-20 animate-fade-up max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Settings className="w-4 h-4" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
              Modern Workforce Management
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools designed to streamline operations, reduce costs, and empower your team with intelligent automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="bg-white/3 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group animate-fade-up overflow-hidden"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader className="text-center pb-6">
                <div className="bg-gradient-to-br from-blue-500/15 to-purple-600/15 p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:from-blue-500/25 group-hover:to-purple-600/25 transition-all duration-500 border border-white/5">
                  <div className="text-blue-300 group-hover:text-blue-200 transition-colors duration-500">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl md:text-2xl text-white group-hover:text-blue-100 transition-colors duration-500 font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional bottom section */}
        <div className="text-center mt-20">
          <p className="text-gray-400 text-lg">
            And many more enterprise features designed for scale
          </p>
        </div>
      </div>
    </section>
  );
};
