import { Router } from 'express';
import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/all', adminOnly, getAllCategories);
router.get('/:id', getCategory);
router.post('/', adminOnly, createCategory);
router.put('/:id', adminOnly, updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

export default router;
