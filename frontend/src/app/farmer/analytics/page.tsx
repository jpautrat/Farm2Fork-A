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
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function FarmerAnalytics() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30days'); // '30days', '90days', '12months'

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // In a real application, we would fetch this data from the backend
        // For now, we'll simulate it with mock data
        
        // This would be the actual API call:
        // const response = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_URL}/analytics/farmer?timeRange=${timeRange}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        //     },
        //   }
        // );
        // setAnalyticsData(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          const mockData: AnalyticsData = {
            totalSales: 12580.45,
            totalOrders: 156,
            averageOrderValue: 80.64,
            topProducts: [
              { id: '1', name: 'Organic Carrots', total_sold: 245, revenue: 980.00 },
              { id: '2', name: 'Fresh Eggs (Dozen)', total_sold: 187, revenue: 1122.00 },
              { id: '3', name: 'Heirloom Tomatoes', total_sold: 156, revenue: 780.00 },
              { id: '4', name: 'Grass-Fed Beef', total_sold: 89, revenue: 1780.00 },
              { id: '5', name: 'Organic Kale', total_sold: 78, revenue: 390.00 },
            ],
            salesByMonth: [
              { month: 'Jan', sales: 980 },
              { month: 'Feb', sales: 1200 },
              { month: 'Mar', sales: 1100 },
              { month: 'Apr', sales: 1400 },
              { month: 'May', sales: 1250 },
              { month: 'Jun', sales: 1800 },
              { month: 'Jul', sales: 1600 },
              { month: 'Aug', sales: 1750 },
              { month: 'Sep', sales: 1300 },
              { month: 'Oct', sales: 1150 },
              { month: 'Nov', sales: 950 },
              { month: 'Dec', sales: 1100 },
            ],
            ordersByStatus: [
              { status: 'Delivered', count: 98 },
              { status: 'Shipped', count: 23 },
              { status: 'Processing', count: 18 },
              { status: 'Pending', count: 12 },
              { status: 'Cancelled', count: 5 },
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
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div>
          <select
            className="input-field"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
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
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Average Order</p>
              <h3 className="text-2xl font-bold">${analyticsData.averageOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Unique Customers</p>
              <h3 className="text-2xl font-bold">{Math.floor(analyticsData.totalOrders * 0.7)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaBoxOpen className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">Top Selling Products</h2>
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
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.total_sold}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-gray-500 mr-2" />
            <h2 className="text-lg font-bold">Orders by Status</h2>
          </div>
          <div className="space-y-4">
            {analyticsData.ordersByStatus.map((statusData) => (
              <div key={statusData.status}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{statusData.status}</span>
                  <span className="text-sm text-gray-500">{statusData.count} orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      statusData.status === 'Delivered' ? 'bg-green-600' :
                      statusData.status === 'Shipped' ? 'bg-blue-600' :
                      statusData.status === 'Processing' ? 'bg-yellow-600' :
                      statusData.status === 'Pending' ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(statusData.count / analyticsData.totalOrders) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
}
