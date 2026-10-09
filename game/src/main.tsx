import { offerLangByCountry } from '@/core/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { inject } from '@vercel/analytics';
import { adoptChildHandoff } from '@/core/account/auth/useAuthStore';
import { rememberSource } from '@/core/app/attribution';
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

// Offer the language of the visitor's country, unless they have chosen one.
void offerLangByCountry((import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''));

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
