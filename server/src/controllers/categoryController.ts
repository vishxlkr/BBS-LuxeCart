import { Request, Response } from 'express';
import slugify from 'slugify';
import Category from '../models/Category';

// GET /api/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  res.status(200).json({ success: true, data: categories });
};

// GET /api/categories/all (admin - includes inactive)
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.status(200).json({ success: true, data: categories });
};

// GET /api/categories/:id
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }
  res.status(200).json({ success: true, data: category });
};

// POST /api/categories (Admin)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required.' });
    return;
  }

  const slug = slugify(name, { lower: true, strict: true });

  const category = await Category.create({ name, slug, description });
  res.status(201).json({ success: true, message: 'Category created.', data: category });
};

// PUT /api/categories/:id (Admin)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;

  await category.save();
  res.status(200).json({ success: true, message: 'Category updated.', data: category });
};

// DELETE /api/categories/:id (Admin)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted.' });
};
