import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  channel: mongoose.Types.ObjectId;
  server: mongoose.Types.ObjectId;
  type: 'default' | 'system' | 'reply';
  referencedMessage?: mongoose.Types.ObjectId;
  attachments: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
  }[];
  embeds: {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
    image?: string;
    thumbnail?: string;
  }[];
  reactions: {
    emoji: string;
    users: mongoose.Types.ObjectId[];
  }[];
  mentions: {
    users: mongoose.Types.ObjectId[];
    roles: mongoose.Types.ObjectId[];
    everyone: boolean;
  };
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [4000, 'Message cannot exceed 4000 characters'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  server: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  type: {
    type: String,
    enum: ['default', 'system', 'reply'],
    default: 'default',
  },
  referencedMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    width: Number,
    height: Number,
  }],
  embeds: [{
    title: String,
    description: String,
    url: String,
    color: Number,
    fields: [{
      name: String,
      value: String,
      inline: Boolean,
    }],
    image: String,
    thumbnail: String,
  }],
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  }],
  mentions: {
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    everyone: { type: Boolean, default: false },
  },
  edited: { type: Boolean, default: false },
  editedAt: Date,
}, {
  timestamps: true,
});

// 消息索引用于高效查询
MessageSchema.index({ channel: 1, createdAt: -1 });
MessageSchema.index({ author: 1, createdAt: -1 });
MessageSchema.index({ server: 1, createdAt: -1 });
MessageSchema.index({ content: 'text' });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);