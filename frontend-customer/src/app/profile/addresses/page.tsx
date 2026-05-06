'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common/Loader';
import api, { getErrorMessage } from '@/lib/api';
import { Address } from '@/types';
import toast from 'react-hot-toast';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, ChevronLeft, CheckCircle } from 'lucide-react';

export default function AddressesPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, authLoading, router]);

  const resetForm = () => setForm({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });

  const handleSave = async () => {
    if (!form.street || !form.city || !form.state || !form.zipCode) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/users/addresses/${editingId}`, form);
        toast.success('Address updated!');
        setEditingId(null);
      } else {
        await api.post('/users/addresses', form);
        toast.success('Address added!');
        setIsAdding(false);
      }
      resetForm();
      await refreshUser();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
      await refreshUser();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country, isDefault: addr.isDefault });
    setEditingId(addr._id || null);
    setIsAdding(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const AddressForm = () => (
    <div className="bg-primary-dark border border-border rounded-xl p-5 space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted mb-1 block">Label</label>
          <select value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm">
            <option>Home</option><option>Work</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Country</label>
          <input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs text-text-muted mb-1 block">Street Address *</label>
        <input value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="House no, Street name, Area" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-muted mb-1 block">City *</label>
          <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">State *</label>
          <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">ZIP *</label>
          <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="accent-[#B8860B]" />
        Set as default address
      </label>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          {loading ? <Spinner className="w-4 h-4" /> : (editingId ? 'Update' : 'Save Address')}
        </button>
        <button onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="px-5 py-2.5 rounded-xl text-sm border border-border hover:border-accent-gold/30 text-text-muted hover:text-white transition-all">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 rounded-lg hover:bg-white/5 transition-all">
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            </Link>
            <h1 className="text-2xl font-bold">My Addresses</h1>
          </div>
          {!isAdding && !editingId && (
            <button onClick={() => { setIsAdding(true); resetForm(); }} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          )}
        </div>

        {isAdding && !editingId && <AddressForm />}

        <div className="space-y-4 mt-4">
          {user?.addresses?.map((addr) => (
            <div key={addr._id} className="bg-primary-light border border-border rounded-2xl p-5">
              {editingId === addr._id ? (
                <AddressForm />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {addr.label === 'Work' ? <Briefcase className="w-4 h-4 text-accent-gold" /> : <Home className="w-4 h-4 text-accent-gold" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-accent-gold/10 text-accent-gold border border-accent-gold/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm">{addr.street}</p>
                      <p className="text-text-muted text-xs">{addr.city}, {addr.state} — {addr.zipCode}</p>
                      <p className="text-text-muted text-xs">{addr.country}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(addr)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr._id!)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-status-error transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!user?.addresses?.length && !isAdding && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted text-sm">No addresses saved yet</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
