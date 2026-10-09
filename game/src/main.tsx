import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { inject } from '@vercel/analytics';
import { adoptChildHandoff } from '@/core/account/auth/useAuthStore';
import { rememberSource } from '@/core/app/attribution';
import { beginDemo } from '@/core/app/demo';
import { loadAvailability } from '@/core/app/availability';
import '@pulsar/brand/night-sky.css';
import './styles/global.css';

// Register all learning modules with the micro-kernel before the UI mounts.
import './games';

// Opened from the parent cabinet as one of the children: sign in before the
// first render, so the login page never flashes.
adoptChildHandoff();

// The channel that brought the visitor (utm_* in the address), kept for the
// moment a parent account is created.
rememberSource();

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
    <App />
  </StrictMode>,
);
