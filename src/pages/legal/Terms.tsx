import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>Terms of Service</title>
        <meta name="description" content="Terms of Service governing your use of our platform." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <article className="prose prose-neutral dark:prose-invert max-w-3xl">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Please read these terms carefully before using our services.</p>

        <h2>Use of Service</h2>
        <p>You must comply with all applicable laws and agree not to misuse the platform or attempt to access it using methods other than the provided interface.</p>

        <h2>Accounts</h2>
        <p>You are responsible for maintaining your account credentials and for all activities under your account.</p>

        <h2>Subscriptions & Payments</h2>
        <p>Where applicable, subscriptions are billed in advance. Refunds are governed by your jurisdiction’s consumer laws.</p>

        <h2>Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the service.</p>

        <h2>Changes</h2>
        <p>We may modify these terms. Continued use constitutes acceptance of the updated terms.</p>
      </article>
    </main>
  );
};

export default Terms;
