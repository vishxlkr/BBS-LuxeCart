"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
   LayoutDashboard,
   Package,
   Tag,
   ShoppingBag,
   Users,
   LogOut,
   Menu,
   X,
   ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
   {
      href: "/",
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: "Dashboard",
   },
   {
      href: "/products",
      icon: <Package className="w-4 h-4" />,
      label: "Products",
   },
   {
      href: "/categories",
      icon: <Tag className="w-4 h-4" />,
      label: "Categories",
   },
   {
      href: "/orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      label: "Orders",
   },
   {
      href: "/customers",
      icon: <Users className="w-4 h-4" />,
      label: "Customers",
   },
];

export default function AdminSidebar() {
   const pathname = usePathname();
   const router = useRouter();
   const [collapsed, setCollapsed] = useState(false);

   const handleLogout = () => {
      localStorage.removeItem("luxecart_admin_token");
      router.push("/login");
   };

   const isActive = (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
   };

   return (
      <aside
         className={`${collapsed ? "w-16" : "w-64"} bg-luxury-card border-r border-border-subtle flex flex-col transition-all duration-300 flex-shrink-0 h-screen sticky top-0 shadow-card`}
      >
         {/* Logo */}
         <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
            {!collapsed && (
               <Link
                  href="/"
                  className="text-xl font-display font-bold text-text-primary"
               >
                  Luxe<span className="text-gold">Cart</span>
               </Link>
            )}
            <button
               onClick={() => setCollapsed(!collapsed)}
               className="p-2 rounded-lg hover:bg-luxury-elevated text-text-muted hover:text-gold transition-all ml-auto"
            >
               {collapsed ? (
                  <Menu className="w-4 h-4" />
               ) : (
                  <X className="w-4 h-4" />
               )}
            </button>
         </div>

         {/* Admin badge */}
         {!collapsed && (
            <div className="px-4 py-4 border-b border-border-subtle">
               <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center">
                     <span className="text-luxury-black text-xs font-bold">
                        A
                     </span>
                  </div>
                  <div>
                     <p className="text-text-primary text-xs font-semibold">
                        Admin Console
                     </p>
                     <p className="text-text-muted text-xs">
                        vishxlkr@gmail.com
                     </p>
                  </div>
               </div>
            </div>
         )}

         {/* Nav */}
         <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
               <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                     isActive(item.href)
                        ? "bg-gold text-luxury-black border border-gold font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-luxury-elevated"
                  }`}
               >
                  {item.icon}
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && isActive(item.href) && (
                     <ChevronRight className="w-3.5 h-3.5" />
                  )}
               </Link>
            ))}
         </nav>

         {/* Logout */}
         <div className="p-3 border-t border-border-subtle">
            <button
               onClick={handleLogout}
               title={collapsed ? "Logout" : undefined}
               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error/10 transition-all"
            >
               <LogOut className="w-4 h-4 flex-shrink-0" />
               {!collapsed && "Logout"}
            </button>
         </div>
      </aside>
   );
}
