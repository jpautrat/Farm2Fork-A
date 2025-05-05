'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { 
  FaHome, 
  FaBox, 
  FaShoppingBag, 
  FaUser, 
  FaSignOutAlt,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();

  // Check if user is authenticated and is a farmer
  useEffect(() => {
    if (!user) {
      // User is not authenticated, redirect to login
      router.push('/auth/login');
    } else if (user.user_metadata?.role !== 'farmer') {
      // User is not a farmer, redirect to home
      toast.error('You do not have access to the farmer dashboard');
      router.push('/');
    }
  }, [user, router]);

  // If user is not authenticated or not a farmer, don't render the dashboard
  if (!user || user.user_metadata?.role !== 'farmer') {
    return null;
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/') 
      ? 'bg-primary-700 text-white' 
      : 'text-white hover:bg-primary-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-primary-800 text-white">
        <div className="p-4 border-b border-primary-700">
          <h1 className="text-xl font-bold">Farmer Dashboard</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                href="/farmer/dashboard"
                className={`flex items-center px-4 py-3 ${isActive('/farmer/dashboard')}`}
              >
                <FaHome className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/farmer/products"
                className={`flex items-center px-4 py-3 ${isActive('/farmer/products')}`}
              >
                <FaBox className="mr-3" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                href="/farmer/orders"
                className={`flex items-center px-4 py-3 ${isActive('/farmer/orders')}`}
              >
                <FaShoppingBag className="mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/farmer/profile"
                className={`flex items-center px-4 py-3 ${isActive('/farmer/profile')}`}
              >
                <FaUser className="mr-3" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                href="/farmer/analytics"
                className={`flex items-center px-4 py-3 ${isActive('/farmer/analytics')}`}
              >
                <FaChartLine className="mr-3" />
                <span>Analytics</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-primary-700">
          <button
            onClick={() => {
              // Sign out logic will be implemented
              router.push('/');
            }}
            className="flex items-center px-4 py-3 w-full text-white hover:bg-primary-600"
          >
            <FaSignOutAlt className="mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
