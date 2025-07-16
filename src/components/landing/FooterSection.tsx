
import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TeamPulse
                </span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                The future of employee scheduling and workforce management. 
                Streamline your operations with intelligent automation.
              </p>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Facebook className="w-6 h-6 text-blue-400" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Twitter className="w-6 h-6 text-blue-400" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Linkedin className="w-6 h-6 text-blue-400" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Instagram className="w-6 h-6 text-blue-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Documentation', 'Support', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>hello@teampulse.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-center lg:text-left">
            © 2024 TeamPulse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
