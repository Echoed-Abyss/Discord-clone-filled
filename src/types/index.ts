export interface User {
  id?: string;
  _id?: string;
  username: string;
  discriminator: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  email?: string;
  banner?: string;
  accentColor?: string;
  bio?: string;
}

export interface Server {
  id?: string;
  _id?: string;
  name: string;
  icon?: string;
  owner: string | { _id: string; username: string };
  channels: Channel[];
  roles?: Role[];
  members?: ServerMember[];
  banner?: string;
  description?: string;
}

export interface Channel {
  id?: string;
  _id?: string;
  name: string;
  type: 'text' | 'voice' | 'announcement' | 'forum';
  category?: string;
  topic?: string;
  isNSFW?: boolean;
  slowMode?: number;
}

export interface Message {
  id?: string;
  _id?: string;
  content: string;
  author: User;
  timestamp: number;
  channelId: string;
  edited?: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
}

export interface Reaction {
  emoji: string;
  count?: number;
  users: string[];
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

export interface Role {
  id?: string;
  _id?: string;
  name: string;
  color: string;
  position: number;
  hoist: boolean;
  mentionable: boolean;
}

export interface ServerMember {
  user: User;
  roles: string[];
  nickname?: string;
  joinedAt: number;
}