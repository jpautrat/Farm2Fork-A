'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { FaCheckCircle, FaBox, FaShoppingBag, FaHome } from 'react-icons/fa';
import axios from 'axios';

interface OrderDetails {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  tracking_number: string | null;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
      image: string;
    };
  }>;
  shipping_address: {
    name: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setOrder(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-50 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary py-2 px-6">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-yellow-50 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-yellow-700 mb-4">Order Not Found</h1>
          <p className="text-yellow-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/" className="btn-primary py-2 px-6">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Order Number</h3>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Date</h3>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Total</h3>
                <p className="font-medium">${order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Status</h3>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
            </div>

            {order.tracking_number && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-700 mb-1">Tracking Information</h3>
                <p className="text-blue-600">
                  Your order has been shipped! Tracking number: {order.tracking_number}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Items</h2>
          </div>
          <div className="p-6">
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaBox className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">
                      Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Shipping Address</h2>
          </div>
          <div className="p-6">
            <p className="font-medium">{order.shipping_address.name}</p>
            <p className="text-gray-600">
              {order.shipping_address.street_address}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/account/orders"
            className="btn-outline py-3 px-6 flex items-center justify-center"
          >
            <FaShoppingBag className="mr-2" /> View All Orders
          </Link>
          <Link href="/" className="btn-primary py-3 px-6 flex items-center justify-center">
            <FaHome className="mr-2" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
