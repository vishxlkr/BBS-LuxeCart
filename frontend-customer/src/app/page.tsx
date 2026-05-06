'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/common/Loader';
import { Product, Category } from '@/types';
import api from '@/lib/api';
import { ArrowRight, ShoppingBag, Shield, Truck, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8&sort=newest'),
          api.get('/categories'),
        ]);
        if (productsRes.data.success) setFeaturedProducts(productsRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data.slice(0, 6));
      } catch {
        // Keep the homepage usable when the API is unavailable.
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative h-[82vh] min-h-[620px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-dark/92 to-luxury-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-luxury-black to-transparent" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gold-light rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-36 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-luxury-card/70 border border-border-subtle rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold-muted text-sm font-medium">Curated for the discerning few</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.02] max-w-3xl">
            Luxury <span className="text-gold">Redefined</span>
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
            Curated collection of premium products crafted for a quieter, more exacting shopping experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="btn-gold px-10 py-4 rounded-lg text-base font-semibold flex items-center justify-center gap-2 group">
              <ShoppingBag className="w-5 h-5" />
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/signup" className="btn-outline-gold px-10 py-4 rounded-lg text-base flex items-center justify-center gap-2 bg-luxury-black/20">
              Create Account
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mt-14 pt-8 border-t border-white/10">
            {[
              { value: '500+', label: 'Products' },
              { value: '10K+', label: 'Customers' },
              { value: '100%', label: 'Secure' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-gold-muted">{stat.value}</p>
                <p className="text-text-muted text-xs sm:text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 border-y border-border-subtle bg-luxury-dark/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="w-6 h-6" />, title: 'Free Delivery', desc: 'On orders over Rs. 999' },
              { icon: <Shield className="w-6 h-6" />, title: 'Secure Payment', desc: 'Protected checkout' },
              { icon: <RotateCcw className="w-6 h-6" />, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'Curated Quality', desc: 'Selected products' },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center p-5 surface-soft hover:border-accent-gold/40 transition-all duration-200">
                <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-text-primary font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-text-muted text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="section-kicker mb-1">Browse</p>
                <h2 className="text-3xl font-bold">Shop by Category</h2>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-1 text-text-muted hover:text-gold text-sm transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="group p-4 surface text-center hover:border-gold/50 hover:bg-gold/5 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-3 group-hover:bg-gold/20 transition-all">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className="text-text-primary text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-luxury-dark/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="section-kicker mb-1">New Arrivals</p>
              <h2 className="text-3xl font-bold">Featured Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 btn-outline-gold px-4 py-2 rounded-lg text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted">No products available yet. Check back soon.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/products" className="btn-gold px-8 py-3 rounded-lg text-sm inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative surface p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-success/8" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Build your shortlist faster</h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Create a free account to save favorites, track orders, and move through checkout with fewer steps.
              </p>
              <Link href="/auth/signup" className="btn-gold px-10 py-4 rounded-lg text-base font-semibold inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
