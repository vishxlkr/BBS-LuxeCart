'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState, Spinner } from '@/components/common/Loader';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, cartCount, isLoading, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/cart');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const payableTotal = subtotal >= 999 ? total : total + 99;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 lg:pb-20">
        <h1 className="text-4xl font-display font-bold mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-10 h-10" />}
            title="Your cart is empty"
            description="Discover our premium collection and add items to your cart"
            action={
              <Link href="/products" className="btn-gold px-6 py-3 rounded-lg text-sm inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Browse Products
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.product;
                return (
                  <div key={product._id} className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-luxury-card border border-border-subtle rounded-xl group hover:border-gold/30 transition-all duration-200">
                    <Link href={`/products/${product._id}`} className="flex-shrink-0">
                      <div className="w-24 h-32 rounded-lg overflow-hidden bg-luxury-elevated border border-border-subtle">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={96}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-text-muted/30" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
                      <div>
                        <Link href={`/products/${product._id}`} className="text-text-primary font-semibold text-lg line-clamp-2 hover:text-gold transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-xl font-bold text-gold mt-2">
                          Rs. {item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 bg-luxury-elevated border border-border-subtle rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-gold hover:bg-luxury-card disabled:opacity-40 transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-text-primary font-semibold min-w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock || isLoading}
                            className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-gold hover:bg-luxury-card disabled:opacity-40 transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-gold font-bold">
                            Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeFromCart(product._id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-luxury-card border border-border-subtle rounded-xl p-6 sticky top-24 shadow-card">
                <h2 className="text-lg font-bold mb-5 pb-4 border-b border-border-subtle">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal ({cartCount} items)</span>
                    <span className="text-text-primary">Rs. {subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Estimated Tax (18%)</span>
                    <span className="text-text-primary">Rs. {tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Delivery</span>
                    <span className="text-success text-xs font-medium">
                      {subtotal >= 999 ? 'FREE' : `Rs. ${(99).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-base font-bold border-t border-border-subtle pt-4 mb-6">
                  <span>Total</span>
                  <span className="text-gold text-xl">Rs. {payableTotal.toLocaleString('en-IN')}</span>
                </div>

                <Link href="/checkout" className="btn-gold w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/products" className="w-full mt-3 py-3 rounded-lg text-sm text-text-muted text-center block hover:text-text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
