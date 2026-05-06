'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common/Loader';
import api from '@/lib/api';
import { Order } from '@/types';
import { ChevronLeft, Package, MapPin, CreditCard } from 'lucide-react';

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending', processing: 'badge-processing',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    api.get(`/orders/${id}`).then(res => {
      if (res.data.success) setOrder(res.data.data);
    }).catch(() => router.push('/profile/orders')).finally(() => setIsLoading(false));
  }, [isAuthenticated, id, router]);

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!order) return null;

  const currentStep = order.status === 'cancelled' ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile/orders" className="p-2 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-text-muted text-sm font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <span className={`ml-auto text-sm px-3 py-1.5 rounded-full font-medium ${statusBadgeClass[order.status] || 'badge-pending'}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Status Tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-primary-light border border-border rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-5">Order Progress</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
              <div className="absolute top-4 left-0 h-0.5 bg-accent-gold z-0 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
              {statusSteps.map((step, i) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? 'bg-accent-gold border-accent-gold text-[#1A1A2E]' : 'bg-primary-dark border-border text-text-muted'}`}>
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs capitalize ${i <= currentStep ? 'text-accent-gold font-medium' : 'text-text-muted'}`}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-accent-gold" /> Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary-dark border border-border flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-text-muted/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-text-muted text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-accent-gold font-semibold text-sm flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Address */}
            <div className="bg-primary-light border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent-gold" /> Delivery Address
              </h3>
              <div className="text-sm text-text-secondary space-y-0.5">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-primary-light border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-accent-gold" /> Payment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className={`capitalize ${order.paymentStatus === 'paid' ? 'text-status-success' : 'text-accent-gold'}`}>{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-accent-gold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-light border border-border rounded-2xl p-5">
              <p className="text-xs text-text-muted">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
