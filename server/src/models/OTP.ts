import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: 'signup' | 'reset-password';
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ['signup', 'reset-password'], required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index: automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model<IOTP>('OTP', otpSchema);
export default OTP;
