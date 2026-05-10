import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { User } from '../models/User.js';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
      };
      token?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // 验证用户是否存在
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found' 
      });
      return;
    }

    req.user = payload;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token' 
    });
  }
}

// WebSocket认证
export function authenticateWS(socket: any, next: any): void {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    socket.userId = payload.userId;
    socket.username = payload.username;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
}