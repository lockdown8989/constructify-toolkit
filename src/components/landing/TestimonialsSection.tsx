
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "HR Director",
    company: "TechFlow Solutions",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    content: "This platform transformed our scheduling chaos into a streamlined operation. The facial recognition feature alone saves us hours of manual tracking.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "Operations Manager",
    company: "RetailMax Corp",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "The automated payroll integration is incredible. What used to take days now happens instantly with perfect accuracy.",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "HR Manager",
    company: "GreenLeaf Industries",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Our employees love the mobile-friendly interface and the transparency it brings to scheduling. Requests are handled seamlessly.",
    rating: 5
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-5xl font-bold text-white mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Industry Leaders</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See what HR professionals are saying about our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group animate-fade-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-gray-300 text-lg leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <div className="text-white font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-blue-400 font-medium">{testimonial.role}</div>
                    <div className="text-gray-400 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
