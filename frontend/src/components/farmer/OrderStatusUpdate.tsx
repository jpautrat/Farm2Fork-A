'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}

export default function OrderStatusUpdate({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    if (status === currentStatus) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      
      onStatusUpdate(status);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      setStatus(currentStatus); // Reset to current status on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-3">Update Order Status</h3>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          className="input-field"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={handleStatusChange}
          className="btn-primary flex items-center justify-center"
          disabled={loading || status === currentStatus}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Updating...
            </>
          ) : (
            'Update Status'
          )}
        </button>
      </div>
    </div>
  );
}
