'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Spinner, EmptyState } from '@/components/common/Loader';
import api, { getErrorMessage } from '@/lib/api';
import { Order } from '@/types';
import toast from 'react-hot-toast';
import { User, Package, MapPin, Settings, ChevronRight, Edit2, Phone, Mail } from 'lucide-react';

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  processing: 'badge-processing',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setEditForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/orders/my-orders?limit=3').then(res => {
      if (res.data.success) setRecentOrders(res.data.data);
    }).catch(() => {}).finally(() => setOrdersLoading(false));
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', editForm);
      if (data.success) {
        await refreshUser();
        toast.success('Profile updated!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar nav */}
          <div className="lg:col-span-1">
            <div className="bg-primary-light border border-border rounded-2xl p-4 space-y-1">
              {[
                { href: '/profile', icon: <User className="w-4 h-4" />, label: 'Overview', active: true },
                { href: '/profile/orders', icon: <Package className="w-4 h-4" />, label: 'My Orders' },
                { href: '/profile/addresses', icon: <MapPin className="w-4 h-4" />, label: 'Addresses' },
                { href: '/profile/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${item.active ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                  {item.icon} {item.label}
                  {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 flex items-center justify-center text-2xl font-bold text-accent-gold">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-text-muted text-sm">{user?.email}</p>
                    <span className="text-xs text-status-success bg-status-success/10 border border-status-success/20 px-2 py-0.5 rounded-full mt-1 inline-block">Verified</span>
                  </div>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-xl border border-border hover:border-accent-gold/40 text-text-muted hover:text-accent-gold transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-muted block mb-1.5">First Name</label>
                      <input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1.5">Last Name</label>
                      <input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1.5">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-lg text-sm" placeholder="+91..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                      {saving ? <Spinner className="w-4 h-4" /> : 'Save Changes'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-sm border border-border hover:border-accent-gold/30 text-text-muted hover:text-white transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-text-muted text-xs">Email</p>
                      <p className="text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-text-muted text-xs">Phone</p>
                      <p className="text-white">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">Recent Orders</h3>
                <Link href="/profile/orders" className="text-xs text-accent-gold hover:underline">View All</Link>
              </div>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <EmptyState icon={<Package className="w-8 h-8" />} title="No orders yet" description="Your orders will appear here" />
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link key={order._id} href={`/orders/${order._id}`} className="flex items-center justify-between p-4 bg-primary-dark rounded-xl border border-border hover:border-accent-gold/30 transition-all">
                      <div>
                        <p className="text-white text-sm font-mono font-semibold">{order.orderNumber}</p>
                        <p className="text-text-muted text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent-gold font-semibold text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass[order.status] || 'badge-pending'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
