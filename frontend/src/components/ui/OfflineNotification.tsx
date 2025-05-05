'use client';

import React, { useEffect, useState } from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Component to display a notification when the user is offline
 * and a recovery message when they come back online
 */
const OfflineNotification: React.FC = () => {
  const { isOnline, wasOffline, since } = useNetworkStatus();
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);

  // Show recovery message when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRecoveryMessage(true);
      const timer = setTimeout(() => {
        setShowRecoveryMessage(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Format offline duration
  const getOfflineDuration = (): string => {
    if (!since) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - since.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-3 z-50 flex items-center justify-center">
        <FaExclamationTriangle className="mr-2" />
        <span>
          You are currently offline. Please check your internet connection.
          {since && ` (Offline for ${getOfflineDuration()})`}
        </span>
      </div>
    );
  }

  if (showRecoveryMessage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-3 z-50 flex items-center justify-center">
        <FaWifi className="mr-2" />
        <span>You are back online! Reconnected after {getOfflineDuration()}</span>
      </div>
    );
  }

  return null;
};

export default OfflineNotification;
