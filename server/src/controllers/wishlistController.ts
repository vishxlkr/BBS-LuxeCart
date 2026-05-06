import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const wishlist = await Wishlist.findOne({ user: req.user?._id }).populate({
    path: 'products',
    select: 'name image price stock isActive slug compareAtPrice',
  });

  res.status(200).json({ success: true, data: wishlist || { user: req.user?._id, products: [] } });
};

// POST /api/wishlist/add/:productId
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  let wishlist = await Wishlist.findOne({ user: req.user?._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user?._id,
      products: [productId],
    });
  } else {
    const alreadyAdded = wishlist.products.some((p) => p.toString() === productId);
    if (!alreadyAdded) {
      wishlist.products.push(productId as unknown as import('mongoose').Types.ObjectId);
      await wishlist.save();
    }
  }

  await wishlist.populate({ path: 'products', select: 'name image price stock isActive slug compareAtPrice' });

  res.status(200).json({ success: true, message: 'Added to wishlist.', data: wishlist });
};

// DELETE /api/wishlist/remove/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user?._id });
  if (!wishlist) {
    res.status(404).json({ success: false, message: 'Wishlist not found.' });
    return;
  }

  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();
  await wishlist.populate({ path: 'products', select: 'name image price stock isActive slug compareAtPrice' });

  res.status(200).json({ success: true, message: 'Removed from wishlist.', data: wishlist });
};
