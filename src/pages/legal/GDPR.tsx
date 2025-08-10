import React from 'react';
import { Helmet } from 'react-helmet-async';

const GDPR: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>GDPR Compliance</title>
        <meta name="description" content="Learn how our platform complies with the GDPR, including your rights and controls." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <article className="prose prose-neutral dark:prose-invert max-w-3xl">
        <h1>GDPR Compliance</h1>
        <p>We comply with the EU General Data Protection Regulation (GDPR) and ensure data processing is lawful, fair, and transparent.</p>

        <h2>Your GDPR Rights</h2>
        <ul>
          <li>Access, rectification, and erasure of your data</li>
          <li>Restriction and objection to processing</li>
          <li>Data portability</li>
          <li>Right to withdraw consent at any time</li>
        </ul>

        <h2>Security</h2>
        <p>We implement technical and organizational measures to secure your data, including encryption in transit and role‑based access controls.</p>

        <h2>Subprocessors</h2>
        <p>We work with trusted subprocessors (e.g., hosting, authentication, payments). Data Processing Agreements (DPAs) are in place.</p>

        <h2>Contact</h2>
        <p>To exercise your rights or request a DPA, contact our support team. We respond within statutory timelines.</p>
      </article>
    </main>
  );
};

export default GDPR;
