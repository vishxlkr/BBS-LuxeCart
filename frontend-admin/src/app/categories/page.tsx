'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api, { getErrorMessage } from '@/lib/api';
import { Category } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialForm = { _id: '', name: '', description: '', isActive: true };
  const [form, setForm] = useState(initialForm);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setForm({ _id: category._id, name: category.name, description: category.description || '', isActive: category.isActive });
      setIsEditing(true);
    } else {
      setForm(initialForm);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/categories/${form._id}`, { name: form.name, description: form.description, isActive: form.isActive });
        toast.success('Category updated');
      } else {
        await api.post('/categories', { name: form.name, description: form.description, isActive: form.isActive });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-text-muted text-sm mt-1">Manage product categories</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-primary-light border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-primary-dark/50 text-text-muted border-b border-border">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-100 transition-colors">
                    <td className="p-4 font-medium text-slate-950">{cat.name}</td>
                    <td className="p-4 text-text-secondary truncate max-w-xs">{cat.description || '-'}</td>
                    <td className="p-4">
                      {cat.isActive ? <CheckCircle className="w-5 h-5 text-status-success" /> : <XCircle className="w-5 h-5 text-status-error" />}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-1.5 rounded-lg text-text-muted hover:text-slate-950 hover:bg-slate-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-text-muted">No categories found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-primary-light border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 input-dark rounded-xl text-sm resize-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-accent-gold" />
                  <span className="text-sm">Category is Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-5 py-2.5 rounded-xl text-sm">
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
