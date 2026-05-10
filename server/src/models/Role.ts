import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  color: string;
  server: mongoose.Types.ObjectId;
  permissions: bigint;
  position: number;
  hoist: boolean;
  mentionable: boolean;
  managed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#99aab5',
  },
  server: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  permissions: {
    type: String,
    default: '0',
  },
  position: {
    type: Number,
    default: 0,
  },
  hoist: {
    type: Boolean,
    default: false,
  },
  mentionable: {
    type: Boolean,
    default: false,
  },
  managed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

RoleSchema.index({ server: 1, position: -1 });

export const Role = mongoose.model<IRole>('Role', RoleSchema);