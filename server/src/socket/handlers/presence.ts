import { Socket } from 'socket.io';
import { User } from '../../models/User.js';
import { wsService } from '../../services/websocketService.js';

export function setupPresenceHandlers(socket: Socket): void {
  // 状态更新
  socket.on('presence:update', async (data: {
    status: 'online' | 'idle' | 'dnd' | 'offline';
  }) => {
    await wsService.updateUserStatus(socket.userId!, data.status);
  });

  // 自定义状态更新
  socket.on('presence:custom-status', async (data: {
    customStatus: string;
  }) => {
    await User.findByIdAndUpdate(socket.userId!, {
      customStatus: data.customStatus,
    });

    // 通知所有好友
    const user = await User.findById(socket.userId!).populate('friends');
    if (user) {
      user.friends.forEach((friend: any) => {
        if (wsService.isUserOnline(friend._id.toString())) {
          wsService.getIO().to(`user:${friend._id}`).emit('friend:custom_status', {
            userId: socket.userId,
            customStatus: data.customStatus,
          });
        }
      });
    }
  });

  // 好友上线通知
  socket.on('presence:online', async () => {
    const user = await User.findById(socket.userId!).select('friends');
    if (user) {
      const onlineFriends = user.friends.filter((friendId: any) =>
        wsService.isUserOnline(friendId.toString())
      );

      onlineFriends.forEach((friendId: any) => {
        wsService.getIO().to(`user:${friendId}`).emit('friend:online', {
          userId: socket.userId,
          username: socket.username,
        });
      });
    }
  });

  // 更新活动状态（正在玩游戏等）
  socket.on('presence:activity', async (data: {
    activity: {
      name: string;
      type: 'playing' | 'streaming' | 'listening' | 'watching' | 'competing';
      details?: string;
      state?: string;
    } | null;
  }) => {
    // 通知所有好友和当前服务器的成员
    const user = await User.findById(socket.userId!);
    if (!user) return;

    const notification = {
      userId: socket.userId,
      username: socket.username,
      activity: data.activity,
    };

    // 通知好友
    user.friends.forEach((friendId: any) => {
      wsService.getIO().to(`user:${friendId}`).emit('friend:activity', notification);
    });

    // 通知当前服务器成员
    const wsUser = wsService.getUser(socket.userId!);
    if (wsUser?.currentServer) {
      socket.to(`server:${wsUser.currentServer}`).emit('user:activity', notification);
    }
  });

  // 获取所有在线用户
  socket.on('presence:get-online', () => {
    const onlineUsers = wsService.getOnlineUsers();
    socket.emit('presence:online-users', {
      users: onlineUsers.map(u => ({
        userId: u.userId,
        username: u.username,
        status: u.status,
      })),
    });
  });

  // 心跳检测
  socket.on('presence:heartbeat', () => {
    socket.emit('presence:heartbeat-ack', {
      timestamp: Date.now(),
    });
  });

  // 键盘活动（空闲检测）
  socket.on('presence:active', async () => {
    const wsUser = wsService.getUser(socket.userId!);
    if (wsUser && wsUser.status === 'idle') {
      await wsService.updateUserStatus(socket.userId!, 'online');
    }
  });

  // 断开连接处理在socket/index.ts中处理
}