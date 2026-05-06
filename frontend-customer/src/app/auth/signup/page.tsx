"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { Spinner } from "@/components/common/Loader";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from "lucide-react";

export default function SignupPage() {
   const router = useRouter();
   const [step, setStep] = useState<"form" | "otp">("form");
   const [form, setForm] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
   });
   const [otp, setOtp] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (form.password.length < 8) {
         toast.error("Password must be at least 8 characters");
         return;
      }
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/signup", form);
         if (data.success) {
            toast.success("OTP sent to your email!");
            setStep("otp");
         }
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.length !== 6) {
         toast.error("Please enter a valid 6-digit OTP");
         return;
      }
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/verify-otp", {
            email: form.email,
            otp,
            type: "signup",
         });
         if (data.success) {
            toast.success("Account created successfully!");
            // Store token and redirect
            localStorage.setItem("luxecart_token", data.data.token);
            localStorage.setItem(
               "luxecart_user",
               JSON.stringify(data.data.user),
            );
            router.push("/");
            window.location.href = "/";
         }
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   const handleResendOTP = async () => {
      try {
         await api.post("/auth/resend-otp", {
            email: form.email,
            type: "signup",
         });
         toast.success("OTP resent!");
      } catch (error) {
         toast.error(getErrorMessage(error));
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
               <h1 className="text-2xl font-bold">
                  {step === "form" ? "Create Account" : "Verify Email"}
               </h1>
               <p className="text-text-muted text-sm mt-1">
                  {step === "form"
                     ? "Join LuxeCart for a premium experience"
                     : `OTP sent to ${form.email}`}
               </p>
            </div>

            <div className="bg-primary-light border border-border rounded-2xl p-8">
               {step === "form" ? (
                  <form onSubmit={handleSignup} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                              First Name
                           </label>
                           <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                              <input
                                 type="text"
                                 value={form.firstName}
                                 onChange={(e) =>
                                    setForm({
                                       ...form,
                                       firstName: e.target.value,
                                    })
                                 }
                                 className="w-full pl-9 pr-3 py-3 input-dark rounded-xl text-sm"
                                 placeholder="John"
                                 required
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                              Last Name
                           </label>
                           <input
                              type="text"
                              value={form.lastName}
                              onChange={(e) =>
                                 setForm({ ...form, lastName: e.target.value })
                              }
                              className="w-full px-3 py-3 input-dark rounded-xl text-sm"
                              placeholder="Doe"
                              required
                           />
                        </div>
                     </div>

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
                        <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                           Phone (Optional)
                        </label>
                        <div className="relative">
                           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                           <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) =>
                                 setForm({ ...form, phone: e.target.value })
                              }
                              className="w-full pl-10 pr-4 py-3 input-dark rounded-xl text-sm"
                              placeholder="+91 9876543210"
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
                              type={showPassword ? "text" : "password"}
                              value={form.password}
                              onChange={(e) =>
                                 setForm({ ...form, password: e.target.value })
                              }
                              className="w-full pl-10 pr-10 py-3 input-dark rounded-xl text-sm"
                              placeholder="Min. 8 characters"
                              required
                              minLength={8}
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
                              <ArrowRight className="w-4 h-4" /> Create Account
                           </>
                        )}
                     </button>
                  </form>
               ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                     <div className="text-center">
                        <div className="w-16 h-16 bg-accent-gold/10 border border-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Mail className="w-8 h-8 text-accent-gold" />
                        </div>
                        <p className="text-text-muted text-sm">
                           Enter the 6-digit code sent to your email. It expires
                           in 5 minutes.
                        </p>
                     </div>

                     <div>
                        <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider text-center">
                           OTP Code
                        </label>
                        <input
                           type="text"
                           value={otp}
                           onChange={(e) =>
                              setOtp(
                                 e.target.value.replace(/\D/g, "").slice(0, 6),
                              )
                           }
                           className="w-full px-4 py-4 input-dark rounded-xl text-2xl font-bold text-center tracking-[0.5em]"
                           placeholder="000000"
                           maxLength={6}
                           required
                        />
                     </div>

                     <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-gold w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                     >
                        {isLoading ? (
                           <Spinner className="w-4 h-4" />
                        ) : (
                           "Verify & Create Account"
                        )}
                     </button>

                     <div className="text-center">
                        <button
                           type="button"
                           onClick={handleResendOTP}
                           className="text-text-muted text-sm hover:text-accent-gold transition-colors"
                        >
                           Didn't receive?{" "}
                           <span className="text-accent-gold">Resend OTP</span>
                        </button>
                     </div>
                  </form>
               )}

               <div className="mt-6 text-center">
                  <p className="text-text-muted text-sm">
                     Already have an account?{" "}
                     <Link
                        href="/auth/login"
                        className="text-accent-gold hover:underline font-medium"
                     >
                        Sign in
                     </Link>
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
