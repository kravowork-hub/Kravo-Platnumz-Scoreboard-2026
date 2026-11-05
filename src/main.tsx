import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available, updating...');
  },
  onOfflineReady() {
    console.log('[PWA] Kravo Platnumz Scoreboard is offline ready.');
  },
});

import { AuthProvider } from './AuthContext';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
