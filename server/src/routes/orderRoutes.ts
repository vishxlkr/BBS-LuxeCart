import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);

// Admin routes
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
