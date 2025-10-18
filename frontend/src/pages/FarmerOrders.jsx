import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        // backend's farmer orders endpoint may differ; try /orders/farmer if available
        setOrders(res.data.orders || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-poppins mb-4">Orders (Farmer)</h1>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id || order.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-medium">Order #{order._id || order.id}</h2>
                  <div className="text-sm text-gray-500">{new Date(order.createdAt || order.date).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">₹{order.totalAmount || order.total}</div>
                  <div className="text-sm text-gray-600">{order.orderStatus || order.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
