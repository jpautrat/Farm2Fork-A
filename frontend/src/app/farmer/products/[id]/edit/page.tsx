'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/farmer/ProductForm';

interface EditProductProps {
  params: {
    id: string;
  };
}

export default function EditProduct({ params }: EditProductProps) {
  const router = useRouter();
  const user = useUser();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const productData = response.data.data;
        
        // Check if the product belongs to the current farmer
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/farmer/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const farmerId = profileResponse.data.data.id;
        
        if (productData.farmer_id !== farmerId) {
          setError('You do not have permission to edit this product');
          toast.error('You do not have permission to edit this product');
          router.push('/farmer/products');
          return;
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [user, params.id, router]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <Link href="/farmer/products" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/farmer/products" className="text-primary-600 hover:text-primary-700 mr-4">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      {product && (
        <ProductForm
          productId={params.id}
          initialData={{
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit,
            stock_quantity: product.stock_quantity,
            category_id: product.category_id,
            image: product.image,
            is_organic: product.is_organic,
            is_featured: product.is_featured,
            is_active: product.is_active
          }}
        />
      )}
    </div>
  );
}
