// Extend Navigator interface to include the standalone property for iOS Safari
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed: ', error);
        });
    });
  }
}

/**
 * Show PWA install prompt
 * @returns {Promise<boolean>} - Whether the prompt was shown
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // @ts-ignore - deferredPrompt is a custom property
  const deferredPrompt = window.deferredPrompt;
  if (!deferredPrompt) return false;

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  // Clear the deferredPrompt variable
  // @ts-ignore
  window.deferredPrompt = null;

  return outcome === 'accepted';
}

/**
 * Check if the app is installable
 * @returns {boolean} - Whether the app is installable
 */
export function isAppInstallable(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore - deferredPrompt is a custom property
  return !!window.deferredPrompt;
}

/**
 * Check if the app is already installed
 * @returns {boolean} - Whether the app is already installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator && navigator.standalone === true);
}
