import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateWS } from '../middleware/wsAuth.js';
import { wsService } from '../services/websocketService.js';
import { User } from '../models/User.js';
import { setupMessageHandlers } from './handlers/message.js';
import { setupVoiceHandlers } from './handlers/voice.js';
import { setupPresenceHandlers } from './handlers/presence.js';

export function setupWebSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    transports: ['websocket', 'polling'],
  });

  // 初始化WebSocket服务
  wsService.initialize(io);

  // 认证中间件
  io.use(authenticateWS);

  // 连接处理
  io.on('connection', async (socket) => {
    const userId = socket.userId!;
    const username = socket.username!;

    console.log(`[WS] Connected: ${username} (${userId})`);

    // 添加到在线用户列表
    wsService.addUser(socket);

    // 更新数据库状态
    await User.findByIdAndUpdate(userId, {
      status: 'online',
      lastSeen: new Date(),
    });

    // 广播在线状态
    socket.broadcast.emit('user:status', {
      userId,
      username,
      status: 'online',
    });

    // 加入用户专属房间
    socket.join(`user:${userId}`);

    // 设置消息处理器
    setupMessageHandlers(socket);

    // 设置语音处理器
    setupVoiceHandlers(socket);

    // 设置状态处理器
    setupPresenceHandlers(socket);

    // 加入服务器房间
    socket.on('server:join', (serverId: string) => {
      socket.join(`server:${serverId}`);
      wsService.setUserServer(userId, serverId);
      
      // 通知服务器成员
      socket.to(`server:${serverId}`).emit('server:user_joined', {
        userId,
        username,
      });

      console.log(`[WS] ${username} joined server ${serverId}`);
    });

    socket.on('server:leave', (serverId: string) => {
      socket.leave(`server:${serverId}`);
      wsService.setUserServer(userId, undefined);

      socket.to(`server:${serverId}`).emit('server:user_left', {
        userId,
        username,
      });

      console.log(`[WS] ${username} left server ${serverId}`);
    });

    // 断开连接
    socket.on('disconnect', async () => {
      console.log(`[WS] Disconnected: ${username} (${userId})`);

      // 清理用户
      wsService.removeUser(socket);

      // 更新数据库状态
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date(),
      });

      // 广播离线状态
      io.emit('user:status', {
        userId,
        username,
        status: 'offline',
      });
    });
  });

  // 定期统计信息
  setInterval(() => {
    console.log(`[WS Stats] Online users: ${wsService.getConnectedUserCount()}`);
  }, 60000);

  return io;
}