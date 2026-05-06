'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { EmptyState, Spinner } from '@/components/common/Loader';
import { Product } from '@/types';
import api, { getErrorMessage } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login?redirect=/wishlist');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/wishlist').then(res => {
      if (res.data.success) setProducts(res.data.data.products || []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/remove/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMoveToCart = async (product: Product) => {
    await addToCart(product._id);
    await handleRemove(product._id);
  };

  if (authLoading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {products.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-10 h-10" />}
            title="Your wishlist is empty"
            description="Save products you love by clicking the heart icon"
            action={<Link href="/products" className="btn-gold px-6 py-3 rounded-xl text-sm">Browse Products</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-primary-light border border-border rounded-2xl overflow-hidden group card-hover">
                <Link href={`/products/${product._id}`} className="block relative aspect-square bg-[#0d0d1f]">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="20vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-text-muted/20" />
                    </div>
                  )}
                </Link>
                <div className="p-3">
                  <Link href={`/products/${product._id}`} className="text-white text-sm font-medium line-clamp-2 hover:text-accent-gold transition-colors block mb-2">
                    {product.name}
                  </Link>
                  <p className="text-accent-gold font-bold text-sm mb-3">₹{product.price.toLocaleString('en-IN')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 py-2 btn-gold rounded-lg text-xs flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2 rounded-lg border border-border text-text-muted hover:text-status-error hover:border-status-error/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
