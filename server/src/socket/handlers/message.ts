import { Socket } from 'socket.io';
import { messageService } from '../../services/messageService.js';
import { wsService } from '../../services/websocketService.js';

export function setupMessageHandlers(socket: Socket): void {
  // 发送消息
  socket.on('message:send', async (data: {
    channelId: string;
    serverId: string;
    content: string;
  }) => {
    try {
      const result = await messageService.sendMessage({
        content: data.content,
        channelId: data.channelId,
        authorId: socket.userId!,
        serverId: data.serverId,
      });

      // 广播消息给服务器内的所有人
      wsService.getIO().to(`server:${data.serverId}`).emit('message:new', {
        channelId: data.channelId,
        message: result.message,
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to send message' });
    }
  });

  // 编辑消息
  socket.on('message:edit', async (data: {
    messageId: string;
    content: string;
    serverId: string;
  }) => {
    try {
      const result = await messageService.editMessage(
        data.messageId,
        socket.userId!,
        data.content
      );

      wsService.getIO().to(`server:${data.serverId}`).emit('message:edited', {
        messageId: data.messageId,
        message: result.message,
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to edit message' });
    }
  });

  // 删除消息
  socket.on('message:delete', async (data: {
    messageId: string;
    serverId: string;
  }) => {
    try {
      await messageService.deleteMessage(data.messageId, socket.userId!);

      wsService.getIO().to(`server:${data.serverId}`).emit('message:deleted', {
        messageId: data.messageId,
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to delete message' });
    }
  });

  // 添加反应
  socket.on('message:react', async (data: {
    messageId: string;
    emoji: string;
    serverId: string;
  }) => {
    try {
      const result = await messageService.addReaction(
        data.messageId,
        socket.userId!,
        data.emoji
      );

      wsService.getIO().to(`server:${data.serverId}`).emit('message:reaction', {
        messageId: data.messageId,
        reactions: result.reactions,
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to add reaction' });
    }
  });

  // 正在输入
  socket.on('typing:start', (data: { channelId: string; serverId: string }) => {
    wsService.setTyping(socket.userId!, data.channelId);

    socket.to(`server:${data.serverId}`).emit('user:typing', {
      channelId: data.channelId,
      userId: socket.userId,
      username: socket.username,
      typingUsers: wsService.getTypingUsers(data.channelId),
    });
  });

  socket.on('typing:stop', (data: { channelId: string; serverId: string }) => {
    wsService.removeTyping(socket.userId!, data.channelId);

    socket.to(`server:${data.serverId}`).emit('user:typing_stop', {
      channelId: data.channelId,
      userId: socket.userId,
    });
  });

  // 批量删除消息
  socket.on('message:bulkDelete', async (data: {
    messageIds: string[];
    serverId: string;
  }) => {
    try {
      const result = await messageService.bulkDeleteMessages(
        data.messageIds,
        socket.userId!
      );

      wsService.getIO().to(`server:${data.serverId}`).emit('messages:bulk_deleted', {
        messageIds: data.messageIds,
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to delete messages' });
    }
  });
}