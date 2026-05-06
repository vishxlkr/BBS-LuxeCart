import { Router } from 'express';
import {
  getAnalytics,
  getUsers,
  deleteUser,
  getAdminOrders,
} from '../controllers/adminController';
import { updateOrderStatus } from '../controllers/orderController';
import { adminOnly } from '../middleware/auth';

const router = Router();

router.use(adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
