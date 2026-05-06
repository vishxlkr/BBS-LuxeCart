import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({ success: true, data: req.user });
};

// PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { firstName, lastName, phone },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, message: 'Profile updated.', data: user });
};

// POST /api/users/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { label, street, city, state, zipCode, country, isDefault } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push({ label, street, city, state, zipCode, country, isDefault: isDefault || user.addresses.length === 0 });
  await user.save();

  res.status(201).json({ success: true, message: 'Address added.', data: user.addresses });
};

// PUT /api/users/addresses/:id
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { label, street, city, state, zipCode, country, isDefault } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const address = user.addresses.id(id);
  if (!address) {
    res.status(404).json({ success: false, message: 'Address not found.' });
    return;
  }

  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  Object.assign(address, { label, street, city, state, zipCode, country, isDefault });
  await user.save();

  res.status(200).json({ success: true, message: 'Address updated.', data: user.addresses });
};

// DELETE /api/users/addresses/:id
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const addressIndex = user.addresses.findIndex((a) => a._id?.toString() === id);
  if (addressIndex === -1) {
    res.status(404).json({ success: false, message: 'Address not found.' });
    return;
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();

  res.status(200).json({ success: true, message: 'Address deleted.', data: user.addresses });
};

// PUT /api/users/change-password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    return;
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
};
