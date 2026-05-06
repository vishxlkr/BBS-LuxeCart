import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shippingAddress, paymentMethod = 'COD' } = req.body;

  if (!shippingAddress) {
    res.status(400).json({ success: false, message: 'Shipping address is required.' });
    return;
  }

  const cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, message: 'Your cart is empty.' });
    return;
  }

  // Validate stock and build order items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product as unknown as {
      _id: import('mongoose').Types.ObjectId;
      name: string;
      image: string;
      price: number;
      stock: number;
      isActive: boolean;
    };

    if (!product || !product.isActive) {
      res.status(400).json({ success: false, message: `Product "${product?.name || 'Unknown'}" is no longer available.` });
      return;
    }

    if (product.stock < item.quantity) {
      res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}". Only ${product.stock} available.` });
      return;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: item.price, // snapshot price
      quantity: item.quantity,
    });

    totalAmount += item.price * item.quantity;
  }

  // Create order
  const order = await Order.create({
    user: req.user?._id,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentMethod,
    status: 'pending',
    paymentStatus: 'pending',
  });

  // Decrement stock
  for (const item of cart.items) {
    const product = item.product as unknown as { _id: import('mongoose').Types.ObjectId };
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
  }

  // Clear cart after order
  await Cart.findOneAndUpdate({ user: req.user?._id }, { items: [] });

  await order.populate('user', 'firstName lastName email');

  res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
};

// GET /api/orders/my-orders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string || '1'));
  const limit = Math.min(20, parseInt(req.query.limit as string || '10'));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user?._id }),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// GET /api/orders/:id
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  // Customers can only see their own orders
  if (order.user._id?.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  res.status(200).json({ success: true, data: order });
};

// GET /api/orders (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string || '1'));
  const limit = Math.min(50, parseInt(req.query.limit as string || '20'));
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// PUT /api/orders/:id/status (Admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status, paymentStatus } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status value.' });
    return;
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  // Restore stock if cancelling
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  if (status) order.status = status as typeof order.status;
  if (paymentStatus) order.paymentStatus = paymentStatus as typeof order.paymentStatus;

  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated.', data: order });
};
