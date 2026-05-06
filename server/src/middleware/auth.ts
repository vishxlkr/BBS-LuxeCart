import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or token invalid.' });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ success: false, message: 'Please verify your email before accessing this resource.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired.' });
  }
};

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string };

    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    // For admin env login, attach a virtual admin user
    req.user = {
      _id: 'admin',
      id: 'admin',
      email: process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
    } as unknown as IUser;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired.' });
  }
};
