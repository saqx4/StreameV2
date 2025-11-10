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

// Add global error handler with visible feedback
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Show visible error for debugging
  showErrorOverlay('Global Error', event.error?.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorOverlay('Promise Rejection', event.reason?.message || event.reason);
});

// Helper function to show error overlay
function showErrorOverlay(title: string, message: string) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  overlay.innerHTML = `
    <div style="max-width: 600px; padding: 2rem; text-align: center;">
      <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">⚠️ ${title}</h1>
      <p style="color: #9ca3af; margin-bottom: 1.5rem;">${message}</p>
      <button onclick="window.location.reload()" style="
        background: #10b981;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
      ">Reload Page</button>
      <p style="color: #6b7280; margin-top: 1rem; font-size: 0.875rem;">Check browser console (F12) for details</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// Wrap initialization in try-catch
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to initialize app:', error);
  showErrorOverlay('Initialization Error', error instanceof Error ? error.message : 'Failed to start application');
}
