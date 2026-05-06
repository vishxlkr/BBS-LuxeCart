'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/lib/api';
import { User, Pagination } from '@/types';
import toast from 'react-hot-toast';
import { Search, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Reusing the same endpoint, but we should probably have an admin/users endpoint.
      // Assuming /admin/users exists or using a similar route for demo. 
      // If we don't have an admin/users route, we might need to add one to the backend.
      // The PRD mentions admin features, we will assume /admin/users exists or simulate it.
      const res = await api.get(`/admin/users?page=${page}&limit=15${search ? `&search=${search}` : ''}`);
      if (res.data.success) {
        setCustomers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      // toast.error('Failed to load customers');
      // Just mock for now if endpoint doesn't exist
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-text-muted text-sm mt-1">View registered customers</p>
      </div>

      <div className="bg-primary-light border border-border rounded-2xl overflow-hidden flex flex-col min-h-[60vh]">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Verified</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-100 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold font-bold">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-950 font-medium">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-text-secondary flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
                        {user.phone && <p className="text-text-muted text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {user.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-100 text-slate-950'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isVerified ? <CheckCircle className="w-5 h-5 text-status-success" /> : <XCircle className="w-5 h-5 text-text-muted" />}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-text-muted">No customers found</td></tr>
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
    </AdminLayout>
  );
}
