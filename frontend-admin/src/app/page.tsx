'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { TrendingUp, Package, Users, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => {
      if (res.data.success) setStats(res.data.data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { title: 'Revenue', value: `Rs. ${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: <TrendingUp className="w-6 h-6 text-gold" /> },
    { title: 'Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag className="w-6 h-6 text-gold" /> },
    { title: 'Products', value: stats?.totalProducts || 0, icon: <Package className="w-6 h-6 text-gold" /> },
    { title: 'Customers', value: stats?.totalCustomers || 0, icon: <Users className="w-6 h-6 text-gold" /> },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Overview</p>
          <h1 className="text-3xl font-display font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Track store health, recent orders, and catalog activity.</p>
        </div>
        <Link href="/products" className="btn-outline-gold px-4 py-2 rounded-lg text-sm">
          Manage Products
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.title} className="admin-card p-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 rounded-lg bg-gold/10 border border-gold/20">
                    {card.icon}
                  </div>
                </div>
                <p className="text-text-muted text-sm mb-1 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold text-text-primary">{card.value}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Live store metric</span>
                </p>
              </div>
            ))}
          </div>

          <div className="admin-card overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-text-primary">Recent Orders</h2>
                <p className="text-xs text-text-muted mt-1">Newest customer activity</p>
              </div>
              <Link href="/orders" className="text-sm text-gold hover:text-gold-light transition-colors">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-left text-sm">
                <thead className="border-b border-border-subtle">
                  <tr>
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Total</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {stats?.recentOrders?.map((order) => (
                    <tr key={order._id} className="transition-colors">
                      <td className="p-4 font-mono text-text-primary">{order.orderNumber}</td>
                      <td className="p-4 text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-text-primary">{typeof order.user === 'object' ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</td>
                      <td className="p-4 font-semibold text-gold">Rs. {order.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium badge-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats?.recentOrders?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-muted">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
