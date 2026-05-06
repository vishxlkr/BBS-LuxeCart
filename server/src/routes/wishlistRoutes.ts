import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/add/:productId', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);

export default router;
