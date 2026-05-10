import React, { useEffect } from 'react';
import { useAppStore } from '../../store';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';

const ChatArea: React.FC = () => {
  const { currentChannelId, fetchMessages } = useAppStore();

  useEffect(() => {
    if (currentChannelId) {
      fetchMessages(currentChannelId);
    }
  }, [currentChannelId]);

  if (!currentChannelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-primary">
        <div className="text-center text-discord-text-secondary">
          <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">选择一个频道开始聊天</h3>
          <p className="text-sm">从左侧选择一个文字频道</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatArea;