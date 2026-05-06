'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import api, { getErrorMessage } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, Heart, Package, Tag, CheckCircle, XCircle, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (data.success) {
          setProduct(data.data);
          if (data.data.category?._id) {
            const relRes = await api.get(`/products?category=${data.data.category._id}&limit=5`);
            if (relRes.data.success) {
              setRelatedProducts(relRes.data.data.filter((p: Product) => p._id !== id).slice(0, 4));
            }
          }
        }
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    await addToCart(product._id, quantity);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/remove/${product._id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/add/${product._id}`);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWishlistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="aspect-square max-h-[680px] skeleton rounded-2xl" />
            <div className="space-y-4 pt-2">
              {[72, 44, 34, 88, 64, 100].map((w, i) => (
                <div key={i} className="h-6 skeleton rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : '';
  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : 0;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 lg:pb-20">
        <nav className="flex items-center gap-2 text-text-muted text-sm mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold transition-colors">Products</Link>
          <span>/</span>
          <span className="text-text-secondary truncate">{product.name}</span>
        </nav>

        <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-20 items-start">
          <div className="rounded-2xl overflow-hidden bg-luxury-elevated border border-border-subtle shadow-card">
            <div className="relative aspect-square max-h-[680px] bg-luxury-elevated">
              {product.image && !imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-light">
                  <Package className="w-24 h-24 text-text-muted/30" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-status-error text-white text-sm font-bold px-3 py-1.5 rounded-md">
                  {discount}% OFF
                </div>
              )}
            </div>
          </div>

          <div className="p-1 sm:p-0 lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {categoryName && (
                <span className="text-sm tracking-widest uppercase text-text-muted">{categoryName}</span>
              )}
              <div className={`flex items-center gap-1.5 text-sm ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                {product.stock > 0 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </div>
            </div>

            <h1 className="text-4xl font-display font-bold text-text-primary mb-4 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap items-end gap-4 mb-5">
              <span className="text-4xl font-bold text-gold">
                Rs. {product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && (
                <div className="pb-1">
                  <span className="text-text-muted text-lg line-through block">
                    Rs. {product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-success text-sm font-medium">
                    Save Rs. {savings.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-text-secondary leading-relaxed mb-5 text-sm sm:text-base">{product.description}</p>
            )}

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {product.stock > 0 && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-text-muted text-sm">Quantity</span>
                <div className="flex items-center gap-3 bg-luxury-elevated border border-border-subtle rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:text-gold hover:bg-luxury-card transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:text-gold hover:bg-luxury-card transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {product.stock <= 5 && (
                  <span className="text-error text-xs">Only {product.stock} left</span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
                className={`flex-1 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all ${
                  product.stock === 0 ? 'bg-white/8 text-text-muted cursor-not-allowed' : 'btn-gold'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`w-14 rounded-lg border-2 transition-all flex items-center justify-center ${
                  wishlisted ? 'border-error bg-error/10 text-error' : 'border-border-gold text-gold hover:bg-gold hover:text-luxury-black'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-4 h-4" />, label: 'Free Delivery', sub: 'Over Rs. 999' },
                { icon: <RotateCcw className="w-4 h-4" />, label: 'Easy Returns', sub: '7-day policy' },
                { icon: <Shield className="w-4 h-4" />, label: 'Secure Payment', sub: 'Protected checkout' },
              ].map((item) => (
                <div key={item.label} className="surface-soft p-3">
                  <div className="text-gold mb-2">{item.icon}</div>
                  <p className="text-text-primary text-xs font-semibold">{item.label}</p>
                  <p className="text-text-muted text-xs">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="section-kicker mb-1">More to consider</p>
                <h2 className="text-2xl font-bold">Related Products</h2>
              </div>
              <Link href="/products" className="text-sm text-text-muted hover:text-gold">View catalog</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
