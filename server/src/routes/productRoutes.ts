import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', adminOnly, upload.single('image'), createProduct);
router.put('/:id', adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', adminOnly, deleteProduct);

export default router;
