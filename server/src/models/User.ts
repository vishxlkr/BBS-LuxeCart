import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  isVerified: boolean;
  addresses: mongoose.Types.DocumentArray<IAddress>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _password, ...safeRet } = ret;
    return safeRet;
  },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
