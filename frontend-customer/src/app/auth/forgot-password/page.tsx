"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { Spinner } from "@/components/common/Loader";
import { Mail, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
   const router = useRouter();
   const [step, setStep] = useState<Step>("email");
   const [email, setEmail] = useState("");
   const [otp, setOtp] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleSendOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         await api.post("/auth/forgot-password", { email });
         toast.success("OTP sent if email is registered");
         setStep("otp");
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/verify-otp", {
            email,
            otp,
            type: "reset-password",
         });
         if (data.success) {
            setStep("reset");
         }
      } catch (error) {
         toast.error(getErrorMessage(error));
      } finally {
         setIsLoading(false);
      }
   };

   const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 8) {
         toast.error("Password must be at least 8 characters");
         return;
      }
      setIsLoading(true);
      try {
         const { data } = await api.post("/auth/reset-password", {
            email,
            otp,
            newPassword,
         });
         if (data.success) {
            toast.success("Password reset! Please login.");
            router.push("/auth/login");
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
            <div className="text-center mb-8">
               <Link href="/" className="inline-flex items-center gap-2 mb-6">
                  <span className="text-2xl font-bold tracking-widest">
                     LUXE<span className="text-accent-gold">CART</span>
                  </span>
               </Link>
               <h1 className="text-2xl font-bold">Reset Password</h1>
               <p className="text-text-muted text-sm mt-1">
                  {step === "email" && "Enter your email to receive an OTP"}
                  {step === "otp" && `Verify OTP sent to ${email}`}
                  {step === "reset" && "Set your new password"}
               </p>
            </div>

            <div className="bg-primary-light border border-border rounded-2xl p-8">
               {step === "email" && (
                  <form onSubmit={handleSendOTP} className="space-y-5">
                     <div>
                        <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                           Email Address
                        </label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                           <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 input-dark rounded-xl text-sm"
                              placeholder="your@email.com"
                              required
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-gold w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                     >
                        {isLoading ? (
                           <Spinner className="w-4 h-4" />
                        ) : (
                           <>
                              <ArrowRight className="w-4 h-4" /> Send OTP
                           </>
                        )}
                     </button>
                  </form>
               )}

               {step === "otp" && (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
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
                           "Verify OTP"
                        )}
                     </button>
                  </form>
               )}

               {step === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                     <div>
                        <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">
                           New Password
                        </label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                           <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-3 input-dark rounded-xl text-sm"
                              placeholder="Min. 8 characters"
                              required
                              minLength={8}
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
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
                        className="btn-gold w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                     >
                        {isLoading ? (
                           <Spinner className="w-4 h-4" />
                        ) : (
                           "Reset Password"
                        )}
                     </button>
                  </form>
               )}

               <div className="mt-6 text-center">
                  <Link
                     href="/auth/login"
                     className="text-text-muted text-sm hover:text-accent-gold transition-colors"
                  >
                     Back to login
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}
