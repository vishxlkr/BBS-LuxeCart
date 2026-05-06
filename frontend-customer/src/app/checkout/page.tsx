'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common/Loader';
import api, { getErrorMessage } from '@/lib/api';
import { Address } from '@/types';
import toast from 'react-hot-toast';
import { MapPin, Plus, ChevronRight, CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartCount, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India',
  });
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login?redirect=/checkout');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const addresses = user?.addresses ?? [];
    if (addresses.length > 0) {
      setSelectedAddress(addresses.find(a => a.isDefault) || addresses[0]);
    }
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = Math.round(subtotal * 0.18);
  const delivery = subtotal >= 999 ? 0 : 99;
  const total = subtotal + tax + delivery;

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    setAddingAddress(true);
    try {
      const { data } = await api.post('/users/addresses', { ...newAddress, isDefault: (user?.addresses?.length ?? 0) === 0 });
      if (data.success) {
        toast.success('Address added!');
        const lastAddr = data.data[data.data.length - 1];
        setSelectedAddress(lastAddr);
        setShowAddressForm(false);
        setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India' });
        // Refresh user
        window.location.reload();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAddingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        },
        paymentMethod: 'COD',
      });

      if (data.success) {
        setOrderId(data.data.orderNumber);
        setOrderPlaced(true);
        await clearCart();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto px-4 pt-32 pb-20 text-center">
          <div className="bg-primary-light border border-border rounded-3xl p-10">
            <div className="w-20 h-20 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-status-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-text-muted mb-2">Your order has been successfully placed.</p>
            <p className="text-accent-gold font-mono font-semibold text-lg mb-8">{orderId}</p>
            <div className="flex flex-col gap-3">
              <Link href="/profile/orders" className="btn-gold py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                View My Orders
              </Link>
              <Link href="/products" className="btn-outline-gold py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-gold" /> Delivery Address
              </h2>

              {(user?.addresses?.length ?? 0) === 0 && !showAddressForm ? (
                <div className="text-center py-6">
                  <p className="text-text-muted text-sm mb-4">No saved addresses. Add one to continue.</p>
                  <button onClick={() => setShowAddressForm(true)} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {user?.addresses?.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAddress?._id === addr._id ? 'border-accent-gold bg-accent-gold/5' : 'border-border hover:border-accent-gold/40'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">{addr.label}</span>
                          <p className="text-white text-sm mt-1">{addr.street}</p>
                          <p className="text-text-muted text-xs">{addr.city}, {addr.state} — {addr.zipCode}</p>
                          <p className="text-text-muted text-xs">{addr.country}</p>
                        </div>
                        {selectedAddress?._id === addr._id && (
                          <CheckCircle className="w-5 h-5 text-accent-gold flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-accent-gold/40 hover:text-accent-gold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="mt-4 p-4 bg-primary-dark rounded-xl border border-border space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Label</label>
                      <select value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm">
                        <option>Home</option>
                        <option>Work</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Country</label>
                      <input value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="Country" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Street Address</label>
                    <input value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="House no, Street, Area" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">City</label>
                      <input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="City" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">State</label>
                      <input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="State" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">ZIP Code</label>
                      <input value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full input-dark px-3 py-2.5 rounded-lg text-sm" placeholder="ZIP" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleAddAddress} disabled={addingAddress} className="btn-gold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                      {addingAddress ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Save Address
                    </button>
                    <button onClick={() => setShowAddressForm(false)} className="px-4 py-2.5 rounded-lg text-sm text-text-muted hover:text-white border border-border hover:border-accent-gold/30 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="p-4 border-2 border-accent-gold bg-accent-gold/5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">Cash on Delivery</p>
                  <p className="text-text-muted text-xs mt-1">Pay when your order arrives</p>
                </div>
                <CheckCircle className="w-5 h-5 text-accent-gold" />
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="bg-primary-light border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-5 pb-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent-gold" /> Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {cart?.items?.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span className="text-text-secondary truncate mr-2 flex-1">
                      {item.product.name} <span className="text-text-muted">×{item.quantity}</span>
                    </span>
                    <span className="text-white flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tax (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className={delivery === 0 ? 'text-status-success' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-3">
                  <span>Total</span>
                  <span className="text-accent-gold text-lg">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || !selectedAddress || !cart?.items?.length}
                className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPlacing ? <Spinner className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {isPlacing ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
