import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { adoptChildHandoff } from '@/core/account/auth/useAuthStore';
import './styles/global.css';

// Register all learning modules with the micro-kernel before the UI mounts.
import './games';

// Opened from the parent cabinet as one of the children: sign in before the
// first render, so the login page never flashes.
adoptChildHandoff();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
