'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaBox, 
  FaShoppingBag, 
  FaExclamationTriangle, 
  FaChartLine,
  FaPlus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  totalOrders: number;
  lowStockProducts: number;
  recentOrders: any[];
  lowStockItems: any[];
}

export default function FarmerDashboard() {
  const user = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch farmer profile to get farmer_id
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/farmer/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const farmerId = profileResponse.data.data.id;
        
        // Fetch products
        const productsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/farmer/${farmerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const products = productsResponse.data.data;
        const activeProducts = products.filter((p: any) => p.is_active).length;
        const lowStockItems = products.filter((p: any) => p.stock_quantity < 5);
        
        // Fetch orders
        const ordersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/farmer-orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const orders = ordersResponse.data.data;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        const recentOrders = orders.slice(0, 5); // Get 5 most recent orders
        
        setStats({
          totalProducts: products.length,
          activeProducts,
          pendingOrders,
          totalOrders: orders.length,
          lowStockProducts: lowStockItems.length,
          recentOrders,
          lowStockItems: lowStockItems.slice(0, 5) // Get 5 low stock items
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Link href="/farmer/products/create" className="btn-primary flex items-center">
          <FaPlus className="mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <FaBox className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600 mr-4">
              <FaShoppingBag className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Pending Orders</p>
              <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <FaExclamationTriangle className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Low Stock Items</p>
              <h3 className="text-2xl font-bold">{stats.lowStockProducts}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link href={`/farmer/orders/${order.id}`} className="text-primary-600 hover:underline">
                          {order.id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${order.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent orders found.</p>
          )}
          <div className="mt-4">
            <Link href="/farmer/orders" className="text-primary-600 hover:underline">
              View all orders
            </Link>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Low Stock Items</h2>
          {stats.lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.lowStockItems.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {product.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`font-medium ${product.stock_quantity === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {product.stock_quantity} {product.unit}s
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link href={`/farmer/products/${product.id}/edit`} className="text-primary-600 hover:underline">
                          Update stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No low stock items found.</p>
          )}
          <div className="mt-4">
            <Link href="/farmer/products" className="text-primary-600 hover:underline">
              View all products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
