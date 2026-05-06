import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import OTP from "../models/OTP";
import { generateToken } from "../utils/generateToken";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail, otpEmailTemplate } from "../utils/sendEmail";
import { AuthRequest } from "../middleware/auth";

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
   const { firstName, lastName, email, password } = req.body;

   if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
         success: false,
         message: "All fields are required.",
      });
      return;
   }

   if (password.length < 8) {
      res.status(400).json({
         success: false,
         message: "Password must be at least 8 characters.",
      });
      return;
   }

   const existingUser = await User.findOne({ email: email.toLowerCase() });
   if (existingUser && existingUser.isVerified) {
      res.status(400).json({
         success: false,
         message: "Email is already registered.",
      });
      return;
   }

   // Delete any previous unverified user with this email
   if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email: email.toLowerCase() });
   }

   // Create unverified user
   await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
   });

   // Generate & save OTP
   const otp = generateOTP();
   await OTP.deleteMany({ email: email.toLowerCase(), type: "signup" });
   await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: "signup",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
   });

   // Send email (non-blocking failure)
   try {
      await sendEmail({
         to: email,
         subject: "LuxeCart — Verify Your Email",
         html: otpEmailTemplate(otp, "signup"),
      });
   } catch (emailErr) {
      console.error("Email send failed during signup:", emailErr);
      // Development: Log OTP to console for testing
      if (process.env.NODE_ENV === "development") {
         console.log(`\n🔐 DEVELOPMENT MODE - OTP for ${email}: ${otp}\n`);
      }
   }

   res.status(201).json({
      success: true,
      message: "Registration initiated. Please check your email for the OTP.",
      data: { email: email.toLowerCase() },
   });
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
   const { email, otp, type = "signup" } = req.body;

   if (!email || !otp) {
      res.status(400).json({
         success: false,
         message: "Email and OTP are required.",
      });
      return;
   }

   const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      verified: false,
   });

   if (!otpRecord) {
      res.status(400).json({
         success: false,
         message: "No pending OTP found. Please request a new one.",
      });
      return;
   }

   if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
         success: false,
         message: "OTP has expired. Please request a new one.",
      });
      return;
   }

   if (otpRecord.otp !== otp.toString()) {
      res.status(400).json({
         success: false,
         message: "Invalid OTP. Please try again.",
      });
      return;
   }

   // Mark OTP as verified
   otpRecord.verified = true;
   await otpRecord.save();

   if (type === "signup") {
      const user = await User.findOneAndUpdate(
         { email: email.toLowerCase() },
         { isVerified: true },
         { new: true },
      );

      if (!user) {
         res.status(404).json({ success: false, message: "User not found." });
         return;
      }

      const token = generateToken({ id: user._id, role: user.role });
      res.status(200).json({
         success: true,
         message: "Email verified successfully.",
         data: { token, user },
      });
   } else {
      res.status(200).json({
         success: true,
         message: "OTP verified. You may now reset your password.",
         data: { email: email.toLowerCase() },
      });
   }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
   const { email, password } = req.body;

   if (!email || !password) {
      res.status(400).json({
         success: false,
         message: "Email and password are required.",
      });
      return;
   }

   const user = await User.findOne({ email: email.toLowerCase() });
   if (!user) {
      res.status(401).json({
         success: false,
         message: "Invalid email or password.",
      });
      return;
   }

   if (!user.isVerified) {
      res.status(401).json({
         success: false,
         message: "Please verify your email before logging in.",
      });
      return;
   }

   const isMatch = await user.comparePassword(password);
   if (!isMatch) {
      res.status(401).json({
         success: false,
         message: "Invalid email or password.",
      });
      return;
   }

   const token = generateToken({ id: user._id, role: user.role });
   res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { token, user },
   });
};

// POST /api/auth/admin/login
export const adminLogin = async (
   req: Request,
   res: Response,
): Promise<void> => {
   const { email, password } = req.body;

   if (!email || !password) {
      res.status(400).json({
         success: false,
         message: "Email and password are required.",
      });
      return;
   }

   const adminEmail =
      process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || "";
   const adminPassword = process.env.ADMIN_PASSWORD || "";

   if (
      email.toLowerCase() !== adminEmail.toLowerCase() ||
      password !== adminPassword
   ) {
      res.status(401).json({
         success: false,
         message: "Invalid admin credentials.",
      });
      return;
   }

   const token = generateToken(
      { id: "admin", role: "admin", email: adminEmail },
      "7d",
   );

   res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
         token,
         user: {
            _id: "admin",
            firstName: "Admin",
            lastName: "User",
            email: adminEmail,
            role: "admin",
            isVerified: true,
         },
      },
   });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (
   req: Request,
   res: Response,
): Promise<void> => {
   const { email } = req.body;

   if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
   }

   const user = await User.findOne({ email: email.toLowerCase() });
   if (!user) {
      // Don't reveal if email exists
      res.status(200).json({
         success: true,
         message: "If this email is registered, an OTP will be sent.",
      });
      return;
   }

   const otp = generateOTP();
   await OTP.deleteMany({ email: email.toLowerCase(), type: "reset-password" });
   await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: "reset-password",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
   });

   try {
      await sendEmail({
         to: email,
         subject: "LuxeCart — Password Reset OTP",
         html: otpEmailTemplate(otp, "reset-password"),
      });
   } catch (emailErr) {
      console.error("Email send failed during password reset:", emailErr);
      // Development: Log OTP to console for testing
      if (process.env.NODE_ENV === "development") {
         console.log(
            `\n🔐 DEVELOPMENT MODE - Password Reset OTP for ${email}: ${otp}\n`,
         );
      }
   }

   res.status(200).json({
      success: true,
      message: "If this email is registered, an OTP will be sent.",
   });
};

// POST /api/auth/reset-password
export const resetPassword = async (
   req: Request,
   res: Response,
): Promise<void> => {
   const { email, otp, newPassword } = req.body;

   if (!email || !otp || !newPassword) {
      res.status(400).json({
         success: false,
         message: "Email, OTP, and new password are required.",
      });
      return;
   }

   if (newPassword.length < 8) {
      res.status(400).json({
         success: false,
         message: "Password must be at least 8 characters.",
      });
      return;
   }

   const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      type: "reset-password",
      verified: true,
   });

   if (!otpRecord) {
      res.status(400).json({
         success: false,
         message: "OTP not verified. Please verify your OTP first.",
      });
      return;
   }

   const user = await User.findOne({ email: email.toLowerCase() });
   if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
   }

   user.password = newPassword;
   await user.save();

   await OTP.deleteMany({ email: email.toLowerCase(), type: "reset-password" });

   res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login.",
   });
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
   if (!req.user) {
      res.status(401).json({ success: false, message: "Not authorized." });
      return;
   }
   res.status(200).json({ success: true, data: req.user });
};

// POST /api/auth/resend-otp
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
   const { email, type = "signup" } = req.body;

   if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
   }

   const otp = generateOTP();
   await OTP.deleteMany({ email: email.toLowerCase(), type });
   await OTP.create({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
   });

   try {
      await sendEmail({
         to: email,
         subject: `LuxeCart — Your OTP Code`,
         html: otpEmailTemplate(otp, type as "signup" | "reset-password"),
      });
   } catch (emailErr) {
      console.error("Email resend failed:", emailErr);
      // Development: Log OTP to console for testing
      if (process.env.NODE_ENV === "development") {
         console.log(`\n🔐 DEVELOPMENT MODE - OTP for ${email}: ${otp}\n`);
      }
   }

   res.status(200).json({ success: true, message: "OTP resent successfully." });
};
