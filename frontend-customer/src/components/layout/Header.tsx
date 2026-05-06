"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
   ShoppingCart,
   Heart,
   User,
   Menu,
   X,
   Search,
   LogOut,
   Package,
   Home,
   ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
   const { user, isAuthenticated, logout } = useAuth();
   const { cartCount } = useCart();
   const [menuOpen, setMenuOpen] = useState(false);
   const [searchOpen, setSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [profileOpen, setProfileOpen] = useState(false);
   const router = useRouter();

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         router.push(
            `/products?search=${encodeURIComponent(searchQuery.trim())}`,
         );
         setSearchOpen(false);
         setSearchQuery("");
      }
   };

   const handleLogout = () => {
      logout();
      setProfileOpen(false);
      router.push("/");
   };

   return (
      <>
         <header className="sticky top-0 z-50 bg-luxury-dark/80 backdrop-blur-xl border-b border-border-subtle">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
               <div className="flex items-center justify-between h-16 lg:h-20">
                  <Link
                     href="/"
                     className="flex items-center gap-3 group"
                     aria-label="LuxeCart home"
                  >
                     <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center shadow-luxury">
                        <ShoppingBag className="w-5 h-5 text-luxury-black" />
                     </div>
                     <span className="text-2xl font-display font-bold text-text-primary group-hover:text-gold transition-colors">
                        LuxeCart
                     </span>
                  </Link>

                  <form
                     onSubmit={handleSearch}
                     className="hidden lg:block flex-1 max-w-xl mx-12"
                  >
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                           type="search"
                           placeholder="Search luxury products..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 bg-luxury-card border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
                        />
                     </div>
                  </form>

                  <div className="hidden lg:flex items-center gap-4">
                     {isAuthenticated && (
                        <Link
                           href="/wishlist"
                           aria-label="Wishlist"
                           className="p-2.5 rounded-lg hover:bg-luxury-elevated text-text-secondary hover:text-gold transition-all"
                        >
                           <Heart className="w-6 h-6" />
                        </Link>
                     )}

                     <Link
                        href="/cart"
                        aria-label="Cart"
                        className="p-2.5 rounded-lg hover:bg-luxury-elevated text-text-secondary hover:text-gold transition-all relative"
                     >
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                           <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-gold text-luxury-black text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                              {cartCount > 99 ? "99+" : cartCount}
                           </span>
                        )}
                     </Link>

                     {isAuthenticated ? (
                        <div className="relative">
                           <button
                              onClick={() => setProfileOpen(!profileOpen)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-luxury-elevated transition-all"
                              aria-label="Open profile menu"
                           >
                              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                                 <span className="text-sm font-bold text-luxury-black">
                                    {user?.firstName?.charAt(0).toUpperCase()}
                                 </span>
                              </div>
                           </button>

                           {profileOpen && (
                              <div className="absolute right-0 top-full mt-3 w-64 bg-luxury-card border border-border-default rounded-xl shadow-luxury-lg py-2 z-50 animate-scale-in">
                                 <div className="px-4 py-3 border-b border-border-subtle">
                                    <p className="text-sm font-semibold text-text-primary">
                                       {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">
                                       {user?.email}
                                    </p>
                                 </div>
                                 <Link
                                    href="/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-luxury-elevated transition-all"
                                 >
                                    <User className="w-4 h-4" /> My Profile
                                 </Link>
                                 <Link
                                    href="/profile/orders"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-luxury-elevated transition-all"
                                 >
                                    <Package className="w-4 h-4" /> My Orders
                                 </Link>
                                 <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-all"
                                 >
                                    <LogOut className="w-4 h-4" /> Logout
                                 </button>
                              </div>
                           )}
                        </div>
                     ) : (
                        <Link
                           href="/auth/login"
                           className="px-6 py-2.5 bg-gold text-luxury-black rounded-lg font-semibold hover:bg-gold-light transition-colors"
                        >
                           Sign In
                        </Link>
                     )}
                  </div>

                  <div className="lg:hidden flex items-center gap-2">
                     <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2.5 rounded-lg text-text-secondary hover:text-gold hover:bg-luxury-elevated"
                        aria-label="Toggle search"
                     >
                        <Search className="w-5 h-5" />
                     </button>
                     <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2.5 rounded-lg text-text-secondary hover:text-gold hover:bg-luxury-elevated"
                        aria-label="Toggle menu"
                     >
                        {menuOpen ? (
                           <X className="w-5 h-5" />
                        ) : (
                           <Menu className="w-5 h-5" />
                        )}
                     </button>
                  </div>
               </div>

               {searchOpen && (
                  <form
                     onSubmit={handleSearch}
                     className="lg:hidden pb-4 animate-slide-up"
                  >
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                           type="search"
                           placeholder="Search luxury products..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 bg-luxury-card border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                           autoFocus
                        />
                     </div>
                  </form>
               )}

               {menuOpen && (
                  <div className="lg:hidden border-t border-border-subtle py-3 space-y-1 animate-slide-up">
                     <Link
                        href="/products"
                        className="flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-luxury-elevated rounded-lg"
                        onClick={() => setMenuOpen(false)}
                     >
                        All Products
                     </Link>
                     {isAuthenticated ? (
                        <>
                           <Link
                              href="/wishlist"
                              className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-luxury-elevated rounded-lg"
                              onClick={() => setMenuOpen(false)}
                           >
                              <Heart className="w-4 h-4" /> Wishlist
                           </Link>
                           <Link
                              href="/profile"
                              className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-luxury-elevated rounded-lg"
                              onClick={() => setMenuOpen(false)}
                           >
                              <User className="w-4 h-4" /> Profile
                           </Link>
                           <button
                              onClick={() => {
                                 handleLogout();
                                 setMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-error hover:bg-error/10 rounded-lg"
                           >
                              <LogOut className="w-4 h-4" /> Logout
                           </button>
                        </>
                     ) : (
                        <div className="flex gap-2 px-4 pt-2">
                           <Link
                              href="/auth/login"
                              className="flex-1 py-2.5 text-center btn-outline-gold rounded-lg text-sm"
                              onClick={() => setMenuOpen(false)}
                           >
                              Login
                           </Link>
                           <Link
                              href="/auth/signup"
                              className="flex-1 py-2.5 text-center btn-gold rounded-lg text-sm"
                              onClick={() => setMenuOpen(false)}
                           >
                              Sign Up
                           </Link>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </header>

         <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-luxury-card border-t border-border-subtle z-50">
            <div className="flex items-center justify-around py-3">
               <Link
                  href="/"
                  className="flex flex-col items-center gap-1 text-text-muted hover:text-gold transition-colors"
               >
                  <Home className="w-6 h-6" />
                  <span className="text-xs font-medium">Home</span>
               </Link>
               <Link
                  href="/products"
                  className="flex flex-col items-center gap-1 text-text-muted hover:text-gold transition-colors"
               >
                  <Search className="w-6 h-6" />
                  <span className="text-xs font-medium">Browse</span>
               </Link>
               <Link
                  href="/cart"
                  className="flex flex-col items-center gap-1 text-text-muted hover:text-gold transition-colors relative"
               >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-xs font-medium">Cart</span>
                  {cartCount > 0 && (
                     <span className="absolute -top-1 right-3 min-w-5 h-5 px-1 bg-gold text-luxury-black text-xs font-bold rounded-full flex items-center justify-center">
                        {cartCount > 99 ? "99+" : cartCount}
                     </span>
                  )}
               </Link>
               <Link
                  href={isAuthenticated ? "/profile" : "/auth/login"}
                  className="flex flex-col items-center gap-1 text-text-muted hover:text-gold transition-colors"
               >
                  <User className="w-6 h-6" />
                  <span className="text-xs font-medium">Profile</span>
               </Link>
            </div>
         </nav>
      </>
   );
}
