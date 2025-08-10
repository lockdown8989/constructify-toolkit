import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy Policy explaining how we collect, use, and protect your personal data in compliance with GDPR." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <article className="prose prose-neutral dark:prose-invert max-w-3xl">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

        <p>We are committed to protecting your personal data and your rights to privacy. This policy explains what information we collect, how we use it, and what rights you have.</p>

        <h2>Data We Collect</h2>
        <ul>
          <li>Account information such as name, email, and authentication identifiers.</li>
          <li>Usage data including device information and log data for security and performance.</li>
          <li>HR operations data you provide (e.g., shifts, attendance) strictly for service provision.</li>
        </ul>

        <h2>How We Use Your Data</h2>
        <ul>
          <li>To provide and maintain our services.</li>
          <li>To improve user experience and product performance.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2>GDPR Legal Bases</h2>
        <p>We process personal data under the following legal bases: performance of a contract, legitimate interests, and consent (for analytics/marketing cookies).</p>

        <h2>Your Rights</h2>
        <ul>
          <li>Right of access, rectification, erasure, and portability.</li>
          <li>Right to restrict or object to processing.</li>
          <li>Right to withdraw consent at any time for non‑essential processing.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>We retain personal data only as long as necessary for the purposes outlined here, unless a longer retention period is required by law.</p>

        <h2>Contact</h2>
        <p>For privacy requests, contact our support team. We will respond within 30 days as required by GDPR.</p>
      </article>
    </main>
  );
};

export default Privacy;
