import { create } from 'zustand';
import { User, Server, Channel, Message } from '../types';

interface AppState {
  // User state
  currentUser: User | null;
  users: User[];

  // Server state
  servers: Server[];
  currentServerId: string | null;
  currentChannelId: string | null;

  // UI state
  showUserSettings: boolean;
  showServerSettings: boolean;
  showChannelSettings: boolean;
  showMemberList: boolean;
  selectedChannel: Channel | null;

  // Message state
  messages: Record<string, Message[]>;
  editingMessage: Message | null;
  replyingTo: Message | null;

  // Actions
  setCurrentUser: (user: User) => void;
  addServer: (server: Server) => void;
  setCurrentServer: (serverId: string | null) => void;
  setCurrentChannel: (channelId: string | null) => void;
  addMessage: (channelId: string, message: Message) => void;
  editMessage: (channelId: string, messageId: string, content: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  addReaction: (channelId: string, messageId: string, emoji: string, userId: string) => void;
  removeReaction: (channelId: string, messageId: string, emoji: string, userId: string) => void;
  toggleUserSettings: () => void;
  toggleServerSettings: () => void;
  toggleChannelSettings: () => void;
  toggleMemberList: () => void;
  setEditingMessage: (message: Message | null) => void;
  setReplyingTo: (message: Message | null) => void;
  updateServer: (server: Server) => void;
  updateChannel: (channel: Channel) => void;
  updateUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial State
  currentUser: {
    id: '1',
    username: 'DemoUser',
    discriminator: '0001',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=5865f2&color=fff&size=128',
    status: 'online',
    email: 'demo@example.com',
    bio: 'Hello, I am a demo user!',
    accentColor: '#5865f2',
  },
  users: [
    {
      id: '1',
      username: 'DemoUser',
      discriminator: '0001',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=5865f2&color=fff&size=128',
      status: 'online',
    },
    {
      id: '2',
      username: 'Friend1',
      discriminator: '1234',
      avatar: 'https://ui-avatars.com/api/?name=Friend1&background=3ba55d&color=fff&size=128',
      status: 'idle',
    },
    {
      id: '3',
      username: 'Friend2',
      discriminator: '5678',
      avatar: 'https://ui-avatars.com/api/?name=Friend2&background=ed4245&color=fff&size=128',
      status: 'dnd',
    },
  ],
  servers: [
    {
      id: 'demo-server-1',
      name: 'Demo Server',
      icon: '',
      ownerId: '1',
      description: 'A demo Discord server',
      channels: [
        {
          id: 'ch-1',
          name: 'general',
          type: 'text',
          category: 'Text Channels',
          topic: 'General discussion',
        },
        {
          id: 'ch-2',
          name: 'announcements',
          type: 'announcement',
          category: 'Text Channels',
          topic: 'Important announcements',
        },
        {
          id: 'ch-3',
          name: 'General Voice',
          type: 'voice',
          category: 'Voice Channels',
        },
        {
          id: 'ch-4',
          name: 'gaming',
          type: 'text',
          category: 'Gaming',
          topic: 'Gaming discussion',
        },
      ],
      roles: [
        {
          id: 'role-1',
          name: '@everyone',
          color: '#99aab5',
          permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
          position: 0,
          hoist: false,
          mentionable: false,
        },
        {
          id: 'role-2',
          name: 'Admin',
          color: '#ff0000',
          permissions: ['ADMINISTRATOR'],
          position: 1,
          hoist: true,
          mentionable: true,
        },
      ],
      members: [
        {
          user: {
            id: '1',
            username: 'DemoUser',
            discriminator: '0001',
            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=5865f2&color=fff&size=128',
            status: 'online',
          },
          roles: ['role-2'],
          joinedAt: Date.now(),
        },
        {
          user: {
            id: '2',
            username: 'Friend1',
            discriminator: '1234',
            avatar: 'https://ui-avatars.com/api/?name=Friend1&background=3ba55d&color=fff&size=128',
            status: 'idle',
          },
          roles: ['role-1'],
          joinedAt: Date.now() - 86400000,
        },
        {
          user: {
            id: '3',
            username: 'Friend2',
            discriminator: '5678',
            avatar: 'https://ui-avatars.com/api/?name=Friend2&background=ed4245&color=fff&size=128',
            status: 'dnd',
          },
          roles: ['role-1'],
          joinedAt: Date.now() - 172800000,
        },
      ],
    },
  ],
  currentServerId: 'demo-server-1',
  currentChannelId: 'ch-1',
  showUserSettings: false,
  showServerSettings: false,
  showChannelSettings: false,
  showMemberList: true,
  selectedChannel: null,
  messages: {
    'ch-1': [
      {
        id: 'msg-1',
        content: 'Welcome to the **general** channel! :wave:',
        author: {
          id: '1',
          username: 'DemoUser',
          discriminator: '0001',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=5865f2&color=fff&size=128',
          status: 'online',
        },
        timestamp: Date.now() - 3600000,
        channelId: 'ch-1',
        reactions: [
          { emoji: '👋', count: 3, users: ['1', '2', '3'], hasReacted: true },
        ],
      },
      {
        id: 'msg-2',
        content: 'Hello everyone! How are you doing?',
        author: {
          id: '2',
          username: 'Friend1',
          discriminator: '1234',
          avatar: 'https://ui-avatars.com/api/?name=Friend1&background=3ba55d&color=fff&size=128',
          status: 'idle',
        },
        timestamp: Date.now() - 1800000,
        channelId: 'ch-1',
        reactions: [],
      },
      {
        id: 'msg-3',
        content: 'I\'m doing great! Thanks for asking 😊',
        author: {
          id: '3',
          username: 'Friend2',
          discriminator: '5678',
          avatar: 'https://ui-avatars.com/api/?name=Friend2&background=ed4245&color=fff&size=128',
          status: 'dnd',
        },
        timestamp: Date.now() - 900000,
        channelId: 'ch-1',
        reactions: [
          { emoji: '❤️', count: 2, users: ['1', '2'], hasReacted: false },
        ],
      },
    ],
  },
  editingMessage: null,
  replyingTo: null,

  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),

