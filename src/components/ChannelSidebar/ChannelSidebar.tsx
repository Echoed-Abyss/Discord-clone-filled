// src/components/ChannelSidebar/ChannelSidebar.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../../store';
import { Channel, Category } from '../../types';

const ChannelSidebar: React.FC = () => {
  const { servers, currentServerId, currentChannelId, setCurrentChannel, toggleServerSettings } = useAppStore();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; channelId: string } | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const currentServer = useMemo(() => 
    servers.find(s => s.id === currentServerId),
    [servers, currentServerId]
  );

  // 按分类组织频道
  const categorizedChannels = useMemo(() => {
    if (!currentServer?.channels) return [];
    
    const categories: Category[] = [];
    let uncategorized: Channel[] = [];

    currentServer.channels.forEach(channel => {
      if (channel.category) {
        let category = categories.find(c => c.name === channel.category);
        if (!category) {
          category = { 
            id: `cat-${channel.category}`, 
            name: channel.category, 
            collapsed: false,
            channels: [] 
          };
          categories.push(category);
        }
        category.channels.push(channel);
      } else {
        uncategorized.push(channel);
      }
    });

    return { categories, uncategorized };
  }, [currentServer]);

  const toggleCategory = useCallback((categoryId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, channelId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, channelId });
  }, []);

  const handleChannelClick = useCallback((channelId: string) => {
    setCurrentChannel(channelId);
  }, [setCurrentChannel]);

  // 计算未读消息数（示例）
  const getUnreadCount = (channelId: string) => {
    // 这里可以接入真实数据
    return channelId === '1' ? 5 : 0;
  };

  if (!currentServer) return null;

  return (
    <div className="flex flex-col h-full bg-discord-secondary">
      {/* Server Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-discord-tertiary shadow-sm">
        <h2 className="text-white font-semibold truncate">{currentServer.name}</h2>
        <button 
          onClick={toggleServerSettings}
          className="text-discord-text-secondary hover:text-discord-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-discord-tertiary scrollbar-track-transparent">
        <div className="p-2 space-y-4">
          {/* Uncategorized Channels */}
          {categorizedChannels.uncategorized.map(channel => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isSelected={currentChannelId === channel.id}
              unreadCount={getUnreadCount(channel.id)}
              onClick={() => handleChannelClick(channel.id)}
              onContextMenu={(e) => handleContextMenu(e, channel.id)}
            />
          ))}

          {/* Categorized Channels */}
          {categorizedChannels.categories.map(category => {
            const isCollapsed = collapsedCategories.has(category.id);
            
            return (
              <div key={category.id} className="space-y-0.5">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center w-full px-2 py-1 text-xs font-semibold text-discord-text-secondary uppercase tracking-wider hover:text-discord-text-primary transition-colors"
                >
                  <svg 
                    className={`w-3 h-3 mr-1 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {category.name}
                </button>
                
                {!isCollapsed && category.channels.map(channel => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={currentChannelId === channel.id}
                    unreadCount={getUnreadCount(channel.id)}
                    onClick={() => handleChannelClick(channel.id)}
                    onContextMenu={(e) => handleContextMenu(e, channel.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Channel/Category Buttons */}
      <div className="p-2 border-t border-discord-tertiary space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-discord-text-secondary">创建频道</span>
          <div className="flex gap-1">
            <button
              onClick={() => setShowCreateChannel(true)}
              className="text-discord-text-secondary hover:text-discord-text-primary transition-colors p-1 rounded hover:bg-discord-hover"
              title="创建频道"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setShowCreateCategory(true)}
              className="text-discord-text-secondary hover:text-discord-text-primary transition-colors p-1 rounded hover:bg-discord-hover"
              title="创建分类"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ChannelContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          channelId={contextMenu.channelId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <CreateChannelModal
          serverId={currentServer.id}
          categories={categorizedChannels.categories}
          onClose={() => setShowCreateChannel(false)}
        />
      )}

      {/* Create Category Modal */}
      {showCreateCategory && (
        <CreateCategoryModal
          serverId={currentServer.id}
          onClose={() => setShowCreateCategory(false)}
        />
      )}
    </div>
  );
};

// 频道项组件
interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, isSelected, unreadCount, onClick, onContextMenu }) => {
  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'voice':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'forum':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors group
        ${isSelected 
          ? 'bg-discord-hover text-white' 
          : 'text-discord-text-secondary hover:bg-discord-hover hover:text-discord-text-primary'
        }`}
    >
      {getChannelIcon(channel.type)}
      <span className="flex-1 truncate text-left">{channel.name}</span>
      
      {channel.isNSFW && (
        <span className="text-xs bg-discord-danger text-white px-1 rounded font-bold flex-shrink-0">NSFW</span>
      )}
      
      {unreadCount && unreadCount > 0 && (
        <span className="bg-discord-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Channel Settings Quick Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Open channel settings
        }}
        className="opacity-0 group-hover:opacity-100 text-discord-text-secondary hover:text-white transition-all"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>
    </button>
  );
};

// 频道右键菜单
interface ChannelContextMenuProps {
  x: number;
  y: number;
  channelId: string;
  onClose: () => void;
}

const ChannelContextMenu: React.FC<ChannelContextMenuProps> = ({ x, y, channelId, onClose }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { label: '标记为已读', icon: '✓', action: () => {} },
    { label: '邀请成员', icon: '👥', action: () => {} },
    { label: '频道设置', icon: '⚙️', action: () => {} },
    { label: '复制链接', icon: '🔗', action: () => {} },
    { type: 'separator' as const },
    { label: '创建频道', icon: '➕', action: () => {} },
    { label: '创建分类', icon: '📁', action: () => {} },
    { type: 'separator' as const },
    { label: '静音频道', icon: '🔇', action: () => {}, danger: true },
    { label: '离开频道', icon: '🚪', action: () => {}, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed bg-discord-primary border border-discord-tertiary rounded-lg shadow-2xl w-56 py-2 z-50"
    >
      {menuItems.map((item, index) => {
        if ('type' in item && item.type === 'separator') {
          return <div key={index} className="my-1 border-t border-discord-tertiary" />;
        }
        return (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm transition-colors
              ${item.danger 
                ? 'text-discord-danger hover:bg-discord-danger hover:text-white' 
                : 'text-discord-text-secondary hover:bg-discord-primary hover:text-white'
              }`}
          >
            <span className="w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// 创建频道模态框
interface CreateChannelModalProps {
  serverId: string;
  categories: Category[];
  onClose: () => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ serverId, categories, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Channel['type']>('text');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isNSFW, setIsNSFW] = useState(false);

  const handleCreate = () => {
    // 创建频道的逻辑
    console.log('Creating channel:', { name, type, category, isPrivate, isNSFW });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-discord-primary rounded-lg w-[440px]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-discord-tertiary">
          <h3 className="text-lg font-bold text-white">创建频道</h3>
          <p className="text-sm text-discord-text-secondary mt-1">在 {categories[0]?.name || 'Text Channels'} 中</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Channel Type */}
          <div>
            <label className="block text-xs font-semibold text-discord-muted uppercase mb-2">频道类型</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'text' as const, icon: '#', label: '文字' },
                { type: 'voice' as const, icon: '🔊', label: '语音' },
                { type: 'announcement' as const, icon: '📢', label: '公告' },
                { type: 'forum' as const, icon: '💬', label: '论坛' },
              ].map(option => (
                <button
                  key={option.type}
                  onClick={() => setType(option.type)}
                  className={`p-3 rounded border-2 transition-all text-left
                    ${type === option.type 
                      ? 'border-discord-primary bg-discord-secondary' 
                      : 'border-transparent bg-discord-tertiary hover:bg-discord-secondary'
                    }`}
                >
                  <div className="text-lg">{option.icon}</div>
                  <div className="text-sm font-medium text-white mt-1">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-xs font-semibold text-discord-muted uppercase mb-2">频道名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="new-channel"
              className="w-full bg-discord-tertiary text-white px-3 py-2 rounded border border-transparent focus:border-discord-primary focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-discord-muted uppercase mb-2">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-discord-tertiary text-white px-3 py-2 rounded border border-transparent focus:border-discord-primary focus:outline-none"
            >
              <option value="">无分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Private & NSFW Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-medium text-white">私人频道</div>
                <div className="text-xs text-discord-text-secondary">只有特定角色才能查看</div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-discord-primary' : 'bg-discord-tertiary'}`}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="sr-only"
                />
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${isPrivate ? 'right-1' : 'left-1'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-medium text-white">NSFW 频道</div>
                <div className="text-xs text-discord-text-secondary">包含成人内容</div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${isNSFW ? 'bg-discord-danger' : 'bg-discord-tertiary'}`}>
                <input
                  type="checkbox"
                  checked={isNSFW}
                  onChange={(e) => setIsNSFW(e.target.checked)}
                  className="sr-only"
                />
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${isNSFW ? 'right-1' : 'left-1'}`} />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-discord-tertiary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-6 py-2 bg-discord-primary text-white rounded text-sm font-medium hover:bg-discord-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建频道
          </button>
        </div>
      </div>
    </div>
  );
};

// 创建分类模态框
interface CreateCategoryModalProps {
  serverId: string;
  onClose: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    // 创建分类的逻辑
    console.log('Creating category:', { name, isPrivate });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-discord-primary rounded-lg w-[440px]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-discord-tertiary">
          <h3 className="text-lg font-bold text-white">创建分类</h3>
          <p className="text-sm text-discord-text-secondary mt-1">
            分类用于组织您的频道
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-discord-muted uppercase mb-2">分类名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="新分类"
              className="w-full bg-discord-tertiary text-white px-3 py-2 rounded border border-transparent focus:border-discord-primary focus:outline-none"
            />
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-white">私人分类</div>
              <div className="text-xs text-discord-text-secondary">只有特定角色才能查看</div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-discord-primary' : 'bg-discord-tertiary'}`}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only"
              />
              <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${isPrivate ? 'right-1' : 'left-1'}`} />
            </div>
          </label>
        </div>

        <div className="p-4 border-t border-discord-tertiary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-6 py-2 bg-discord-primary text-white rounded text-sm font-medium hover:bg-discord-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建分类
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;