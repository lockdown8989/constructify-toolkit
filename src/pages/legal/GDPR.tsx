import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const GDPR: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>GDPR Compliance - TeamPulse</title>
        <meta name="description" content="TeamPulse GDPR Compliance - Learn about your data rights, our compliance measures, and how we protect your personal information under GDPR." />
        <meta name="keywords" content="GDPR, data protection, privacy rights, compliance, TeamPulse, EU regulation" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-primary hover:underline text-sm">← Back to home</Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-6">GDPR Compliance</h1>
          <p className="text-lg text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="bg-primary/10 p-6 rounded-lg mb-8">
            <p className="mb-0 font-medium">
              TeamPulse is fully compliant with the EU General Data Protection Regulation (GDPR). We are committed to 
              protecting your personal data and ensuring transparent, lawful, and fair processing of all information we handle.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What is GDPR?</h2>
            <p>
              The General Data Protection Regulation (GDPR) is a comprehensive privacy regulation that came into effect on May 25, 2018. 
              It strengthens data protection for individuals within the European Union and governs how organizations collect, 
              process, and store personal data.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mt-4">
              <h3 className="font-semibold mb-3">Key GDPR Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-1">
                  <li>✓ Lawfulness, fairness, and transparency</li>
                  <li>✓ Purpose limitation</li>
                  <li>✓ Data minimization</li>
                  <li>✓ Accuracy</li>
                </ul>
                <ul className="space-y-1">
                  <li>✓ Storage limitation</li>
                  <li>✓ Integrity and confidentiality</li>
                  <li>✓ Accountability</li>
                  <li>✓ Privacy by design</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your GDPR Rights</h2>
            <p className="mb-6">Under GDPR, you have comprehensive rights regarding your personal data:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Access</h3>
                    <p className="text-sm text-muted-foreground">Request a copy of all personal data we hold about you, including how it's processed and shared.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">✏️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Rectification</h3>
                    <p className="text-sm text-muted-foreground">Correct any inaccurate or incomplete personal data we hold about you.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">🗑️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Erasure</h3>
                    <p className="text-sm text-muted-foreground">Request deletion of your personal data when there's no compelling reason for continued processing.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold">⏸️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Restrict</h3>
                    <p className="text-sm text-muted-foreground">Limit the processing of your personal data in certain circumstances.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Portability</h3>
                    <p className="text-sm text-muted-foreground">Receive your personal data in a structured, commonly used, and machine-readable format.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">🛑</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Object</h3>
                    <p className="text-sm text-muted-foreground">Object to processing of your personal data for direct marketing or other legitimate interests.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Ensure GDPR Compliance</h2>
            
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Legal Basis for Processing</h3>
                <p className="mb-4">We process your personal data based on the following legal grounds:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Contract Performance</h4>
                    <p className="text-muted-foreground">Processing necessary to provide our services and fulfill our contractual obligations.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Legitimate Interest</h4>
                    <p className="text-muted-foreground">For service improvement, security, and business operations that don't override your rights.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Consent</h4>
                    <p className="text-muted-foreground">For marketing communications and optional features you choose to enable.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Legal Obligation</h4>
                    <p className="text-muted-foreground">To comply with applicable laws, regulations, and legal processes.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Technical and Organizational Measures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Technical Safeguards</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• End-to-end encryption (AES-256)</li>
                      <li>• TLS 1.3 for data transmission</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Regular security audits</li>
                      <li>• Automated backup systems</li>
                      <li>• Intrusion detection systems</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Organizational Measures</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Staff training on data protection</li>
                      <li>• Role-based access controls</li>
                      <li>• Regular compliance reviews</li>
                      <li>• Incident response procedures</li>
                      <li>• Data processing agreements</li>
                      <li>• Privacy impact assessments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Processing Activities</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-3 text-left">Data Category</th>
                    <th className="border border-gray-300 p-3 text-left">Purpose</th>
                    <th className="border border-gray-300 p-3 text-left">Legal Basis</th>
                    <th className="border border-gray-300 p-3 text-left">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Account Data</td>
                    <td className="border border-gray-300 p-3">Service provision</td>
                    <td className="border border-gray-300 p-3">Contract</td>
                    <td className="border border-gray-300 p-3">Account lifetime</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-gray-300 p-3">Usage Analytics</td>
                    <td className="border border-gray-300 p-3">Service improvement</td>
                    <td className="border border-gray-300 p-3">Legitimate interest</td>
                    <td className="border border-gray-300 p-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Marketing Data</td>
                    <td className="border border-gray-300 p-3">Communications</td>
                    <td className="border border-gray-300 p-3">Consent</td>
                    <td className="border border-gray-300 p-3">Until withdrawn</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-gray-300 p-3">Financial Data</td>
                    <td className="border border-gray-300 p-3">Legal compliance</td>
                    <td className="border border-gray-300 p-3">Legal obligation</td>
                    <td className="border border-gray-300 p-3">7 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Data Processors</h2>
            <p className="mb-4">We work with carefully selected third-party processors who are also GDPR compliant:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Supabase</h4>
                <p className="text-sm text-muted-foreground mb-1">Database and authentication services</p>
                <p className="text-xs text-muted-foreground">DPA: ✓ | EU hosting: ✓</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Stripe</h4>
                <p className="text-sm text-muted-foreground mb-1">Payment processing</p>
                <p className="text-xs text-muted-foreground">DPA: ✓ | PCI DSS: ✓</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Google Analytics</h4>
                <p className="text-sm text-muted-foreground mb-1">Website analytics (anonymized)</p>
                <p className="text-xs text-muted-foreground">DPA: ✓ | Privacy Shield: ✓</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">AWS/Vercel</h4>
                <p className="text-sm text-muted-foreground mb-1">Hosting and infrastructure</p>
                <p className="text-xs text-muted-foreground">DPA: ✓ | ISO 27001: ✓</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Breach Response</h2>
            <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Our Commitment</h3>
              <p className="mb-4">In the unlikely event of a data breach, we are committed to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-1">
                  <li>✓ Detect and contain the breach immediately</li>
                  <li>✓ Assess the risk to individuals' rights</li>
                  <li>✓ Notify supervisory authorities within 72 hours</li>
                </ul>
                <ul className="space-y-1">
                  <li>✓ Inform affected individuals without delay</li>
                  <li>✓ Document the breach and response</li>
                  <li>✓ Implement additional safeguards</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Exercising Your Rights</h2>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">How to Contact Us</h3>
              <p className="mb-4">To exercise any of your GDPR rights or for data protection inquiries:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Data Protection Officer</h4>
                  <p className="text-muted-foreground mb-1">Email: dpo@teampulse.com</p>
                  <p className="text-muted-foreground mb-1">Response time: 72 hours</p>
                  <p className="text-muted-foreground">Request processing: 30 days</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Privacy Team</h4>
                  <p className="text-muted-foreground mb-1">Email: privacy@teampulse.com</p>
                  <p className="text-muted-foreground mb-1">Phone: Available upon request</p>
                  <p className="text-muted-foreground">Postal address: Available upon request</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm font-medium mb-2">What to Include in Your Request</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Your full name and email address</li>
                  <li>• Clear description of your request</li>
                  <li>• Proof of identity (for security purposes)</li>
                  <li>• Specific data or processing activity (if applicable)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Supervisory Authority</h2>
            <p className="mb-4">If you believe we have not handled your data correctly, you have the right to lodge a complaint with:</p>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Your Local Data Protection Authority</h4>
              <p className="text-sm text-muted-foreground">
                You can find your local supervisory authority at{' '}
                <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  edpb.europa.eu
                </a>
              </p>
            </div>
          </section>

          <div className="bg-muted p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This GDPR compliance page is regularly updated to reflect changes in our practices and applicable law. 
              For the most current information about our data handling practices, please also review our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};

export default GDPR;
