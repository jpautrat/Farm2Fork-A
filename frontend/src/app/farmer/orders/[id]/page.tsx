'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaUser, 
  FaMapMarkerAlt, 
  FaBox, 
  FaTruck,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import OrderStatusUpdate from '@/components/farmer/OrderStatusUpdate';

interface OrderDetailProps {
  params: {
    id: string;
  };
}

export default function OrderDetail({ params }: OrderDetailProps) {
  const router = useRouter();
  const user = useUser();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, params.id]);

  const handleStatusUpdate = (newStatus: string) => {
    setOrder({
      ...order,
      status: newStatus
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <Link href="/farmer/orders" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">Order not found</p>
        <Link href="/farmer/orders" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/farmer/orders" className="text-primary-600 hover:text-primary-700 mr-4">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold">Order #{order.id.substring(0, 8)}</h2>
                <p className="text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.product.image ? (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <FaBox className="text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium">{item.product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                          ${item.total_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>${(order.total_amount - order.shipping_fee - order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span>${order.shipping_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <OrderStatusUpdate 
            orderId={params.id} 
            currentStatus={order.status} 
            onStatusUpdate={handleStatusUpdate} 
          />
        </div>

        {/* Customer and Shipping Info */}
        <div>
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
              <FaUser className="text-gray-500 mr-2" />
              <h3 className="font-bold">Customer Information</h3>
            </div>
            <div className="mb-4">
              <p className="font-medium">{order.user.first_name} {order.user.last_name}</p>
              <div className="flex items-center text-gray-600 mt-1">
                <FaEnvelope className="mr-2 text-sm" />
                <span>{order.user.email}</span>
              </div>
              {order.user.phone && (
                <div className="flex items-center text-gray-600 mt-1">
                  <FaPhone className="mr-2 text-sm" />
                  <span>{order.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
              <FaMapMarkerAlt className="text-gray-500 mr-2" />
              <h3 className="font-bold">Shipping Address</h3>
            </div>
            <div>
              <p className="font-medium">{order.shipping_address.name}</p>
              <p className="text-gray-600">{order.shipping_address.street_address}</p>
              <p className="text-gray-600">
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p className="text-gray-600">{order.shipping_address.country}</p>
            </div>
          </div>

          {/* Shipping Information */}
          {order.tracking_number && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <FaTruck className="text-gray-500 mr-2" />
                <h3 className="font-bold">Tracking Information</h3>
              </div>
              <div>
                <p className="text-gray-600">Tracking Number:</p>
                <p className="font-medium">{order.tracking_number}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
