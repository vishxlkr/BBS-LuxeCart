import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

// GET /api/admin/analytics
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
    revenueData,
    ordersThisMonth,
    ordersLastMonth,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
    Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)),
        $lt: new Date(new Date().setDate(1)),
      },
    }),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const orderGrowth = ordersLastMonth > 0
    ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
    : 100;

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      orderGrowth,
      recentOrders,
    },
  });
};

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string || '1'));
  const limit = Math.min(50, parseInt(req.query.limit as string || '20'));
  const skip = (page - 1) * limit;
  const { search } = req.query;

  const filter: Record<string, unknown> = { role: 'customer' };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (user.role === 'admin') {
    res.status(403).json({ success: false, message: 'Cannot delete admin user.' });
    return;
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted.' });
};

// GET /api/admin/orders
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string || '1'));
  const limit = Math.min(50, parseInt(req.query.limit as string || '20'));
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') filter.status = status;

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
