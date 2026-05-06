import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// GET /api/cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user?._id }).populate({
    path: 'items.product',
    select: 'name image price stock isActive slug',
  });

  res.status(200).json({ success: true, data: cart || { user: req.user?._id, items: [] } });
};

// POST /api/cart/add
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400).json({ success: false, message: 'Product ID is required.' });
    return;
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    return;
  }

  if (product.stock < quantity) {
    res.status(400).json({ success: false, message: `Only ${product.stock} items available.` });
    return;
  }

  let cart = await Cart.findOne({ user: req.user?._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user?._id,
      items: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > product.stock) {
        res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} available.` });
        return;
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = product.price;
    } else {
      cart.items.push({ product: productId as unknown as import('mongoose').Types.ObjectId, quantity, price: product.price });
    }

    await cart.save();
  }

  await cart.populate({ path: 'items.product', select: 'name image price stock isActive slug' });

  res.status(200).json({ success: true, message: 'Item added to cart.', data: cart });
};

// PUT /api/cart/update/:productId
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  if (quantity > product.stock) {
    res.status(400).json({ success: false, message: `Only ${product.stock} items available.` });
    return;
  }

  const cart = await Cart.findOne({ user: req.user?._id });
  if (!cart) {
    res.status(404).json({ success: false, message: 'Cart not found.' });
    return;
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    res.status(404).json({ success: false, message: 'Item not in cart.' });
    return;
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name image price stock isActive slug' });

  res.status(200).json({ success: true, message: 'Cart updated.', data: cart });
};

// DELETE /api/cart/remove/:productId
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user?._id });
  if (!cart) {
    res.status(404).json({ success: false, message: 'Cart not found.' });
    return;
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name image price stock isActive slug' });

  res.status(200).json({ success: true, message: 'Item removed from cart.', data: cart });
};

// DELETE /api/cart/clear
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  await Cart.findOneAndUpdate({ user: req.user?._id }, { items: [] });
  res.status(200).json({ success: true, message: 'Cart cleared.' });
};
