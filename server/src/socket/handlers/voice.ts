import { Socket } from 'socket.io';
import { channelService } from '../../services/channelService.js';
import { wsService } from '../../services/websocketService.js';

export function setupVoiceHandlers(socket: Socket): void {
  // 加入语音频道
  socket.on('voice:join', async (data: {
    channelId: string;
    serverId: string;
  }) => {
    try {
      await channelService.joinVoiceChannel(data.channelId, socket.userId!);
      
      // 加入语音频道房间
      socket.join(`voice:${data.channelId}`);
      wsService.setUserVoiceChannel(socket.userId!, data.channelId);

      // 获取语音频道中的用户
      const voiceUsers = wsService.getUsersInVoiceChannel(data.channelId);

      // 通知服务器内的其他人
      wsService.getIO().to(`server:${data.serverId}`).emit('voice:user_joined', {
        channelId: data.channelId,
        userId: socket.userId,
        username: socket.username,
        voiceUsers: voiceUsers.map(u => ({
          userId: u.userId,
          username: u.username,
        })),
      });

      // 通知加入者当前语音频道中的用户
      socket.emit('voice:users', {
        channelId: data.channelId,
        users: voiceUsers.map(u => ({
          userId: u.userId,
          username: u.username,
        })),
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to join voice channel' });
    }
  });

  // 离开语音频道
  socket.on('voice:leave', async (data: {
    channelId: string;
    serverId: string;
  }) => {
    try {
      await channelService.leaveVoiceChannel(data.channelId, socket.userId!);

      socket.leave(`voice:${data.channelId}`);
      wsService.setUserVoiceChannel(socket.userId!, undefined);

      const voiceUsers = wsService.getUsersInVoiceChannel(data.channelId);

      wsService.getIO().to(`server:${data.serverId}`).emit('voice:user_left', {
        channelId: data.channelId,
        userId: socket.userId,
        username: socket.username,
        voiceUsers: voiceUsers.map(u => ({
          userId: u.userId,
          username: u.username,
        })),
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to leave voice channel' });
    }
  });

  // WebRTC 信令 - offer
  socket.on('voice:offer', (data: {
    channelId: string;
    to: string;
    offer: any;
  }) => {
    wsService.getIO().to(`user:${data.to}`).emit('voice:offer', {
      from: socket.userId,
      fromUsername: socket.username,
      channelId: data.channelId,
      offer: data.offer,
    });
  });

  // WebRTC 信令 - answer
  socket.on('voice:answer', (data: {
    channelId: string;
    to: string;
    answer: any;
  }) => {
    wsService.getIO().to(`user:${data.to}`).emit('voice:answer', {
      from: socket.userId,
      fromUsername: socket.username,
      channelId: data.channelId,
      answer: data.answer,
    });
  });

  // WebRTC 信令 - ICE 候选
  socket.on('voice:ice-candidate', (data: {
    channelId: string;
    to: string;
    candidate: any;
  }) => {
    wsService.getIO().to(`user:${data.to}`).emit('voice:ice-candidate', {
      from: socket.userId,
      fromUsername: socket.username,
      channelId: data.channelId,
      candidate: data.candidate,
    });
  });

  // 语音状态更新（静音/扬声器静音）
  socket.on('voice:status', async (data: {
    channelId: string;
    serverId: string;
    isMuted: boolean;
    isDeafened: boolean;
  }) => {
    // 通知同一语音频道的其他人
    wsService.getIO().to(`voice:${data.channelId}`).emit('voice:user_status', {
      userId: socket.userId,
      username: socket.username,
      isMuted: data.isMuted,
      isDeafened: data.isDeafened,
    });
  });

  // 屏幕共享开始
  socket.on('voice:screen-share-start', (data: {
    channelId: string;
    serverId: string;
  }) => {
    wsService.getIO().to(`voice:${data.channelId}`).emit('voice:screen_share_started', {
      userId: socket.userId,
      username: socket.username,
      channelId: data.channelId,
    });
  });

  // 屏幕共享结束
  socket.on('voice:screen-share-stop', (data: {
    channelId: string;
    serverId: string;
  }) => {
    wsService.getIO().to(`voice:${data.channelId}`).emit('voice:screen_share_stopped', {
      userId: socket.userId,
      username: socket.username,
      channelId: data.channelId,
    });
  });
}