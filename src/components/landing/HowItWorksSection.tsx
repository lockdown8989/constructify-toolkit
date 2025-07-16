
import React from 'react';
import { UserPlus, Calendar, Clock, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="h-16 w-16" />,
    title: "Add Your Team",
    description: "Import employees and set their roles, availability, and preferences in minutes."
  },
  {
    icon: <Calendar className="h-16 w-16" />,
    title: "Create Schedules",
    description: "Use our intelligent scheduling engine to create optimal shift patterns automatically."
  },
  {
    icon: <Clock className="h-16 w-16" />,
    title: "Track Time",
    description: "Employees clock in/out with facial recognition or PIN. All data syncs in real-time."
  },
  {
    icon: <TrendingUp className="h-16 w-16" />,
    title: "Analyze & Optimize",
    description: "Get insights on labor costs, productivity, and schedule efficiency to improve operations."
  }
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-5xl font-bold text-white mb-6">
            How It
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started in 4 simple steps and transform your workforce management today.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-y-1/2 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="text-center relative animate-fade-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-slate-900 z-10 hidden lg:block"></div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group">
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-blue-400 tracking-wide uppercase">
                      Step {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
