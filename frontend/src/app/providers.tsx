'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import OfflineNotification from '@/components/ui/OfflineNotification';
import { ErrorInfo } from 'react';

// Configure React Query with retry logic
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(defaultQueryClientOptions));
  // Use standard supabase-js client instead of Next.js specific client
  const [supabaseClient] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ));

  // Handle global errors
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // In a production app, you would send this to an error tracking service
    console.error('Caught an error:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            {children}
            <OfflineNotification />
          </NotificationProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  );
}
