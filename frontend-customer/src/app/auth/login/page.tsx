"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Spinner } from "@/components/common/Loader";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

function LoginForm() {
   const { login } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();
   const redirect = searchParams.get("redirect") || "/";

   const [form, setForm] = useState({ email: "", password: "" });
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.email || !form.password) {
         toast.error("Please fill in all fields");
         return;
      }
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/login", form);
         if (data.success) {
            login(data.data.token, data.data.user);
            toast.success("Welcome back!");
            router.push(redirect);
         }
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 py-12">
         <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
               <Link href="/" className="inline-flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center">
                     <span className="text-accent-gold font-bold">LC</span>
                  </div>
                  <span className="text-2xl font-bold tracking-widest">
                     LUXE<span className="text-accent-gold">CART</span>
                  </span>
               </Link>
               <h1 className="text-2xl font-bold">Welcome back</h1>
               <p className="text-text-muted text-sm mt-1">
                  Sign in to your account
               </p>
            </div>

            <div className="bg-primary-light border border-border rounded-2xl p-8">
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                     <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                        Email Address
                     </label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input
                           type="email"
                           value={form.email}
                           onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                           }
                           className="w-full pl-10 pr-4 py-3 input-dark rounded-xl text-sm"
                           placeholder="your@email.com"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-text-muted uppercase tracking-wider">
                           Password
                        </label>
                        <Link
                           href="/auth/forgot-password"
                           className="text-xs text-accent-gold hover:underline"
                        >
                           Forgot password?
                        </Link>
                     </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input
                           type={showPassword ? "text" : "password"}
                           value={form.password}
                           onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                           }
                           className="w-full pl-10 pr-10 py-3 input-dark rounded-xl text-sm"
                           placeholder="••••••••"
                           required
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                        >
                           {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                           ) : (
                              <Eye className="w-4 h-4" />
                           )}
                        </button>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="btn-gold w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm mt-2"
                  >
                     {isLoading ? (
                        <Spinner className="w-4 h-4" />
                     ) : (
                        <>
                           <ArrowRight className="w-4 h-4" /> Sign In
                        </>
                     )}
                  </button>
               </form>

               <div className="mt-6 text-center">
                  <p className="text-text-muted text-sm">
                     Don't have an account?{" "}
                     <Link
                        href="/auth/signup"
                        className="text-accent-gold hover:underline font-medium"
                     >
                        Create one
                     </Link>
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default function LoginPage() {
   return (
      <Suspense
         fallback={
            <div className="min-h-screen flex items-center justify-center">
               <Spinner />
            </div>
         }
      >
         <LoginForm />
      </Suspense>
   );
}
