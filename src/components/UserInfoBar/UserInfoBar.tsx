// src/components/UserInfoBar/UserInfoBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';

const UserInfoBar: React.FC = () => {
  const { currentUser, toggleUserSettings } = useAppStore();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const statusOptions = [
    { 
      id: 'online', 
      label: '在线', 
      icon: '🟢', 
      color: 'bg-green-500',
      description: '在线'
    },
    { 
      id: 'idle', 
      label: '空闲', 
      icon: '🌙', 
      color: 'bg-yellow-500',
      description: '空闲'
    },
    { 
      id: 'dnd', 
      label: '勿扰', 
      icon: '⛔', 
      color: 'bg-red-500',
      description: '请勿打扰'
    },
    { 
      id: 'invisible', 
      label: '隐身', 
      icon: '👻', 
      color: 'bg-gray-500',
      description: '显示为离线'
    },
  ];

  const currentStatus = statusOptions.find(s => s.id === currentUser.status) || statusOptions[0];

  return (
    <div className="bg-discord-secondary/80 p-2 flex items-center gap-2">
      {/* Avatar & Status */}
      <div className="relative group cursor-pointer" onClick={() => setShowStatusMenu(!showStatusMenu)}>
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
          className="w-8 h-8 rounded-full"
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] border-discord-secondary ${currentStatus.color}`} />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={toggleUserSettings}>
        <div className="text-sm font-medium text-white truncate">
          {currentUser.username}
        </div>
        <div className="text-xs text-discord-text-secondary truncate">
          {currentUser.customStatus || `#${currentUser.discriminator}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded transition-colors ${
            isMuted 
              ? 'bg-discord-danger text-white' 
              : 'text-discord-text-secondary hover:bg-discord-hover hover:text-white'
          }`}
          title={isMuted ? '取消静音' : '静音'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>

        <button
          onClick={() => setIsDeafened(!isDeafened)}
          className={`p-1.5 rounded transition-colors ${
            isDeafened 
              ? 'bg-discord-danger text-white' 
              : 'text-discord-text-secondary hover:bg-discord-hover hover:text-white'
          }`}
          title={isDeafened ? '取消静音扬声器' : '静音扬声器'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5c-1.657 0-3 .895-3 2s1.343 2 3 2c.52 0 1.023-.105 1.5-.3" />
          </svg>
        </button>

        <button
          onClick={toggleUserSettings}
          className="p-1.5 rounded transition-colors text-discord-text-secondary hover:bg-discord-hover hover:text-white"
          title="用户设置"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Status Menu */}
      {showStatusMenu && (
        <div
          ref={statusMenuRef}
          className="absolute bottom-12 left-2 bg-discord-primary border border-discord-tertiary rounded-lg shadow-xl w-64 py-2 z-50"
        >
          <div className="px-3 py-2">
            <span className="text-xs font-semibold text-discord-text-secondary uppercase">
              设置状态
            </span>
          </div>
          {statusOptions.map(status => (
            <button
              key={status.id}
              onClick={() => {
                // Update user status
                if (currentUser) {
                  useAppStore.getState().updateUser({
                    ...currentUser,
                    status: status.id as any,
                  });
                }
                setShowStatusMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm transition-colors ${
                currentUser.status === status.id
                  ? 'bg-discord-hover text-white'
                  : 'text-discord-text-secondary hover:bg-discord-hover hover:text-white'
              }`}
            >
              <span className="text-lg">{status.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{status.label}</div>
                <div className="text-xs text-discord-text-secondary">{status.description}</div>
              </div>
              {currentUser.status === status.id && (
                <svg className="w-5 h-5 text-discord-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
          
          <div className="border-t border-discord-tertiary mt-2 pt-2">
            <button className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-discord-text-secondary hover:bg-discord-hover hover:text-white transition-colors">
              <span className="text-lg">📝</span>
              <span>设置自定义状态</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoBar;