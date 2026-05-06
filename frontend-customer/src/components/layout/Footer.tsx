import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-20 bg-luxury-black pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-luxury-black text-xs font-bold">LC</span>
              </div>
              <span className="text-2xl font-display font-bold">
                Luxe<span className="text-gold">Cart</span>
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              Premium e-commerce for discerning shoppers. Curated luxury products, delivered with restraint and care.
            </p>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/wishlist', label: 'Wishlist' },
                { href: '/profile/orders', label: 'My Orders' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted text-sm hover:text-gold transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Account</h3>
            <ul className="space-y-2">
              {[
                { href: '/auth/login', label: 'Login' },
                { href: '/auth/signup', label: 'Create Account' },
                { href: '/profile', label: 'My Profile' },
                { href: '/profile/addresses', label: 'Saved Addresses' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted text-sm hover:text-gold transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            (c) {new Date().getFullYear()} LuxeCart. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Premium / Minimal / Elevated
          </p>
        </div>
      </div>
    </footer>
  );
}
