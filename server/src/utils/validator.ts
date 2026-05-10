import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(2, 'Username must be at least 2 characters')
    .max(32, 'Username cannot exceed 32 characters')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 'Username contains invalid characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createServerSchema = z.object({
  name: z.string()
    .min(2, 'Server name must be at least 2 characters')
    .max(100, 'Server name cannot exceed 100 characters'),
  description: z.string().max(1000).optional(),
});

export const createChannelSchema = z.object({
  name: z.string()
    .min(1, 'Channel name is required')
    .max(100, 'Channel name cannot exceed 100 characters'),
  type: z.enum(['text', 'voice', 'announcement', 'forum']),
  topic: z.string().max(1024).optional(),
  isNSFW: z.boolean().optional(),
  parentCategory: z.string().optional(),
  slowMode: z.number().min(0).max(21600).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
});