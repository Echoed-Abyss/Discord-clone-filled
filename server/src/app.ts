import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authenticate } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import serverRoutes from './routes/servers.js';
import channelRoutes from './routes/channels.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// 全局中间件
app.use(helmet());
app.use(cors({
  origin: '*',           // 允许所有来源
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传的文件）
app.use('/uploads', express.static('uploads'));

// API限流
app.use('/api', apiLimiter);

// 公开路由
app.use('/api/auth', authRoutes);

// 需要认证的路由
app.use('/api/users', authenticate, userRoutes);
app.use('/api/servers', authenticate, serverRoutes);
app.use('/api/channels', authenticate, channelRoutes);
app.use('/api/messages', authenticate, messageRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal server error',
    message: err.message || 'Something went wrong',
  });
});

export default app;