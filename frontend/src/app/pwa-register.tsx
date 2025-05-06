'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/utils/serviceWorker';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export default function PWARegister() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only run on the client side
    if (typeof window !== 'undefined') {
      try {
        registerServiceWorker();
        
        // Add beforeinstallprompt event listener to window
        window.addEventListener('beforeinstallprompt', (e) => {
          // Prevent the default browser install prompt
          e.preventDefault();
          // Store the event for later use
          // @ts-ignore - deferredPrompt is a custom property
          window.deferredPrompt = e;
        });
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }
  }, []);

  // Don't render anything on server or during hydration
  if (!isMounted) {
    return null;
  }

  return <InstallPrompt />;
}
