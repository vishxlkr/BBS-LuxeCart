import { Router } from "express";
import {
   signup,
   verifyOTP,
   login,
   adminLogin,
   forgotPassword,
   resetPassword,
   getMe,
   resendOTP,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginLimiter, login);
router.post("/admin/login", loginLimiter, adminLogin);
router.post("/admin-login", loginLimiter, adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

export default router;
