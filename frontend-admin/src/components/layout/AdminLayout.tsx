'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('luxecart_admin_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-luxury-black text-text-primary">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
