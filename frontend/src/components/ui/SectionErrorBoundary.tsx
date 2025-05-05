'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { FaExclamationCircle, FaRedo } from 'react-icons/fa';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  onRetry?: () => void;
}

/**
 * A specialized error boundary for specific sections of the application
 * with a more compact UI and retry functionality
 */
const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  title = 'Section',
  onRetry,
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const fallback = (
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center my-4">
      <div className="flex items-center justify-center mb-3">
        <FaExclamationCircle className="text-red-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">
          {title} failed to load
        </h3>
      </div>
      <p className="text-gray-600 mb-3 text-sm">
        There was a problem loading this content. You can try again or continue using other parts of the application.
      </p>
      <button
        onClick={handleRetry}
        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      >
        <FaRedo className="mr-1" /> Retry
      </button>
    </div>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

export default SectionErrorBoundary;
