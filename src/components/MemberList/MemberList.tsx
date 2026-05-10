// src/components/MemberList/MemberList.tsx
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { ServerMember } from '../../types';

const MemberList: React.FC = () => {
  const { servers, currentServerId, currentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOfflineMembers, setShowOfflineMembers] = useState(false);

  const currentServer = useMemo(() => 
    servers.find(s => s.id === currentServerId),
    [servers, currentServerId]
  );

  // Group members by role
  const groupedMembers = useMemo(() => {
    if (!currentServer) return [];

    const groups: { roleName: string; roleColor: string; members: ServerMember[] }[] = [];
    const unassigned: ServerMember[] = [];

    // Add @everyone group
    const everyone = currentServer.members?.filter(m => {
      if (!searchQuery) return true;
      return m.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (m.nickname?.toLowerCase().includes(searchQuery.toLowerCase()));
    }) || [];

    // Filter by online status
    const filteredMembers = showOfflineMembers 
      ? everyone 
      : everyone.filter(m => m.user.status !== 'offline');

    // Separate offline members
    const onlineMembers = filteredMembers.filter(m => m.user.status !== 'offline');
    const offlineMembers = filteredMembers.filter(m => m.user.status === 'offline');

    // Group online members by hoisted roles
    const hoistedRoles = currentServer.roles?.filter(r => r.hoist).sort((a, b) => b.position - a.position) || [];
    
    hoistedRoles.forEach(role => {
      const membersInRole = onlineMembers.filter(m => m.roles.includes(role.id));
      if (membersInRole.length > 0) {
        groups.push({
          roleName: role.name,
          roleColor: role.color,
          members: membersInRole,
        });
        // Remove from online members array
        membersInRole.forEach(m => {
          const index = onlineMembers.indexOf(m);
          if (index > -1) onlineMembers.splice(index, 1);
        });
      }
    });

    // Add remaining online members to @everyone
    if (onlineMembers.length > 0) {
      groups.unshift({
        roleName: '在线',
        roleColor: '#8e9297',
        members: onlineMembers,
      });
    }

    // Add offline members at the bottom
    if (showOfflineMembers && offlineMembers.length > 0) {
      groups.push({
        roleName: '离线',
        roleColor: '#747f8d',
        members: offlineMembers,
      });
    }

    return groups;
  }, [currentServer, searchQuery, showOfflineMembers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'idle': return '空闲';
      case 'dnd': return '勿扰';
      case 'offline': return '离线';
      default: return '未知';
    }
  };

  if (!currentServer) return null;

  return (
    <div className="flex flex-col h-full bg-discord-secondary">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-discord-tertiary">
        <h3 className="text-sm font-semibold text-discord-text-secondary">
          成员 — {currentServer.members?.length || 0}
        </h3>
        <button className="text-discord-text-secondary hover:text-discord-text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索成员"
            className="w-full bg-discord-tertiary text-discord-text-primary text-sm px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary placeholder-discord-text-secondary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-discord-text-secondary hover:text-discord-text-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-discord-tertiary scrollbar-track-transparent">
        {groupedMembers.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <div className="px-3 py-2 flex items-center justify-between">
              <span 
                className="text-xs font-semibold uppercase"
                style={{ color: group.roleColor }}
              >
                {group.roleName} — {group.members.length}
              </span>
            </div>
            
            <div className="space-y-0.5">
              {group.members.map(member => (
                <MemberItem
                  key={member.user.id}
                  member={member}
                  serverOwnerId={currentServer.ownerId}
                  currentUserId={currentUser?.id}
                  statusColor={getStatusColor(member.user.status)}
                  statusText={getStatusText(member.user.status)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Offline Members */}
      <div className="p-2 border-t border-discord-tertiary">
        <button
          onClick={() => setShowOfflineMembers(!showOfflineMembers)}
          className="w-full text-left px-2 py-1 text-sm text-discord-text-secondary hover:text-discord-text-primary hover:bg-discord-hover rounded transition-colors flex items-center gap-2"
        >
          <svg 
            className={`w-3 h-3 transition-transform ${showOfflineMembers ? 'rotate-90' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          离线成员 — {currentServer.members?.filter(m => m.user.status === 'offline').length || 0}
        </button>
      </div>
    </div>
  );
};

// 单个成员项
interface MemberItemProps {
  member: ServerMember;
  serverOwnerId: string;
  currentUserId?: string;
  statusColor: string;
  statusText: string;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, serverOwnerId, currentUserId, statusColor, statusText }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [contextMenu, setContextMenu] = useState(false);

  const isOwner = member.user.id === serverOwnerId;
  const isCurrentUser = member.user.id === currentUserId;

  return (
    <div
      className="relative flex items-center gap-3 px-2 py-1.5 mx-2 rounded hover:bg-discord-hover cursor-pointer group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu(!contextMenu);
      }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={member.user.avatar}
          alt={member.user.username}
          className="w-8 h-8 rounded-full"
        />
        <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-discord-secondary`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-discord-text-primary truncate"
                style={{ color: isOwner ? '#faa81a' : undefined }}>
            {member.nickname || member.user.username}
          </span>
          {isOwner && (
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {member.user.status === 'dnd' && (
            <span className="text-xs text-discord-danger font-medium flex-shrink-0">勿扰</span>
          )}
        </div>
        {member.user.status !== 'online' && (
          <div className="text-xs text-discord-text-secondary">{statusText}</div>
        )}
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-discord-tertiary rounded transition-colors" title="发送消息">
          <svg className="w-4 h-4 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        {!isCurrentUser && (
          <button className="p-1 hover:bg-discord-tertiary rounded transition-colors" title="更多选项">
            <svg className="w-4 h-4 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !contextMenu && (
        <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 bg-black text-white text-sm rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          <div className="font-medium">{member.nickname || member.user.username}</div>
          {member.nickname && (
            <div className="text-discord-text-secondary text-xs">{member.user.username}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 ${statusColor} rounded-full`} />
            <span className="text-xs">{statusText}</span>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <MemberContextMenu
          member={member}
          onClose={() => setContextMenu(false)}
        />
      )}
    </div>
  );
};

// 成员右键菜单
interface MemberContextMenuProps {
  member: ServerMember;
  onClose: () => void;
}

const MemberContextMenu: React.FC<MemberContextMenuProps> = ({ member, onClose }) => {
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
    { label: '查看资料', icon: '👤', action: () => {} },
    { label: '发送消息', icon: '💬', action: () => {} },
    { label: '语音通话', icon: '📞', action: () => {} },
    { type: 'separator' as const },
    { label: '提及', icon: '@', action: () => {} },
    { label: '添加备注', icon: '📝', action: () => {} },
    { type: 'separator' as const },
    { label: '踢出', icon: '🚫', action: () => {}, danger: true },
    { label: '封禁', icon: '🔨', action: () => {}, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-0 bg-discord-primary border border-discord-tertiary rounded-lg shadow-xl w-56 py-2 z-50"
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
                : 'text-discord-text-secondary hover:bg-discord-hover hover:text-white'
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

export default MemberList;