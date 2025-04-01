
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  FileText, 
  CircleCheck, 
  LogIn,
  LayoutDashboard,
  Zap
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl">TeamPulse</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Testimonials</a>
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-4">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </nav>
          <div className="md:hidden flex items-center">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Streamline Your HR Management
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              TeamPulse is an all-in-one HR platform for modern businesses. Manage employees, schedules, payroll, and more—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?tab=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/placeholder.svg" 
              alt="TeamPulse Dashboard" 
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful HR Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your workforce efficiently in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
              <p className="text-gray-600">
                Store and manage all employee information securely in one centralized location.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scheduling & Leave</h3>
              <p className="text-gray-600">
                Create employee schedules and manage time-off requests effortlessly.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payroll Processing</h3>
              <p className="text-gray-600">
                Streamline your payroll process with automated calculations and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose TeamPulse</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to help businesses of all sizes manage their HR operations more effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="mr-4 text-primary">
                <CircleCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Increase Productivity</h3>
                <p className="text-gray-600">
                  Automate repetitive HR tasks and focus on what matters most—your people.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 text-primary">
                <CircleCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Improve Compliance</h3>
                <p className="text-gray-600">
                  Stay compliant with labor laws and regulations with built-in compliance features.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 text-primary">
                <CircleCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enhance Employee Experience</h3>
                <p className="text-gray-600">
                  Provide a better employee experience with self-service features and transparent processes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 text-primary">
                <CircleCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Data-Driven Decisions</h3>
                <p className="text-gray-600">
                  Make informed decisions with powerful analytics and custom reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it—hear from businesses that use TeamPulse every day
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4 italic">
                "TeamPulse has transformed how we manage our HR operations. The platform is intuitive, powerful, and has saved us countless hours of administrative work."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">HR Director, Tech Solutions Inc.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4 italic">
                "As a growing business, we needed an HR system that could scale with us. TeamPulse not only met that need but exceeded our expectations with its comprehensive features."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-gray-500">CEO, GrowFast Startup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your HR Management?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust TeamPulse for their HR needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Zap className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">TeamPulse</h3>
              <p className="mb-4">
                Modern HR Management Platform for growing businesses.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Employee Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scheduling</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Payroll</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leave Management</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© {new Date().getFullYear()} TeamPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
