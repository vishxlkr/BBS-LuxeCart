"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLogin() {
   const router = useRouter();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/admin/login", {
            email,
            password,
         });
         if (data.success) {
            localStorage.setItem("luxecart_admin_token", data.data.token);
            toast.success("Admin access granted");
            router.push("/");
         }
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary-dark">
         <div className="w-full max-w-md">
            <div className="text-center mb-8">
               <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-6 h-6 text-white" />
               </div>
               <h1 className="text-2xl font-bold tracking-widest text-slate-950">
                  LUXE<span className="text-accent-gold">CART</span> ADMIN
               </h1>
               <p className="text-text-muted text-sm mt-2">
                  Sign in to the management console
               </p>
            </div>

            <div className="admin-card p-8">
               <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                     <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                        Admin Email
                     </label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 input-dark rounded-lg text-sm"
                           placeholder="admin@luxecart.com"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                        Password
                     </label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 input-dark rounded-lg text-sm"
                           placeholder="Password"
                           required
                        />
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="btn-gold w-full py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm mt-4"
                  >
                     {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        <>
                           Access Panel <ArrowRight className="w-4 h-4" />
                        </>
                     )}
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
}
