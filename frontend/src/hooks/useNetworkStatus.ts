'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  since: Date | null;
}

/**
 * Hook to track network status (online/offline)
 * @returns NetworkStatus object with online status and recovery information
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    since: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus((prevStatus) => ({
        isOnline: true,
        wasOffline: prevStatus.isOnline === false,
        since: prevStatus.isOnline === false ? prevStatus.since : null,
      }));
    };

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        wasOffline: false,
        since: new Date(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

export default useNetworkStatus;
