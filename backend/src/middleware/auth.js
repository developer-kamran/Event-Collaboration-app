import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Protect routes - requires valid JWT access token
 */
export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  const user = await User.findById(decoded.sub).select('-password -refreshToken');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  req.user = user;
  next();
};

/**
 * Optional auth - attach user if token present, don't fail if not
 */
export const optionalAuth = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.accessToken;

  if (!token) return next();

  const decoded = verifyAccessToken(token);
  if (!decoded) return next();

  const user = await User.findById(decoded.sub).select('-password -refreshToken');
  if (user) req.user = user;
  next();
};
