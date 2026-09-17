import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Purge any stale cache versions from previous iterations
if (typeof window !== 'undefined') {
  try {
    const keysToPurge: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('viet_han') || key.includes('kbit_') || key.includes('symposium')) && !key.includes('v5')) {
        keysToPurge.push(key);
      }
    }
    keysToPurge.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
