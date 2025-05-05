'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { showInstallPrompt, isAppInstallable, isAppInstalled } from '@/utils/serviceWorker';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Check if the app is installable and not already installed
    const checkInstallable = () => {
      const canInstall = isAppInstallable() && !isAppInstalled();
      setInstallable(canInstall);
      setShowPrompt(canInstall);
    };

    // Check immediately
    checkInstallable();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // @ts-ignore - deferredPrompt is a custom property
      window.deferredPrompt = e;
      checkInstallable();
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // Clear the deferredPrompt variable
      // @ts-ignore
      window.deferredPrompt = null;
      setInstallable(false);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store in localStorage to prevent showing again for a while
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!showPrompt || !installable) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">Install Farm2Fork App</h3>
          <p className="text-sm text-gray-600">
            Add to your home screen for a better experience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="btn-primary py-2 px-4 text-sm flex items-center"
          >
            <FaDownload className="mr-2" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
}
