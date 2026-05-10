import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import MessageItem from './MessageItem';

const MessageList: React.FC = () => {
  const { messages, currentChannelId } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelMessages = currentChannelId ? messages[currentChannelId] || [] : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  if (channelMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-discord-text-secondary">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">欢迎！</h3>
          <p className="text-sm">发送第一条消息吧</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {channelMessages.map((msg) => (
        <MessageItem key={msg._id || msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;