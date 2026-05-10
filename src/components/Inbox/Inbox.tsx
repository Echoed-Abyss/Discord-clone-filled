import React, { useState, useEffect, useRef } from 'react';

const Inbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inboxRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={inboxRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded transition-colors ${isOpen ? 'bg-discord-hover text-white' : 'text-discord-text-secondary hover:text-white hover:bg-discord-hover'}`}
        title="收件箱"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-discord-danger rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</span>
      </button>

      {isOpen && (
        <div className="fixed md:absolute right-4 md:right-0 left-4 md:left-auto top-16 md:top-auto md:bottom-14 md:mt-2 w-auto md:w-[420px] bg-discord-primary border border-discord-tertiary rounded-lg shadow-2xl z-[100]">
          {/* Header */}
          <div className="p-4 border-b border-discord-tertiary flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">收件箱</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-discord-text-secondary hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-discord-tertiary">
            {['所有', '提及', '未读'].map(tab => (
              <button
                key={tab}
                className="flex-1 py-2.5 text-sm font-medium text-white hover:bg-discord-hover transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="max-h-[400px] overflow-y-auto">
            {[
              { from: 'Friend1', content: 'Hey @DemoUser, check this out!', time: '5分钟前', read: false, server: 'Demo Server', channel: 'general' },
              { from: 'Friend2', content: 'Are you coming to the game tonight?', time: '30分钟前', read: false, server: 'Gaming', channel: 'lobby' },
              { from: 'System', content: 'Welcome to Discord Clone!', time: '1天前', read: true },
            ].map((notification, idx) => (
              <div
                key={idx}
                className={`p-4 hover:bg-discord-hover transition-colors cursor-pointer border-b border-discord-tertiary last:border-0 ${
                  !notification.read ? 'bg-[#5865f2]/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {notification.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{notification.from}</span>
                      <span className="text-xs text-discord-text-secondary whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-sm text-discord-text-secondary mt-0.5 truncate">{notification.content}</p>
                    {notification.server && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-discord-text-secondary">{notification.server}</span>
                        <span className="text-xs text-discord-text-secondary">•</span>
                        <span className="text-xs text-discord-text-secondary">#{notification.channel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-discord-tertiary text-center">
            <button className="text-sm text-discord-link hover:underline">查看所有通知</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;