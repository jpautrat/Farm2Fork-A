'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import axios from 'axios';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle,
  FaBug
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details: any;
}

export default function SystemLogs() {
  const user = useUser();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const logsPerPage = 20;

  useEffect(() => {
    fetchLogs();
    fetchSources();
  }, [user, levelFilter, sourceFilter, sortField, sortOrder, currentPage]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // In a real implementation, we would fetch from the API
      // Build query parameters
      // const params = new URLSearchParams();
      // params.append('page', currentPage.toString());
      // params.append('limit', logsPerPage.toString());
      // params.append('sort_by', sortField);
      // params.append('order', sortOrder);
      
      // if (levelFilter) {
      //   params.append('level', levelFilter);
      // }
      
      // if (sourceFilter) {
      //   params.append('source', sourceFilter);
      // }
      
      // Fetch logs
      // const response = await axios.get(
      //   `${process.env.NEXT_PUBLIC_API_URL}/logs?${params.toString()}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      //     },
      //   }
      // );
      
      // setLogs(response.data.data);
      // setTotalLogs(response.data.total);
      // setTotalPages(Math.ceil(response.data.total / logsPerPage));
      
      // For now, use mock data
      setTimeout(() => {
        const mockLogs: LogEntry[] = [
          {
            id: '1',
            timestamp: '2023-06-15T10:30:45Z',
            level: 'info',
            message: 'User login successful',
            source: 'auth.controller',
            details: { userId: '123', email: 'user@example.com' }
          },
          {
            id: '2',
            timestamp: '2023-06-15T10:28:12Z',
            level: 'error',
            message: 'Payment processing failed',
            source: 'payment.controller',
            details: { orderId: '456', error: 'Invalid card details' }
          },
          {
            id: '3',
            timestamp: '2023-06-15T10:25:30Z',
            level: 'warn',
            message: 'Low stock alert',
            source: 'product.controller',
            details: { productId: '789', quantity: 2 }
          },
          {
            id: '4',
            timestamp: '2023-06-15T10:20:15Z',
            level: 'info',
            message: 'Order created',
            source: 'order.controller',
            details: { orderId: '101', userId: '123', total: 45.99 }
          },
          {
            id: '5',
            timestamp: '2023-06-15T10:15:22Z',
            level: 'debug',
            message: 'API request received',
            source: 'api.middleware',
            details: { path: '/api/products', method: 'GET' }
          },
          {
            id: '6',
            timestamp: '2023-06-15T10:10:05Z',
            level: 'error',
            message: 'Database connection error',
            source: 'database.service',
            details: { error: 'Connection timeout' }
          },
          {
            id: '7',
            timestamp: '2023-06-15T10:05:18Z',
            level: 'info',
            message: 'New user registered',
            source: 'auth.controller',
            details: { userId: '124', email: 'newuser@example.com' }
          },
          {
            id: '8',
            timestamp: '2023-06-15T10:00:30Z',
            level: 'warn',
            message: 'Rate limit approaching',
            source: 'api.middleware',
            details: { ip: '192.168.1.1', requests: 95, limit: 100 }
          },
          {
            id: '9',
            timestamp: '2023-06-15T09:55:42Z',
            level: 'info',
            message: 'Order status updated',
            source: 'order.controller',
            details: { orderId: '102', status: 'shipped' }
          },
          {
            id: '10',
            timestamp: '2023-06-15T09:50:11Z',
            level: 'debug',
            message: 'Cache hit',
            source: 'cache.service',
            details: { key: 'products:featured', size: '15kb' }
          }
        ];
        
        setLogs(mockLogs);
        setTotalLogs(100); // Mock total
        setTotalPages(5); // Mock pages
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load system logs');
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    // In a real implementation, we would fetch from the API
    // For now, use mock data
    setSources([
      'auth.controller',
      'payment.controller',
      'product.controller',
      'order.controller',
      'api.middleware',
      'database.service',
      'cache.service'
    ]);
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(1);
    fetchLogs();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending order for a new field
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDownloadLogs = () => {
    // In a real implementation, we would download logs from the API
    toast.success('Logs download started');
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'warn':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'debug':
        return <FaBug className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const filteredLogs = searchTerm
    ? logs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <button
          onClick={handleDownloadLogs}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <FaDownload className="mr-2" />
          Download Logs
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                className="w-full p-2 pl-10 border border-gray-300 rounded-md appearance-none"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                className="w-full p-2 pl-10 border border-gray-300 rounded-md appearance-none"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    <span>Timestamp</span>
                    {sortField === 'timestamp' && (
                      sortOrder === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center">
                    <span>Level</span>
                    {sortField === 'level' && (
                      sortOrder === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center">
                    <span>Source</span>
                    {sortField === 'source' && (
                      sortOrder === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getLevelIcon(log.level)}
                      <span className="ml-2 text-sm capitalize">{log.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="text-xs overflow-x-auto max-w-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * logsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * logsPerPage, totalLogs)}
                </span>{' '}
                of <span className="font-medium">{totalLogs}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === pageNum
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
