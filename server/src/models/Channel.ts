import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  type: 'text' | 'voice' | 'announcement' | 'forum';
  server: mongoose.Types.ObjectId;
  topic?: string;
  isNSFW: boolean;
  parentCategory?: string;
  position: number;
  slowMode: number;
  permissionOverwrites: {
    id: mongoose.Types.ObjectId;
    type: 'role' | 'member';
    allow: string;
    deny: string;
  }[];
  voiceMembers?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    minlength: [1, 'Channel name is required'],
    maxlength: [100, 'Channel name cannot exceed 100 characters'],
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement', 'forum'],
    default: 'text',
  },
  server: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  topic: {
    type: String,
    maxlength: [1024, 'Topic cannot exceed 1024 characters'],
  },
  isNSFW: { type: Boolean, default: false },
  parentCategory: String,
  position: { type: Number, default: 0 },
  slowMode: { type: Number, default: 0, min: 0, max: 21600 },
  permissionOverwrites: [{
    id: { type: Schema.Types.ObjectId },
    type: { type: String, enum: ['role', 'member'] },
    allow: { type: String, default: '0' },
    deny: { type: String, default: '0' },
  }],
  voiceMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

ChannelSchema.index({ server: 1, position: 1 });

export const Channel = mongoose.model<IChannel>('Channel', ChannelSchema);