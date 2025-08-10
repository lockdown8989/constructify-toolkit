import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const bannerKey = 'cookie_consent_v1';

type ConsentState = 'accepted' | 'rejected' | 'unset';

const CookieConsent: React.FC = () => {
  const [state, setState] = React.useState<ConsentState>(() => {
    if (typeof window === 'undefined') return 'unset';
    return (localStorage.getItem(bannerKey) as ConsentState) || 'unset';
  });

  const handleAccept = () => {
    localStorage.setItem(bannerKey, 'accepted');
    setState('accepted');
  };

  const handleReject = () => {
    localStorage.setItem(bannerKey, 'rejected');
    setState('rejected');
  };

  if (state !== 'unset') return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="mx-auto max-w-5xl md:max-w-6xl lg:max-w-7xl px-4 py-4 md:py-5">
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg md:flex md:items-center md:justify-between p-4 md:p-5 animate-fade-in">
          <div className="md:pr-6">
            <h2 className="text-base md:text-lg font-semibold">We value your privacy</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We use cookies to enhance your experience, analyze traffic, and for essential site functionality. You can accept or reject non‑essential cookies. Read our <Link to="/cookies" className="underline">Cookie Policy</Link>.
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2 md:gap-3">
            <Button variant="outline" size="sm" onClick={handleReject} aria-label="Reject non-essential cookies">
              Reject
            </Button>
            <Button size="sm" onClick={handleAccept} aria-label="Accept all cookies">
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
