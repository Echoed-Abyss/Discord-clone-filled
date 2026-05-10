import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message, Reaction } from '../../../types';
import { useAppStore } from '../../../store';

interface MessageItemProps {
  message: Message;
  isCompact?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCompact }) => {
  const [showActions, setShowActions] = useState(false);
  const { currentUser, setEditingMessage, setReplyingTo, deleteMessage } = useAppStore();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today at ${timeString}`;
    if (isYesterday) return `Yesterday at ${timeString}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ` ${timeString}`;
  };

  const getAvatarUrl = (author: Message['author']) => {
    if (author.avatar && author.avatar.startsWith('http')) {
      return author.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(author.username)}&background=5865f2&color=fff&size=80`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.author.username)}&background=5865f2&color=fff&size=80`;
  };

  if (isCompact) {
    return (
      <div className="group hover:bg-discord-hover px-4 py-0.5 transition-colors">
        <div className="flex items-start">
          <div className="w-10 flex-shrink-0 text-right opacity-0 group-hover:opacity-100">
            <span className="text-xs text-discord-timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex-1 ml-0">
            <div className="text-discord-text-primary">
              <div className="prose prose-invert max-w-none prose-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      return (
                        <code
                          className={`${className || ''} ${inline ? 'bg-discord-tertiary px-1 rounded text-sm' : 'block bg-discord-tertiary p-3 rounded-lg'}`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    img({ node, ...props }: any) {
                      return <img className="rounded-lg max-w-[400px] max-h-[300px]" {...props} />;
                    },
                    a({ node, ...props }: any) {
                      return <a className="text-discord-link hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                    },
                    table({ node, ...props }: any) {
                      return (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-discord-tertiary" {...props} />
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.edited && <span className="text-xs text-discord-muted ml-2">(edited)</span>}
            </div>
            
            {/* Compact Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-1">
                {message.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-colors
                      ${reaction.hasReacted 
                        ? 'bg-discord-reaction-active border border-discord-primary' 
                        : 'bg-discord-reaction hover:bg-discord-reaction-hover border border-transparent'
                      }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-discord-text-secondary">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group hover:bg-discord-hover px-4 py-2 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start">
        <img
          src={getAvatarUrl(message.author)}
          alt={message.author.username}
          className="w-10 h-10 rounded-full mr-4 mt-0.5 cursor-pointer hover:opacity-80 flex-shrink-0"
          onError={handleImageError}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-white hover:underline cursor-pointer">
              {message.author.username}
            </span>
            <span className="text-xs text-discord-text-secondary">{formatTimestamp(message.timestamp)}</span>
            {message.edited && <span className="text-xs text-discord-text-secondary">(edited)</span>}
          </div>
          
          <div className="text-discord-text-primary">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    return (
                      <code
                        className={`${className || ''} ${inline 
                          ? 'bg-discord-tertiary px-1 rounded text-sm' 
                          : 'block bg-discord-tertiary p-3 rounded-lg'
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  img({ node, ...props }: any) {
                    return <img className="rounded-lg max-w-[400px] max-h-[300px]" {...props} />;
                  },
                  a({ node, ...props }: any) {
                    return <a className="text-discord-link hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                  },
                  table({ node, ...props }: any) {
                    return (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-discord-tertiary" {...props} />
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 grid gap-2">
              {message.attachments.map((attachment) => (
                attachment.type?.startsWith('image/') ? (
                  <img
                    key={attachment.id}
                    src={attachment.url}
                    alt={attachment.name}
                    className="rounded-lg max-w-[400px]"
                  />
                ) : (
                  <div key={attachment.id} className="flex items-center gap-3 bg-discord-secondary p-3 rounded-lg border border-discord-tertiary max-w-sm">
                    <span className="text-2xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{attachment.name}</div>
                      <div className="text-xs text-discord-text-secondary">{(attachment.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button className="text-discord-link hover:underline text-sm flex-shrink-0">Download</button>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-all duration-150
                    ${reaction.hasReacted 
                      ? 'bg-discord-reaction-active border border-discord-primary' 
                      : 'bg-discord-reaction hover:bg-discord-reaction-hover border border-transparent'
                    }`}
                  title={reaction.users?.join(', ')}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-discord-text-secondary text-xs font-medium">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Actions (Hover) */}
        {showActions && (
          <div className="absolute -top-4 right-4 bg-discord-primary border border-discord-tertiary rounded-lg shadow-lg flex items-center">
            <button
              className="p-2 hover:bg-discord-secondary rounded transition-colors text-discord-text-secondary hover:text-white"
              title="Add Reaction"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {message.author.id === currentUser?.id && (
              <>
                <button
                  onClick={() => setEditingMessage(message)}
                  className="p-2 hover:bg-discord-secondary rounded transition-colors text-discord-text-secondary hover:text-white"
                  title="Edit Message"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteMessage(message.channelId, message.id)}
                  className="p-2 hover:bg-discord-danger/20 rounded transition-colors text-discord-danger"
                  title="Delete Message"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={() => setReplyingTo(message)}
              className="p-2 hover:bg-discord-secondary rounded transition-colors text-discord-text-secondary hover:text-white"
              title="Reply"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageItem);