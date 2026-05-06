import jwt from 'jsonwebtoken';

export const generateToken = (payload: object, expiresIn: string = '24h'): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn } as jwt.SignOptions);
};
