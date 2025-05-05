'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/serviceWorker';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export default function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
    
    // Add beforeinstallprompt event listener to window
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      // @ts-ignore - deferredPrompt is a custom property
      window.deferredPrompt = e;
    });
  }, []);

  return <InstallPrompt />;
}
