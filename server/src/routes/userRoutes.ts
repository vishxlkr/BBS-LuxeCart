import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/change-password', changePassword);

export default router;
