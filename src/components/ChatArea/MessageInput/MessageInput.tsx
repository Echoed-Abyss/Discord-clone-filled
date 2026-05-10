import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { socketService } from '../../../services/socket';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { currentUser, currentChannelId, currentServerId, replyingTo, editingMessage, sendMessage, editMessage, setReplyingTo, setEditingMessage } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTyping = useRef(false);

  // 正在输入状态
  useEffect(() => {
    if (message && !isTyping.current) {
      isTyping.current = true;
      socketService.startTyping(currentChannelId || '', currentServerId || '');
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping.current) {
        socketService.stopTyping(currentChannelId || '', currentServerId || '');
        isTyping.current = false;
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message]);

  // 编辑模式
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSend = async () => {
    if (!message.trim() || !currentChannelId) return;

    try {
      if (editingMessage) {
        const messageId = editingMessage._id || editingMessage.id || '';
        await editMessage(messageId, message);
      } else {
        await sendMessage(currentChannelId, message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setMessage('');
    setEditingMessage(null);
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 flex-shrink-0">
      {replyingTo && (
        <div className="flex items-center justify-between bg-discord-secondary rounded-t-lg px-4 py-2 border-l-4 border-discord-link">
          <div className="text-sm text-discord-text-secondary">
            回复 <span className="text-white font-medium">{replyingTo.author?.username || 'Unknown'}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-discord-text-secondary hover:text-white">✕</button>
        </div>
      )}
      
      {editingMessage && (
        <div className="flex items-center justify-between bg-discord-secondary rounded-t-lg px-4 py-2 border-l-4 border-yellow-500">
          <div className="text-sm text-discord-text-secondary">编辑消息</div>
          <button onClick={() => setEditingMessage(null)} className="text-discord-text-secondary hover:text-white">取消</button>
        </div>
      )}

      <div className={`bg-discord-secondary flex items-center p-2 ${replyingTo || editingMessage ? 'rounded-t-none rounded-b-lg' : 'rounded-lg'}`}>
        <button className="p-2 text-discord-text-secondary hover:text-white transition-colors rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`发送消息...`}
          className="flex-1 bg-transparent text-discord-text-primary px-2 py-1 focus:outline-none placeholder-discord-text-secondary text-sm"
        />
        <div className="flex items-center gap-1">
          <button className="p-2 text-discord-text-secondary hover:text-white transition-colors rounded">😊</button>
          <button className="p-2 text-discord-text-secondary hover:text-white transition-colors rounded">📎</button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;