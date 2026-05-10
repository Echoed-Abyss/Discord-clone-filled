import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  icon?: string;
  banner?: string;
  description?: string;
  members: {
    user: mongoose.Types.ObjectId;
    nickname?: string;
    roles: mongoose.Types.ObjectId[];
    joinedAt: Date;
  }[];
  channels: mongoose.Types.ObjectId[];
  roles: mongoose.Types.ObjectId[];
  categories: {
    name: string;
    position: number;
    channels: mongoose.Types.ObjectId[];
  }[];
  invites: {
    code: string;
    createdBy: mongoose.Types.ObjectId;
    uses: number;
    maxUses?: number;
    expiresAt?: Date;
    createdAt: Date;
  }[];
  settings: {
    defaultNotifications: 'all' | 'mentions' | 'none';
    explicitContentFilter: 'disabled' | 'members_without_roles' | 'all_members';
    verificationLevel: 'none' | 'low' | 'medium' | 'high' | 'highest';
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema<IServer>({
  name: {
    type: String,
    required: [true, 'Server name is required'],
    minlength: [2, 'Server name must be at least 2 characters'],
    maxlength: [100, 'Server name cannot exceed 100 characters'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  icon: String,
  banner: String,
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    nickname: { 
      type: String,
      maxlength: [32, 'Nickname cannot exceed 32 characters'],
    },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    joinedAt: { type: Date, default: Date.now },
  }],
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  categories: [{
    name: String,
    position: Number,
    channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
  }],
  invites: [{
    code: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uses: { type: Number, default: 0 },
    maxUses: Number,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now },
  }],
  settings: {
    defaultNotifications: {
      type: String,
      enum: ['all', 'mentions', 'none'],
      default: 'all',
    },
    explicitContentFilter: {
      type: String,
      enum: ['disabled', 'members_without_roles', 'all_members'],
      default: 'disabled',
    },
    verificationLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'highest'],
      default: 'none',
    },
  },
}, {
  timestamps: true,
});

ServerSchema.index({ 'members.user': 1 });
ServerSchema.index({ owner: 1 });

export const Server = mongoose.model<IServer>('Server', ServerSchema);