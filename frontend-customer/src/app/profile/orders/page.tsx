'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Spinner, EmptyState } from '@/components/common/Loader';
import api from '@/lib/api';
import { Order } from '@/types';
import { Package, ChevronRight, ChevronLeft } from 'lucide-react';

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending', processing: 'badge-processing',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    api.get(`/orders/my-orders?page=${page}&limit=10`).then(res => {
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [isAuthenticated, page]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="p-2 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title="No orders yet"
            description="Place your first order to see it here"
            action={<Link href="/products" className="btn-gold px-6 py-3 rounded-xl text-sm">Browse Products</Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} href={`/orders/${order._id}`} className="block bg-primary-light border border-border rounded-2xl p-5 hover:border-accent-gold/30 transition-all group">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-mono font-semibold text-sm">{order.orderNumber}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadgeClass[order.status] || 'badge-pending'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-accent-gold font-bold text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p className="text-text-muted text-xs capitalize">{order.paymentMethod} • {order.paymentStatus}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2.5 rounded-xl border border-border hover:border-accent-gold/40 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2.5 rounded-xl border border-border hover:border-accent-gold/40 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
