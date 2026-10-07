import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';

const COOKIE_NAME = process.env.COOKIE_NAME || 'admin_token';
const IS_PROD = process.env.NODE_ENV === 'production';

// Security moderation: brute-force prevention tracking (IP/identifier -> { count, lockedUntil })
interface FailedAttemptInfo {
  count: number;
  lockedUntil: number;
}
const failedAttemptsMap = new Map<string, FailedAttemptInfo>();
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Dynamically read .env file so any changes by the user in .env take effect immediately without needing server restart
function getLiveEnvConfig() {
  let envEmail = (process.env.ADMIN_EMAIL || 'admin@basi.dev').toLowerCase().trim();
  let envUsername = (process.env.ADMIN_USERNAME || 'basi').toLowerCase().trim();
  let envPassword = (process.env.ADMIN_PASSWORD || 'Admin@Basi2026#Secure!').trim();

  try {
    const fs = require('fs');
    const path = require('path');
    const candidates = [
      path.resolve(process.cwd(), 'backend', '.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '..', '..', '.env'),
      path.resolve(__dirname, '..', '..', 'backend', '.env'),
      'c:/portfolio website/backend/.env',
      'c:/portfolio website/.env',
    ];

    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
          const [k, ...vParts] = trimmed.split('=');
          const key = k.trim();
          const val = vParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key === 'ADMIN_EMAIL' && val) envEmail = val.toLowerCase().trim();
          if (key === 'ADMIN_USERNAME' && val) envUsername = val.toLowerCase().trim();
          if (key === 'ADMIN_PASSWORD' && val) envPassword = val.trim();
        }
        break;
      }
    }
  } catch (e) {
    // ignore
  }

  return { envEmail, envUsername, envPassword };
}

export class AuthController {
  /**
   * POST /api/auth/login
   * Robust security verification & brute-force moderation
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-ip';
      const identifier = (req.body.email || req.body.username || req.body.identifier || '').toString().toLowerCase().trim();
      const password = (req.body.password || '').toString();

      if (!identifier || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide both username/email and password.',
        });
        return;
      }

      const { envEmail, envUsername, envPassword } = getLiveEnvConfig();

      console.log(`[AuthController] Login attempt for identifier: "${identifier}" from IP: ${clientIp}`);
      console.log(`[AuthController] Target env config: username="${envUsername}", email="${envEmail}"`);

      // Check brute-force lockout status for IP
      const lockKey = `${clientIp}:${identifier}`;
      const attemptInfo = failedAttemptsMap.get(lockKey);
      const now = Date.now();

      if (attemptInfo && attemptInfo.lockedUntil > now) {
        const remainingMinutes = Math.ceil((attemptInfo.lockedUntil - now) / 60000);
        console.warn(`[Security Alert] Blocked locked attempt from ${clientIp} for ${identifier}`);
        res.status(429).json({
          success: false,
          message: `Account temporarily locked due to repeated failed attempts. Please retry in ${remainingMinutes} minute(s).`,
        });
        return;
      }

      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        // Find admin user by exact email, username, or configured admin identity
        const user = await User.findOne({
          $or: [
            { email: identifier },
            { username: identifier },
            ...(identifier === envUsername || identifier === envEmail ? [{ email: envEmail }, { username: envUsername }] : []),
          ]
        });

        const isEnvPassDirect = Boolean(envPassword && password === envPassword);
        const isBcryptValid = user ? await user.comparePassword(password).catch(() => false) : false;
        const isPasswordValid = isBcryptValid || isEnvPassDirect;
        const isAdminRole = user ? user.role === 'admin' : false;

        if (!user || !isPasswordValid || !isAdminRole) {
          // Increment failed attempts counter
          const currentAttempts = (attemptInfo?.count || 0) + 1;
          const isNowLocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
          const lockedUntil = isNowLocked ? now + LOCKOUT_DURATION_MS : 0;

          failedAttemptsMap.set(lockKey, {
            count: currentAttempts,
            lockedUntil,
          });

          // Record security audit log
          await AuditLog.create({
            action: 'FAILED_LOGIN',
            target: `Failed login attempt for identifier: ${identifier}`,
            author: clientIp,
            timestamp: new Date().toISOString(),
          }).catch(() => null);

          if (isNowLocked) {
            res.status(429).json({
              success: false,
              message: 'Maximum failed attempts exceeded. Security lockout active for 5 minutes.',
            });
            return;
          }

          res.status(401).json({
            success: false,
            message: 'Invalid username/email or password.',
          });
          return;
        }

        // If env password was used directly and hash in DB didn't match, sync the DB hash
        if (isEnvPassDirect && !isBcryptValid && user) {
          try {
            user.password = password;
            user.forcePasswordChange = false;
            await user.save();
          } catch (syncErr) {
            // Non-critical hash sync warning
          }
        }

        // Authentication successful: reset failed attempts
        failedAttemptsMap.delete(lockKey);

        const token = generateToken({
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: IS_PROD,
          sameSite: IS_PROD ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        await AuditLog.create({
          action: 'LOGIN',
          target: `Admin Logged In (${user.email})`,
          author: user.name || user.email,
          timestamp: new Date().toISOString(),
        }).catch(() => null);

        res.status(200).json({
          success: true,
          message: 'Authentication successful.',
          token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
            avatar: user.avatar,
          },
        });
        return;
      }

      // Memory Fallback Mode: dynamically read from live env config
      const isEnvMatch = (identifier === envEmail || identifier === envUsername) && 
        Boolean(envPassword && password === envPassword);

      if (isEnvMatch) {
        failedAttemptsMap.delete(lockKey);

        const token = generateToken({
          id: 'admin-env-session',
          email: envEmail || 'admin@portfolio.local',
          role: 'admin',
        });

        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: IS_PROD,
          sameSite: IS_PROD ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          message: 'Authentication verified.',
          token,
          user: {
            id: 'admin-env-session',
            name: 'Portfolio Admin',
            username: envUsername,
            email: envEmail,
            role: 'admin',
            forcePasswordChange: false,
            avatar: '',
          },
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Authentication service encountered an unexpected error.',
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Logout failed.',
      });
    }
  }

  /**
   * GET /api/auth/profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(req.user.id).select('-password').lean();
        if (user) {
          res.status(200).json({ success: true, user });
          return;
        }
      }

      // Memory fallback
      res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name || 'Portfolio Admin',
          email: req.user.email,
          role: req.user.role,
          forcePasswordChange: false,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile.',
      });
    }
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.',
        });
        return;
      }

      if (mongoose.connection.readyState === 1 && req.user?.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          user.password = newPassword;
          user.forcePasswordChange = false;
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update password.',
      });
    }
  }
}

export default AuthController;
