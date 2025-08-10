import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Cookies: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>Cookie Policy - TeamPulse</title>
        <meta name="description" content="TeamPulse Cookie Policy - Learn how we use cookies and similar technologies to improve your experience and provide our services." />
        <meta name="keywords" content="cookie policy, cookies, tracking, analytics, TeamPulse, GDPR" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-primary hover:underline text-sm">← Back to home</Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="bg-primary/10 p-6 rounded-lg mb-8">
            <p className="mb-0 font-medium">
              This Cookie Policy explains how TeamPulse uses cookies and similar technologies when you use our website and services. 
              We respect your privacy and give you control over your cookie preferences.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:</p>
            <ul>
              <li>Remembering your preferences and settings</li>
              <li>Enabling essential website functionality</li>
              <li>Analyzing how our website is used</li>
              <li>Personalizing content and advertisements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-lg">!</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Strictly Necessary Cookies</h3>
                    <p className="text-muted-foreground mb-3">These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Examples:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Authentication and login sessions</li>
                        <li>Security tokens and CSRF protection</li>
                        <li>Load balancing and performance optimization</li>
                        <li>Cookie consent preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Analytics and Performance Cookies</h3>
                    <p className="text-muted-foreground mb-3">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Examples:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Google Analytics (anonymized data)</li>
                        <li>Page view statistics and user flow</li>
                        <li>Feature usage and error tracking</li>
                        <li>Performance monitoring and optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-lg">⚙️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Functional Cookies</h3>
                    <p className="text-muted-foreground mb-3">These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.</p>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Examples:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Language and region preferences</li>
                        <li>Theme and display settings</li>
                        <li>Form data and user preferences</li>
                        <li>Customized content and layouts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Marketing and Targeting Cookies</h3>
                    <p className="text-muted-foreground mb-3">These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</p>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Examples:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Social media integration pixels</li>
                        <li>Advertising network cookies</li>
                        <li>Conversion tracking and attribution</li>
                        <li>Remarketing and audience building</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Cookie Banner</h3>
                <p className="text-sm text-muted-foreground mb-3">When you first visit our website, you'll see a cookie consent banner where you can:</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Accept all cookies</li>
                  <li>✓ Accept only necessary cookies</li>
                  <li>✓ Customize your preferences</li>
                  <li>✓ Learn more about each cookie type</li>
                </ul>
              </div>
              
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Browser Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">You can control cookies through your browser settings:</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Block all cookies</li>
                  <li>✓ Delete existing cookies</li>
                  <li>✓ Set cookie preferences per website</li>
                  <li>✓ Receive notifications for new cookies</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
              <p className="font-semibold mb-2">Important Note:</p>
              <p className="text-sm text-muted-foreground">
                Disabling certain cookies may impact your experience on our website. Strictly necessary cookies cannot be disabled 
                as they are essential for the website to function properly.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p>Some cookies on our website are set by third-party services we use. These include:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Google Analytics</h4>
                <p className="text-sm text-muted-foreground">Helps us understand website usage and improve our services.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Stripe</h4>
                <p className="text-sm text-muted-foreground">Handles secure payment processing and fraud detection.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Supabase</h4>
                <p className="text-sm text-muted-foreground">Powers our authentication and database services.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Social Media</h4>
                <p className="text-sm text-muted-foreground">Enables social sharing and integration features.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie Retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-3 text-left">Cookie Type</th>
                    <th className="border border-gray-300 p-3 text-left">Retention Period</th>
                    <th className="border border-gray-300 p-3 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Session</td>
                    <td className="border border-gray-300 p-3">Until browser closes</td>
                    <td className="border border-gray-300 p-3">Authentication and security</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-gray-300 p-3">Persistent</td>
                    <td className="border border-gray-300 p-3">30 days to 2 years</td>
                    <td className="border border-gray-300 p-3">Preferences and analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Marketing</td>
                    <td className="border border-gray-300 p-3">30 to 90 days</td>
                    <td className="border border-gray-300 p-3">Advertising and remarketing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we do:</p>
            <ul>
              <li>We will post the updated policy on this page</li>
              <li>We will update the "Last updated" date</li>
              <li>For material changes, we may notify you via email or website banner</li>
              <li>Your continued use of our website constitutes acceptance of the updated policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className="bg-card border rounded-lg p-6">
              <p className="mb-4">If you have any questions about our use of cookies, please contact us:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Email:</strong> privacy@teampulse.com</p>
                  <p><strong>Subject:</strong> Cookie Policy Inquiry</p>
                </div>
                <div>
                  <p><strong>Response time:</strong> Within 48 hours</p>
                  <p><strong>Data Protection Officer:</strong> dpo@teampulse.com</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-muted p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              For more information about how we handle your personal data, please see our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{' '}
              <Link to="/gdpr" className="text-primary hover:underline">GDPR Compliance</Link> page.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};

export default Cookies;
