import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  discriminator: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  accentColor: string;
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    from: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
  }[];
  servers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastSeen: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [32, 'Username cannot exceed 32 characters'],
    match: [/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 'Username contains invalid characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  discriminator: {
    type: String,
    required: true,
    match: [/^\d{4}$/, 'Discriminator must be 4 digits'],
  },
  avatar: { type: String },
  banner: { type: String },
  bio: { 
    type: String, 
    maxlength: [190, 'Bio cannot exceed 190 characters'] 
  },
  status: {
    type: String,
    enum: ['online', 'idle', 'dnd', 'offline'],
    default: 'online',
  },
  customStatus: { type: String },
  accentColor: { 
    type: String, 
    default: '#5865f2' 
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  }],
  servers: [{ type: Schema.Types.ObjectId, ref: 'Server' }],
  lastSeen: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// 密码哈希中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 比较密码方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 生成随机的4位discriminator
UserSchema.statics.generateDiscriminator = async function(username: string): Promise<string> {
  while (true) {
    const discriminator = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await this.findOne({ username, discriminator });
    if (!existing) return discriminator;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema);