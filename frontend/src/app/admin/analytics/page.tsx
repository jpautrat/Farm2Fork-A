'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaSpinner,
  FaBoxOpen,
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers
} from 'react-icons/fa';

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  averageOrderValue: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
}

export default function AdminAnalytics() {
  const user = useUser();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // In a real implementation, we would fetch from the API
        // const response = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_URL}/analytics?timeRange=${timeRange}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        //     },
        //   }
        // );
        
        // setAnalyticsData(response.data.data);
        
        // For now, use mock data
        setTimeout(() => {
          const mockData: AnalyticsData = {
            totalSales: 24680.50,
            totalOrders: 342,
            totalUsers: 156,
            totalProducts: 78,
            averageOrderValue: 72.16,
            salesByMonth: [
              { month: 'Jan', sales: 1850.25 },
              { month: 'Feb', sales: 2100.75 },
              { month: 'Mar', sales: 2450.50 },
              { month: 'Apr', sales: 2300.25 },
              { month: 'May', sales: 2650.75 },
              { month: 'Jun', sales: 3100.50 },
              { month: 'Jul', sales: 3250.25 },
              { month: 'Aug', sales: 3400.75 },
              { month: 'Sep', sales: 3200.50 },
              { month: 'Oct', sales: 3450.25 },
              { month: 'Nov', sales: 3700.75 },
              { month: 'Dec', sales: 4100.50 }
            ],
            ordersByStatus: [
              { status: 'Pending', count: 45 },
              { status: 'Processing', count: 32 },
              { status: 'Shipped', count: 28 },
              { status: 'Delivered', count: 230 },
              { status: 'Cancelled', count: 7 }
            ],
            topProducts: [
              { id: '1', name: 'Organic Carrots', total_sold: 120, revenue: 478.80 },
              { id: '2', name: 'Free-Range Eggs', total_sold: 98, revenue: 587.02 },
              { id: '3', name: 'Strawberries', total_sold: 85, revenue: 424.15 },
              { id: '4', name: 'Kale', total_sold: 72, revenue: 215.28 },
              { id: '5', name: 'Tomatoes', total_sold: 65, revenue: 259.35 }
            ],
            usersByRole: [
              { role: 'Consumer', count: 120 },
              { role: 'Farmer', count: 35 },
              { role: 'Admin', count: 1 }
            ]
          };
          
          setAnalyticsData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-3xl" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">No analytics data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '7d'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '30d'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '90d'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '1y'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold">${analyticsData.totalSales.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaShoppingCart className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalUsers}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaBoxOpen className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalProducts}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">Monthly Sales</h2>
          </div>
          <div className="h-64">
            <div className="flex h-full items-end">
              {analyticsData.salesByMonth.map((month) => {
                const maxSales = Math.max(...analyticsData.salesByMonth.map(m => m.sales));
                const height = (month.sales / maxSales) * 100;
                
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full max-w-[30px] bg-primary-500 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs mt-2">{month.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders by Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">Orders by Status</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full">
              {analyticsData.ordersByStatus.map((status) => (
                <div key={status.status} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ 
                      backgroundColor: 
                        status.status === 'Pending' ? '#FCD34D' :
                        status.status === 'Processing' ? '#60A5FA' :
                        status.status === 'Shipped' ? '#A78BFA' :
                        status.status === 'Delivered' ? '#34D399' :
                        '#F87171'
                    }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm">{status.status}</div>
                    <div className="text-xs text-gray-500">{status.count} orders</div>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round((status.count / analyticsData.totalOrders) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaBoxOpen className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">Top Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.total_sold}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.revenue.toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaUsers className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">User Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full">
              {analyticsData.usersByRole.map((role) => {
                const percentage = (role.count / analyticsData.totalUsers) * 100;
                
                return (
                  <div key={role.role} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{role.role}</span>
                      <span className="text-sm text-gray-500">{role.count} users ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          role.role === 'Consumer' ? 'bg-blue-600' :
                          role.role === 'Farmer' ? 'bg-green-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
