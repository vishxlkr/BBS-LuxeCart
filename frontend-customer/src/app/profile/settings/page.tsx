'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common/Loader';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.put('/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="p-2 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        {/* Change Password */}
        <div className="bg-primary-light border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent-gold" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', showKey: 'current' as keyof typeof show },
              { key: 'newPassword', label: 'New Password', showKey: 'new' as keyof typeof show },
              { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' as keyof typeof show },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <label className="text-xs text-text-muted block mb-1.5 uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <input
                    type={show[showKey] ? 'text' : 'password'}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 pr-10 py-3 input-dark rounded-xl text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShow({...show, [showKey]: !show[showKey]})} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                    {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={isLoading} className="btn-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2">
              {isLoading ? <Spinner className="w-4 h-4" /> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-primary-light border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-status-error flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Session
          </h2>
          <p className="text-text-muted text-sm mb-4">Sign out from all your active sessions.</p>
          <button onClick={handleLogout} className="px-6 py-3 rounded-xl text-sm border border-status-error/30 text-status-error hover:bg-status-error/10 transition-all flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
