'use client';

export function ProductSkeleton() {
  return (
    <div className="bg-luxury-card border border-border-subtle rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
        <div className="h-6 skeleton rounded w-1/3" />
        <div className="h-10 skeleton rounded-xl mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-luxury-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-border-subtle border-t-gold rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-5 h-5 border-2 border-border-subtle border-t-gold rounded-full animate-spin ${className}`} />
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-luxury-card border border-border-subtle flex items-center justify-center mb-6 text-gold">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-muted mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
