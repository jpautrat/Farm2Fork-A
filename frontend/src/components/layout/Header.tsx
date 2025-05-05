'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { getTotalItems } = useCartStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600';
  };

  return (
    <header className="bg-white shadow-sm" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded" aria-label="Farm2Fork Home">
            <span className="text-2xl font-bold text-primary-600">Farm2Fork</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <Link href="/" className={`${isActive('/')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}>
              Home
            </Link>
            <Link href="/shop" className={`${isActive('/shop')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}>
              Shop
            </Link>
            <Link href="/farmers" className={`${isActive('/farmers')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}>
              Farmers
            </Link>
            <Link href="/about" className={`${isActive('/about')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}>
              About
            </Link>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded p-1"
              aria-label={`Shopping cart with ${getTotalItems()} items`}
            >
              <FaShoppingCart className="text-xl" aria-hidden="true" />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full"
                  aria-hidden="true"
                >
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </Link>

            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded p-1"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <FaUser className="text-xl" aria-hidden="true" />
                </button>
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block focus-within:block"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-primary-600"
                    role="menuitem"
                  >
                    My Account
                  </Link>
                  {user.user_metadata?.role === 'farmer' && (
                    <Link
                      href="/farmer/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-primary-600"
                      role="menuitem"
                    >
                      Farmer Dashboard
                    </Link>
                  )}
                  {user.user_metadata?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-primary-600"
                      role="menuitem"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-primary-600"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 p-1 rounded"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ?
                <FaTimes className="text-xl" aria-hidden="true" /> :
                <FaBars className="text-xl" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col space-y-4 mb-4">
              <Link
                href="/"
                className={`${isActive('/')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`${isActive('/shop')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/farmers"
                className={`${isActive('/farmers')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}
                onClick={() => setIsMenuOpen(false)}
              >
                Farmers
              </Link>
              <Link
                href="/about"
                className={`${isActive('/about')} font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded p-1"
                onClick={() => setIsMenuOpen(false)}
                aria-label={`Shopping cart with ${getTotalItems()} items`}
              >
                <FaShoppingCart className="text-xl" aria-hidden="true" />
                {getTotalItems() > 0 && (
                  <span
                    className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full"
                    aria-hidden="true"
                  >
                    {getTotalItems() > 9 ? '9+' : getTotalItems()}
                  </span>
                )}
              </Link>

              {user && <NotificationDropdown />}
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/account"
                    className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  {user.user_metadata?.role === 'farmer' && (
                    <Link
                      href="/farmer/dashboard"
                      className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Farmer Dashboard
                    </Link>
                  )}
                  {user.user_metadata?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    <FaSignOutAlt className="mr-2" aria-hidden="true" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
