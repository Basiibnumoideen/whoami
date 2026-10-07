import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { name?: string };
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } 
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      console.warn(`[AuthMiddleware] 401: No valid token provided for ${req.method} ${req.originalUrl}`);
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user exists in database if DB is connected
    try {
      if (decoded.id && decoded.id.length === 24) {
        const existingUser = await User.findById(decoded.id).select('-password');
        if (existingUser) {
          req.user = {
            id: existingUser._id.toString(),
            email: existingUser.email,
            role: existingUser.role,
            name: existingUser.name,
          };
        } else {
          req.user = decoded;
        }
      } else {
        req.user = decoded;
      }
    } catch (dbErr: any) {
      console.warn('[AuthMiddleware] DB lookup fallback:', dbErr.message);
      req.user = decoded;
    }

    // Role check
    if (req.user?.role !== 'admin') {
      console.warn(`[AuthMiddleware] 403: Role '${req.user?.role}' is not admin for ${req.originalUrl}`);
      res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

export default authenticateAdmin;
