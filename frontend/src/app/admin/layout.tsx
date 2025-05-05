'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { 
  FaHome, 
  FaUsers, 
  FaShoppingBag, 
  FaBox, 
  FaSignOutAlt,
  FaChartLine,
  FaClipboardList
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (!user) {
      // User is not authenticated, redirect to login
      router.push('/auth/login');
    } else if (user.user_metadata?.role !== 'admin') {
      // User is not an admin, redirect to home
      toast.error('You do not have access to the admin dashboard');
      router.push('/');
    }
  }, [user, router]);

  // If user is not authenticated or not an admin, don't render the dashboard
  if (!user || user.user_metadata?.role !== 'admin') {
    return null;
  }

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return pathname?.startsWith(path)
      ? 'bg-primary-700 text-white'
      : 'text-white hover:bg-primary-700';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-primary-800 text-white">
        <div className="p-4 border-b border-primary-700">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 ${isActive('/admin/dashboard')}`}
              >
                <FaHome className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center px-4 py-3 ${isActive('/admin/users')}`}
              >
                <FaUsers className="mr-3" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className={`flex items-center px-4 py-3 ${isActive('/admin/products')}`}
              >
                <FaBox className="mr-3" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className={`flex items-center px-4 py-3 ${isActive('/admin/orders')}`}
              >
                <FaShoppingBag className="mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className={`flex items-center px-4 py-3 ${isActive('/admin/analytics')}`}
              >
                <FaChartLine className="mr-3" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/logs"
                className={`flex items-center px-4 py-3 ${isActive('/admin/logs')}`}
              >
                <FaClipboardList className="mr-3" />
                <span>System Logs</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-primary-700">
          <button
            onClick={() => {
              // Sign out logic
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
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
