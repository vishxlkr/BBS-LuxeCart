'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/common/Loader';
import { Product, Category, Pagination } from '@/types';
import api from '@/lib/api';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/products');
  };

  const hasFilters = search || category || sort !== 'newest';

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 lg:pb-20">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="section-kicker mb-1">Catalog</p>
          <h1 className="text-4xl font-display font-bold mb-2">All Products</h1>
          <p className="text-text-muted">
            {pagination ? `${pagination.total} products found` : 'Discover our premium collection'}
          </p>
          </div>
        </div>

        {/* Search + Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-luxury-card border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm"
            />
          </form>

          <div className="flex gap-3">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-dark px-4 py-3 rounded-lg text-sm cursor-pointer flex-1 sm:flex-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name A-Z</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="sm:hidden input-dark px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="px-4 py-3 rounded-lg border border-status-error/30 text-status-error hover:bg-status-error/10 text-sm flex items-center gap-2 transition-all">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — desktop always visible, mobile toggle */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
            <div className="bg-luxury-card border border-border-subtle rounded-xl p-6 sticky top-24 shadow-card">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${!category ? 'bg-gold text-luxury-black font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-luxury-elevated'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat._id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${category === cat._id ? 'bg-gold text-luxury-black font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-luxury-elevated'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-10 h-10" />}
                title="No products found"
                description="Try adjusting your search or filters"
                action={
                  <button onClick={clearFilters} className="btn-gold px-6 py-2.5 rounded-lg text-sm">
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2.5 rounded-lg border border-border-subtle hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-gold text-luxury-black font-bold' : 'border border-border-subtle hover:border-gold/50 text-text-secondary'}`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="p-2.5 rounded-lg border border-border-subtle hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-border-subtle border-t-gold rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
