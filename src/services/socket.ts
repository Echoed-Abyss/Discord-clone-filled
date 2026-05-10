import { io, Socket } from 'socket.io-client';

type MessageHandler = (data: any) => void;
type StatusHandler = (data: { userId: string; status: string }) => void;
type VoiceHandler = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private typingHandlers: Set<MessageHandler> = new Set();
  private voiceHandlers: Set<VoiceHandler> = new Set();

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('🟢 WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.log('⚠️ WebSocket connection error:', error.message);
    });

    // 新消息
    this.socket.on('message:new', (data) => {
      this.messageHandlers.forEach(handler => handler(data));
    });

    // 消息编辑
    this.socket.on('message:edited', (data) => {
      this.messageHandlers.forEach(handler => handler({ ...data, type: 'edited' }));
    });

    // 消息删除
    this.socket.on('message:deleted', (data) => {
      this.messageHandlers.forEach(handler => handler({ ...data, type: 'deleted' }));
    });

    // 反应更新
    this.socket.on('message:reaction', (data) => {
      this.messageHandlers.forEach(handler => handler({ ...data, type: 'reaction' }));
    });

    // 用户状态
    this.socket.on('user:status', (data) => {
      this.statusHandlers.forEach(handler => handler(data));
    });

    // 正在输入
    this.socket.on('user:typing', (data) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('user:typing_stop', (data) => {
      this.typingHandlers.forEach(handler => handler({ ...data, typing: false }));
    });

    // 语音频道
    this.socket.on('voice:user_joined', (data) => {
      this.voiceHandlers.forEach(handler => handler({ ...data, type: 'joined' }));
    });

    this.socket.on('voice:user_left', (data) => {
      this.voiceHandlers.forEach(handler => handler({ ...data, type: 'left' }));
    });

    // WebRTC 信令
    this.socket.on('voice:offer', (data) => {
      this.voiceHandlers.forEach(handler => handler({ ...data, type: 'offer' }));
    });

    this.socket.on('voice:answer', (data) => {
      this.voiceHandlers.forEach(handler => handler({ ...data, type: 'answer' }));
    });

    this.socket.on('voice:ice-candidate', (data) => {
      this.voiceHandlers.forEach(handler => handler({ ...data, type: 'ice-candidate' }));
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ============ 服务器 ============
  joinServer(serverId: string) {
    this.socket?.emit('server:join', serverId);
  }

  leaveServer(serverId: string) {
    this.socket?.emit('server:leave', serverId);
  }

  // ============ 消息 ============
  sendMessage(data: { channelId: string; serverId: string; content: string }) {
    this.socket?.emit('message:send', data);
  }

  editMessage(data: { messageId: string; content: string; serverId: string }) {
    this.socket?.emit('message:edit', data);
  }

  deleteMessage(data: { messageId: string; serverId: string }) {
    this.socket?.emit('message:delete', data);
  }

  addReaction(data: { messageId: string; emoji: string; serverId: string }) {
    this.socket?.emit('message:react', data);
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // ============ 正在输入 ============
  startTyping(channelId: string, serverId: string) {
    this.socket?.emit('typing:start', { channelId, serverId });
  }

  stopTyping(channelId: string, serverId: string) {
    this.socket?.emit('typing:stop', { channelId, serverId });
  }

  onTyping(handler: MessageHandler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  // ============ 用户状态 ============
  onUserStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  // ============ 语音 ============
  joinVoice(channelId: string, serverId: string) {
    this.socket?.emit('voice:join', { channelId, serverId });
  }

  leaveVoice(channelId: string, serverId: string) {
    this.socket?.emit('voice:leave', { channelId, serverId });
  }

  sendVoiceOffer(data: { channelId: string; to: string; offer: any }) {
    this.socket?.emit('voice:offer', data);
  }

  sendVoiceAnswer(data: { channelId: string; to: string; answer: any }) {
    this.socket?.emit('voice:answer', data);
  }

  sendIceCandidate(data: { channelId: string; to: string; candidate: any }) {
    this.socket?.emit('voice:ice-candidate', data);
  }

  onVoice(handler: VoiceHandler) {
    this.voiceHandlers.add(handler);
    return () => this.voiceHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();