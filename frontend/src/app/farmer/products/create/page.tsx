'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import ProductForm from '@/components/farmer/ProductForm';

export default function CreateProduct() {
  const router = useRouter();
  const user = useUser();

  // Check if user is authenticated and is a farmer
  useEffect(() => {
    if (!user) {
      // User is not authenticated, redirect to login
      router.push('/auth/login');
    } else if (user.user_metadata?.role !== 'farmer') {
      // User is not a farmer, redirect to home
      router.push('/');
    }
  }, [user, router]);

  // If user is not authenticated or not a farmer, don't render the page
  if (!user || user.user_metadata?.role !== 'farmer') {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/farmer/products" className="text-primary-600 hover:text-primary-700 mr-4">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Create New Product</h1>
      </div>
      
      <ProductForm />
    </div>
  );
}
