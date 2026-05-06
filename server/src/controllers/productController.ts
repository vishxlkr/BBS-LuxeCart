import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth';

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, mimetype: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'luxecart/products',
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    stream.end(buffer);
  });
};

// GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    category,
    sort = 'newest',
    page = '1',
    limit = '12',
    minPrice,
    maxPrice,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: Record<string, unknown> = { isActive: true };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) (filter.price as Record<string, unknown>).$gte = parseFloat(minPrice as string);
    if (maxPrice) (filter.price as Record<string, unknown>).$lte = parseFloat(maxPrice as string);
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
    ];
  }

  // Build sort
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { price: 1 };
  else if (sort === 'price_desc') sortObj = { price: -1 };
  else if (sort === 'name_asc') sortObj = { name: 1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  res.status(200).json({ success: true, data: product });
};

// POST /api/products (Admin)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, price, compareAtPrice, category, stock, tags } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({ success: false, message: 'Name and price are required.' });
    return;
  }

  // Generate unique slug
  let slug = slugify(name, { lower: true, strict: true });
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  let imageUrl = '';
  if (req.file?.buffer) {
    try {
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
    }
  }

  const parsedTags = tags
    ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : tags)
    : [];

  const product = await Product.create({
    name,
    slug,
    description: description || '',
    price: parseFloat(price),
    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
    category: category || undefined,
    image: imageUrl,
    stock: parseInt(stock || '0'),
    tags: parsedTags,
  });

  await product.populate('category', 'name slug');

  res.status(201).json({ success: true, message: 'Product created.', data: product });
};

// PUT /api/products/:id (Admin)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, price, compareAtPrice, category, stock, tags, isActive } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  if (name && name !== product.name) {
    let slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug, _id: { $ne: product._id } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
    product.slug = slug;
    product.name = name;
  }

  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (compareAtPrice !== undefined) product.compareAtPrice = parseFloat(compareAtPrice);
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = parseInt(stock);
  if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

  if (tags !== undefined) {
    product.tags = typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : tags;
  }

  if (req.file?.buffer) {
    // Delete old image from Cloudinary if exists
    if (product.image) {
      try {
        const urlParts = product.image.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const publicId = `luxecart/products/${filenameWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn('Failed to delete old Cloudinary image:', err);
      }
    }
    try {
      product.image = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
    }
  }

  await product.save();
  await product.populate('category', 'name slug');

  res.status(200).json({ success: true, message: 'Product updated.', data: product });
};

// DELETE /api/products/:id (Admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  // Delete from Cloudinary
  if (product.image) {
    try {
      const publicId = product.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`luxecart/products/${publicId}`);
      }
    } catch (err) {
      console.warn('Failed to delete Cloudinary image:', err);
    }
  }

  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted.' });
};
