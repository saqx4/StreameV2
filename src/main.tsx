/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
// Initialize secure logger and disable console in production
import './utils/logger'

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