  addServer: (server) =>
    set((state) => ({
      servers: [...state.servers, server],
    })),

  setCurrentServer: (serverId) =>
    set((state) => {
      // 自动选择第一个文字频道
      let firstChannelId: string | null = null;
      if (serverId) {
        const server = state.servers.find((s) => s.id === serverId || s._id === serverId);
        if (server) {
          const firstTextChannel = server.channels.find((c) => c.type === 'text');
          if (firstTextChannel) {
            firstChannelId = firstTextChannel.id;
          }
        }
      }
      return {
        currentServerId: serverId,
        currentChannelId: firstChannelId || state.currentChannelId,
      };
    }),

  setCurrentChannel: (channelId) => set({ currentChannelId: channelId }),

  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message],
      },
    })),

  editMessage: (channelId, messageId, content) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, content, edited: true } : msg
        ),
      },
    })),

  deleteMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).filter((msg) => msg.id !== messageId),
      },
    })),

  addReaction: (channelId, messageId, emoji, userId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((msg) => {
          if (msg.id !== messageId) return msg;
          const existingReaction = msg.reactions?.find((r) => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, users: [...r.users, userId], hasReacted: userId === '1' }
                  : r
              ),
            };
          }
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, count: 1, users: [userId], hasReacted: userId === '1' },
            ],
          };
        }),
      },
    })),

  removeReaction: (channelId, messageId, emoji, userId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((msg) => {
          if (msg.id !== messageId) return msg;
          return {
            ...msg,
            reactions: msg.reactions
              ?.map((r) => {
                if (r.emoji !== emoji) return r;
                const newUsers = r.users.filter((id) => id !== userId);
                if (newUsers.length === 0) return null;
                return { ...r, count: r.count - 1, users: newUsers, hasReacted: false };
              })
              .filter(Boolean) as typeof msg.reactions,
          };
        }),
      },
    })),

  toggleUserSettings: () =>
    set((state) => ({ showUserSettings: !state.showUserSettings })),

  toggleServerSettings: () =>
    set((state) => ({ showServerSettings: !state.showServerSettings })),

  toggleChannelSettings: () =>
    set((state) => ({ showChannelSettings: !state.showChannelSettings })),

  toggleMemberList: () =>
    set((state) => ({ showMemberList: !state.showMemberList })),

  setEditingMessage: (message) => set({ editingMessage: message }),

  setReplyingTo: (message) => set({ replyingTo: message }),

  updateServer: (server) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        (s.id === server.id || s._id === server._id) ? server : s
      ),
    })),

  updateChannel: (channel) =>
    set((state) => ({
      servers: state.servers.map((server) => ({
        ...server,
        channels: server.channels.map((ch) =>
          (ch.id === channel.id) ? channel : ch
        ),
      })),
    })),

  updateUser: (user) => set({ currentUser: user }),
}));