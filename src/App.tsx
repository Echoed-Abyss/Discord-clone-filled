import React, { useEffect } from 'react';
import AppLayout from './components/AppLayout/AppLayout';
import AuthPage from './components/Auth/AuthPage';
import { useAppStore } from './store';
import { socketService } from './services/socket';
import { api } from './services/api';

function App() {
  const { isAuthenticated, showAuth, fetchCurrentUser, fetchServers, setWsConnected, addMessage, removeMessage, updateMessage } = useAppStore();

  // 初始化认证
  useEffect(() => {
    if (api.isAuthenticated()) {
      fetchCurrentUser();
      fetchServers();
    }
  }, []);

  // 连接 WebSocket
  useEffect(() => {
    const token = api.getToken();
    if (!token) return;

    const socket = socketService.connect(token);

    socket.on('connect', () => {
      setWsConnected(true);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    // 监听新消息
    const unsubMessage = socketService.onMessage((data) => {
      if (data.type === 'edited') {
        updateMessage(data.message.channel || data.message.channelId, data.message);
      } else if (data.type === 'deleted') {
        // 需要channelId，这里简化处理
      } else if (data.type === 'reaction') {
        // 更新反应
      } else {
        // 新消息
        addMessage(data.channelId, {
          id: data.message._id,
          content: data.message.content,
          author: {
            id: data.message.author?._id || data.message.author,
            username: data.message.author?.username || 'Unknown',
            discriminator: '0000',
            avatar: '/api/placeholder/40/40',
            status: 'online',
          },
          timestamp: new Date(data.message.createdAt).getTime(),
          channelId: data.channelId,
          reactions: [],
        });
      }
    });

    return () => {
      unsubMessage();
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || showAuth) {
    return <AuthPage />;
  }

  return <AppLayout />;
}

export default App;