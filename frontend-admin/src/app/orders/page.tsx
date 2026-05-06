'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api, { getErrorMessage } from '@/lib/api';
import { Order, Pagination } from '@/types';
import toast from 'react-hot-toast';
import { Search, ChevronDown } from 'lucide-react';

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending', processing: 'badge-processing',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/orders?page=${page}&limit=15${statusFilter ? `&status=${statusFilter}` : ''}`);
      if (res.data.success) {
        setOrders(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      setOrders(orders.map(o => o._id === id ? { ...o, status: status as any } : o));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-text-muted text-sm mt-1">View and update customer orders</p>
      </div>

      <div className="bg-primary-light border border-border rounded-2xl overflow-hidden flex flex-col min-h-[70vh]">
        <div className="p-4 border-b border-border flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-dark px-4 py-2.5 rounded-xl text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-primary-dark/50 text-text-muted border-b border-border">
                <tr>
                  <th className="p-4 font-medium">Order ID / Date</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-100 transition-colors">
                    <td className="p-4">
                      <p className="font-mono text-slate-950 font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-text-muted mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-950">{typeof order.user === 'object' ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</p>
                      <p className="text-xs text-text-muted mt-0.5">{typeof order.user === 'object' ? order.user.email : ''}</p>
                    </td>
                    <td className="p-4 text-text-secondary">{order.items.length} items</td>
                    <td className="p-4 font-semibold text-accent-gold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <p className="text-slate-950">{order.paymentMethod}</p>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-status-success/20 text-status-success' : 'bg-accent-gold/20 text-accent-gold'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block w-40">
                        <select
                          disabled={updatingId === order._id}
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold cursor-pointer outline-none transition-colors border ${statusBadgeClass[order.status]} ${updatingId === order._id ? 'opacity-50' : ''}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">No orders found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center text-sm">
            <span className="text-text-muted">Showing page {page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-slate-100">Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-slate-100">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
