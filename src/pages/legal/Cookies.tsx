import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Cookies: React.FC = () => {
  return (
    <main className="responsive-container py-10 md:py-14">
      <Helmet>
        <title>Cookie Policy</title>
        <meta name="description" content="Cookie Policy detailing how we use cookies and similar technologies." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <article className="prose prose-neutral dark:prose-invert max-w-3xl">
        <h1>Cookie Policy</h1>
        <p>We use cookies for essential functionality, analytics, and improving user experience.</p>

        <h2>Types of Cookies</h2>
        <ul>
          <li>Strictly necessary cookies (essential for login and core features)</li>
          <li>Performance and analytics cookies (with your consent)</li>
          <li>Preference cookies to remember your settings</li>
        </ul>

        <h2>Managing Cookies</h2>
        <p>You can change your cookie preferences in your browser or revisit our consent banner. Clear your local storage to reset your preference or visit the homepage to see the banner again.</p>

        <p>See also our <Link to="/privacy">Privacy Policy</Link>.</p>
      </article>
    </main>
  );
};

export default Cookies;
