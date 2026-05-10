import { Server as SocketIOServer, Socket } from 'socket.io';
import { User } from '../models/User.js';

interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  currentServer?: string;
  currentVoiceChannel?: string;
}

export class WebSocketService {
  private io!: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map();

  initialize(io: SocketIOServer) {
    this.io = io;
  }

  addUser(socket: Socket) {
    const userId = socket.userId!;
    const username = socket.username!;

    this.connectedUsers.set(userId, {
      userId,
      username,
      socketId: socket.id,
      status: 'online',
    });

    console.log(`[WS] User connected: ${username} (${userId})`);
  }

  removeUser(socket: Socket) {
    const userId = socket.userId!;

    // 清理正在输入状态
    this.typingUsers.forEach((users, channel) => {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(channel);
      }
    });

    this.connectedUsers.delete(userId);
    console.log(`[WS] User disconnected: ${socket.username}`);
  }

  getUser(userId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(userId);
  }

  getOnlineUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getUsersInServer(serverId: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(
      (u) => u.currentServer === serverId
    );
  }

  setUserServer(userId: string, serverId: string | undefined) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.currentServer = serverId;
    }
  }

  setUserVoiceChannel(userId: string, channelId: string | undefined) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.currentVoiceChannel = channelId;
    }
  }

  getUsersInVoiceChannel(channelId: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(
      (u) => u.currentVoiceChannel === channelId
    );
  }

  async updateUserStatus(userId: string, status: 'online' | 'idle' | 'dnd' | 'offline') {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.status = status;
    }

    // 更新数据库
    await User.findByIdAndUpdate(userId, {
      status,
      lastSeen: status === 'offline' ? new Date() : undefined,
    });

    // 广播状态变化
    this.io.emit('user:status', { userId, status });
  }

  setTyping(userId: string, channelId: string) {
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set());
    }
    this.typingUsers.get(channelId)!.add(userId);
  }

  removeTyping(userId: string, channelId: string) {
    const users = this.typingUsers.get(channelId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(channelId);
      }
    }
  }

  getTypingUsers(channelId: string): string[] {
    return Array.from(this.typingUsers.get(channelId) || []);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getIO(): SocketIOServer {
    return this.io;
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }
}

export const wsService = new WebSocketService();