// src/components/VoiceChannel/VoiceChannel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';

interface VoiceUser {
  id: string;
  username: string;
  avatar: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
}

const VoiceChannel: React.FC = () => {
  const { currentUser, currentChannelId } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  // Simulated voice users
  useEffect(() => {
    if (isConnected) {
      setVoiceUsers([
        {
          id: '1',
          username: currentUser?.username || 'You',
          avatar: currentUser?.avatar || '/api/placeholder/40/40',
          isMuted: false,
          isDeafened: false,
          isSpeaking: true,
          isStreaming: false,
        },
        {
          id: '2',
          username: 'Friend1',
          avatar: '/api/placeholder/40/40',
          isMuted: true,
          isDeafened: false,
          isSpeaking: false,
          isStreaming: false,
        },
        {
          id: '3',
          username: 'Friend2',
          avatar: '/api/placeholder/40/40',
          isMuted: false,
          isDeafened: false,
          isSpeaking: true,
          isStreaming: true,
        },
      ]);
    } else {
      setVoiceUsers([]);
    }
  }, [isConnected, currentUser]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => !prev);
    if (!isDeafened) {
      setIsMuted(true);
    }
  }, [isDeafened]);

  const toggleConnection = useCallback(() => {
    setIsConnected(prev => !prev);
  }, []);

  if (currentChannelId !== '3') return null; // Only show for voice channel

  return (
    <div className="bg-discord-secondary border-t border-discord-tertiary">
      {/* Main Voice Bar */}
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="flex items-center gap-2 text-sm font-medium text-discord-text-primary hover:bg-discord-hover px-2 py-1 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="text-discord-green">Voice Connected</span>
            <span className="text-discord-text-secondary">•</span>
            <span className="text-discord-text-secondary">
              {voiceUsers.length} {voiceUsers.length === 1 ? 'user' : 'users'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              onClick={toggleConnection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-discord-primary text-white rounded text-sm font-medium hover:bg-discord-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              加入语音
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`p-2 rounded transition-colors ${
                  isMuted ? 'bg-discord-danger text-white' : 'text-discord-text-secondary hover:bg-discord-hover'
                }`}
                title={isMuted ? '取消静音' : '静音'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </button>

              <button
                onClick={toggleDeafen}
                className={`p-2 rounded transition-colors ${
                  isDeafened ? 'bg-discord-danger text-white' : 'text-discord-text-secondary hover:bg-discord-hover'
                }`}
                title={isDeafened ? '取消静音扬声器' : '静音扬声器'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5c-1.657 0-3 .895-3 2s1.343 2 3 2c.52 0 1.023-.105 1.5-.3" />
                </svg>
              </button>

              <button
                className="p-2 rounded transition-colors text-discord-text-secondary hover:bg-discord-hover"
                title="用户设置"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                onClick={toggleConnection}
                className="p-2 rounded transition-colors text-discord-danger hover:bg-discord-danger hover:text-white"
                title="断开连接"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Voice User List */}
      {showUserList && isConnected && (
        <div className="border-t border-discord-tertiary bg-discord-primary">
          <div className="p-2 space-y-1">
            {voiceUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-discord-hover transition-colors"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  {user.isSpeaking && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-discord-primary bg-discord-green" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white">
                      {user.username}
                    </span>
                    {user.id === currentUser?.id && (
                      <span className="text-xs text-discord-text-secondary">(你)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {user.isStreaming && (
                    <span className="text-discord-streaming">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {user.isMuted && (
                    <svg className="w-4 h-4 text-discord-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                  {user.isDeafened && (
                    <svg className="w-4 h-4 text-discord-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M6.5 8.5c-1.657 0-3 .895-3 2s1.343 2 3 2c.52 0 1.023-.105 1.5-.3" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Status Indicator */}
      {isConnected && (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-discord-green">
          <div className="w-2 h-2 rounded-full bg-discord-green animate-pulse" />
          <span>Voice Connected</span>
          <span className="text-discord-text-secondary ml-auto">
            {isMuted ? 'Muted' : ''}{isMuted && isDeafened ? ', ' : ''}{isDeafened ? 'Deafened' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceChannel;