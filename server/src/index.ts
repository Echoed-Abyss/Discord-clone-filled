import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './database.js';
import { setupWebSocket } from './socket/index.js';

const PORT = process.env.PORT || 4000;

async function start() {
  // 连接数据库
  await connectDatabase();

  // 创建HTTP服务器
  const httpServer = createServer(app);

  // 设置WebSocket
  const io = setupWebSocket(httpServer);

  // 启动服务器
httpServer.listen(PORT, '0.0.0.0', () => {   // 加上 '0.0.0.0'
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // 优雅关闭
  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    io.close();
    httpServer.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();