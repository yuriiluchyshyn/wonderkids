import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { App } from './App';
import { inject } from '@vercel/analytics';
import { adoptChildHandoff, dropStaleSession, watchSession } from '@/core/account/auth/useAuthStore';
import { rememberSource } from '@/core/app/attribution';
import { rememberOffer } from '@/core/app/offer';
import { beginDemo } from '@/core/app/demo';
import { loadAvailability } from '@/core/app/availability';
import { markPlatform } from '@/core/app/platform';
import '@pulsar/brand/fonts.css';
import '@pulsar/brand/night-sky.css';
import './styles/theme-fonts.css';
import './styles/global.css';

// What the game runs on — the stylesheets ask before the first paint
// (`docs/browser-support.md`).
markPlatform();

// Register all learning modules with the micro-kernel before the UI mounts.
import './games';

// Opened from the parent cabinet as one of the children: sign in before the
// first render, so the login page never flashes.
adoptChildHandoff();
// Signed out, or another account signed in, on the other portal or in another
// tab since this session began: it is over — before anything shows it.
dropStaleSession();
watchSession();

// The channel that brought the visitor (utm_* in the address), kept for the
// moment a parent account is created.
rememberSource();

// The plan a link offered (the site's window of prices, an owner's link with a promotion code), kept for the
// paywall once the parent has signed in.
rememberOffer();

// The trial game: an address that asks for it (`/try`), or a tab already in one.
beginDemo();

// Where the visitor is: what the owner offers there (languages, games), and
// the language of that country — unless they have chosen one.
void loadAvailability((import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''));

// Vercel Web Analytics: anonymous page views, no cookies (a no-op outside a
// Vercel deployment). Only the path is reported — a query string can carry a
// sign-in code on its way back from Auth0.
inject({ beforeSend: (event) => ({ ...event, url: event.url.split('?')[0] }) });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    {/* A device set to reduce motion gets framer-motion's moves as fades too,
        as the stylesheets already do for CSS (`prefers-reduced-motion`). */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
