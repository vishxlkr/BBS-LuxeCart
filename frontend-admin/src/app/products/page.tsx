'use client';

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api, { getErrorMessage } from '@/lib/api';
import { Product, Category, Pagination } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = { _id: '', name: '', description: '', price: '', compareAtPrice: '', category: '', stock: '', isActive: true, tags: '' };
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&limit=10${search ? `&search=${search}` : ''}`);
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  useEffect(() => {
    api.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setForm({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
        category: typeof product.category === 'object' ? product.category._id : product.category,
        stock: product.stock.toString(),
        isActive: product.isActive,
        tags: product.tags.join(', ')
      });
      setImagePreview(product.image || '');
      setIsEditing(true);
    } else {
      setForm(initialForm);
      setImagePreview('');
      setIsEditing(false);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      if (form.compareAtPrice) formData.append('compareAtPrice', form.compareAtPrice);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('isActive', form.isActive.toString());
      if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim())));
      if (imageFile) formData.append('image', imageFile);

      if (isEditing) {
        await api.put(`/products/${form._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-text-muted text-sm mt-1">Add, edit or delete products</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-primary-light border border-border rounded-2xl overflow-hidden flex flex-col min-h-[60vh]">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 input-dark rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-primary-dark/50 text-text-muted border-b border-border">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-100 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary-dark border border-border relative flex-shrink-0">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : <ImageIcon className="w-4 h-4 m-auto text-text-muted mt-3" />}
                        </div>
                        <div>
                          <p className="text-slate-950 font-medium truncate max-w-[200px]">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary">{typeof product.category === 'object' ? product.category.name : 'Unknown'}</td>
                    <td className="p-4 text-accent-gold font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${product.stock > 10 ? 'bg-status-success/10 text-status-success' : product.stock > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-status-error/10 text-status-error'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      {product.isActive ? <CheckCircle className="w-5 h-5 text-status-success" /> : <XCircle className="w-5 h-5 text-status-error" />}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-1.5 rounded-lg text-text-muted hover:text-slate-950 hover:bg-slate-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product._id)} className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">No products found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center text-sm">
            <span className="text-text-muted">Showing page {page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-slate-100">Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-slate-100">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-primary-light border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-primary-light border-b border-border p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted block mb-1.5">Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted block mb-1.5">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Price (₹) *</label>
                  <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Compare at Price (₹)</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Stock *</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted block mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" placeholder="luxury, watch, premium" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted block mb-1.5">Product Image {!isEditing && '*'}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-primary-dark flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="80px" />
                      ) : <ImageIcon className="w-6 h-6 text-text-muted" />}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline-gold px-4 py-2 rounded-xl text-sm">Choose Image</button>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-accent-gold" />
                    <span className="text-sm">Product is Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-5 py-2.5 rounded-xl text-sm min-w-[120px]">
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
