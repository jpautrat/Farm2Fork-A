'use client';

import { useState, useEffect, ReactNode } from 'react';

/**
 * A component that only renders its children on the client side
 * This helps prevent hydration errors when using client-side only features
 */
export default function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return <>{children}</>;
}