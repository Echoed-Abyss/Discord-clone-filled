import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

// 扩展Socket类型
declare module 'socket.io' {
  interface Socket {
    userId?: string;
    username?: string;
  }
}

export function authenticateWS(socket: Socket, next: (err?: Error) => void): void {
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