'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onWishlistChange?: () => void;
  isWishlisted?: boolean;
}

export default function ProductCard({ product, onWishlistChange, isWishlisted = false }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }
    await addToCart(product._id);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      router.push('/auth/login');
      return;
    }

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
      onWishlistChange?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="group block h-full">
      <div className="bg-luxury-card border border-border-subtle rounded-xl overflow-hidden hover:border-gold/50 hover:shadow-luxury-lg transition-all duration-300 ease-out h-full flex flex-col">
        <div className="relative overflow-hidden aspect-[3/4] bg-luxury-elevated">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg bg-luxury-card flex items-center justify-center">
                <Star className="w-8 h-8 text-gold/40" />
              </div>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-error/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-error/90 px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-error/90 backdrop-blur-sm rounded-full">
              <span className="text-xs font-semibold text-white">Only {product.stock} left</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/85 via-luxury-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center gap-3 p-5">
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gold hover:bg-gold-light text-luxury-black rounded-lg font-semibold text-sm transition-all shadow-luxury"
              >
                Add to Cart
              </button>
            )}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'p-2.5 bg-luxury-card rounded-lg text-text-secondary hover:text-gold transition-all',
                wishlisted && 'text-error'
              )}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-2 flex flex-col flex-1">
          <p className="text-xs tracking-widest uppercase text-text-muted">
            {typeof product.category === 'object' && product.category?.name ? product.category.name : 'Uncategorized'}
          </p>
          <h3 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-gold transition-colors flex-1">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold text-gold">
              Rs. {product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="text-text-muted text-sm line-through">
                Rs. {product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className={`w-full mt-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              product.stock === 0 ? 'bg-luxury-elevated text-text-muted cursor-not-allowed' : 'btn-gold'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
