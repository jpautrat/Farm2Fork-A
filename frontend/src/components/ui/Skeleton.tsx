'use client';

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  animate?: boolean;
}

/**
 * Skeleton component for loading states
 */
export default function Skeleton({
  className,
  width,
  height,
  rounded = 'rounded-md',
  animate = true,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200',
        rounded,
        animate && 'animate-pulse',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="card h-full flex flex-col" aria-hidden="true">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for order cards
 */
export function OrderCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-4" aria-hidden="true">
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="mb-3">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton for user profile
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6" aria-hidden="true">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard stats
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-hidden="true">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-md shadow-sm">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ rows = 5, columns = 4 }) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true">
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <Skeleton className="h-5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
