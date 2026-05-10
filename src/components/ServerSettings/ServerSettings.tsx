// src/components/ServerSettings/ServerSettings.tsx
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';

const ServerSettings: React.FC = () => {
  const { servers, currentServerId, currentUser, updateServer, toggleServerSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentServer = useMemo(() => 
    servers.find(s => s.id === currentServerId),
    [servers, currentServerId]
  );

  React.useEffect(() => {
    if (currentServer) {
      setServerName(currentServer.name);
      setServerDescription(currentServer.description || '');
    }
  }, [currentServer]);

  const tabs = [
    { id: 'overview', label: '概览', icon: '📋' },
    { id: 'roles', label: '角色', icon: '🎭' },
    { id: 'emojis', label: '表情', icon: '😀' },
    { id: 'stickers', label: '贴纸', icon: '🏷️' },
    { id: 'integrations', label: '集成', icon: '🔌' },
    { id: 'moderation', label: '管理', icon: '🛡️' },
    { id: 'audit-log', label: '审核日志', icon: '📝' },
    { id: 'members', label: '成员', icon: '👥' },
    { id: 'invites', label: '邀请', icon: '🎟️' },
    { id: 'templates', label: '模板', icon: '📄' },
    { id: 'vanity', label: '自定义URL', icon: '🔗' },
    { id: 'delete', label: '删除服务器', icon: '⚠️', danger: true },
  ];

  const handleSave = () => {
    if (currentServer) {
      updateServer({
        ...currentServer,
        name: serverName,
        description: serverDescription,
      });
    }
  };

  const handleDeleteServer = () => {
    // 删除服务器的逻辑
    console.log('删除服务器:', currentServerId);
    toggleServerSettings();
  };

  if (!currentServer) return null;

  const isOwner = currentServer.ownerId === currentUser?.id;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-discord-primary rounded-lg w-[960px] h-[640px] flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-56 bg-discord-secondary p-4 flex flex-col">
          <div className="flex items-center gap-2 px-2 mb-4">
            <img src={currentServer.icon} alt="" className="w-6 h-6 rounded-full" />
            <h2 className="text-sm font-semibold text-white truncate">{currentServer.name}</h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="搜索设置..."
              className="w-full bg-discord-tertiary text-discord-text-primary text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary"
            />
          </div>

          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'delete') setShowDeleteConfirm(true);
                }}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'bg-discord-hover text-white'
                    : tab.danger
                    ? 'text-discord-danger hover:bg-discord-danger hover:text-white'
                    : 'text-discord-text-secondary hover:bg-discord-hover hover:text-white'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-discord-tertiary flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <button
              onClick={toggleServerSettings}
              className="text-discord-text-secondary hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-3xl">
                {/* Server Name */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">服务器名称</h3>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary"
                    disabled={!isOwner}
                  />
                </div>

                {/* Server Description */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">服务器描述</h3>
                  <textarea
                    value={serverDescription}
                    onChange={(e) => setServerDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary resize-none"
                    placeholder="为您的服务器添加描述..."
                    disabled={!isOwner}
                  />
                </div>

                {/* Server Icon */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">服务器图标</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                      <img
                        src={currentServer.icon}
                        alt="Server Icon"
                        className="w-24 h-24 rounded-full border-4 border-discord-tertiary"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm text-center">
                          更改<br/>图标
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-discord-text-secondary">
                      <p>推荐大小：512x512</p>
                      <p>支持 PNG、JPEG 和 GIF</p>
                    </div>
                  </div>
                </div>

                {/* System Channel */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">系统消息频道</h3>
                  <select className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary">
                    <option value="">选择一个频道</option>
                    {currentServer.channels
                      .filter(c => c.type === 'text')
                      .map(channel => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-discord-text-secondary mt-1">
                    系统消息（如成员加入通知）将发送到此频道
                  </p>
                </div>

                {/* Current Owner */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">服务器所有者</h3>
                  <div className="flex items-center gap-3 bg-discord-secondary rounded-lg p-3">
                    <img
                      src={currentServer.members?.find(m => m.user.id === currentServer.ownerId)?.user.avatar || '/api/placeholder/40/40'}
                      alt="Owner"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {currentServer.members?.find(m => m.user.id === currentServer.ownerId)?.user.username || 'Unknown'}
                      </div>
                      <div className="text-xs text-discord-text-secondary">服务器创建者</div>
                    </div>
                    {isOwner && (
                      <button className="ml-auto px-3 py-1 bg-discord-primary text-white text-sm rounded hover:bg-discord-primary-hover transition-colors">
                        转移所有权
                      </button>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                {isOwner && (
                  <div className="flex justify-end pt-4 border-t border-discord-tertiary">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-discord-primary text-white rounded font-medium hover:bg-discord-primary-hover transition-colors"
                    >
                      保存更改
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">角色</h2>
                    <p className="text-sm text-discord-text-secondary mt-1">
                      使用角色管理您的服务器成员和权限
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-discord-primary text-white rounded text-sm font-medium hover:bg-discord-primary-hover transition-colors">
                    创建角色
                  </button>
                </div>

                <div className="space-y-2">
                  {currentServer.roles?.sort((a, b) => b.position - a.position).map(role => (
                    <div
                      key={role.id}
                      className="flex items-center gap-3 bg-discord-secondary rounded-lg p-3 hover:bg-discord-hover transition-colors cursor-pointer"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: role.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">@{role.name}</div>
                        <div className="text-xs text-discord-text-secondary">
                          {role.memberCount || 0} 成员
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {role.hoist && (
                          <span className="text-xs bg-discord-tertiary px-2 py-0.5 rounded text-discord-text-secondary">
                            独立显示
                          </span>
                        )}
                        <svg className="w-5 h-5 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    成员 — {currentServer.members?.length || 0}
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索成员..."
                      className="bg-discord-tertiary text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary w-48"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  {currentServer.members?.map(member => (
                    <div
                      key={member.user.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-discord-hover transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={member.user.avatar}
                          alt={member.user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-secondary
                          ${member.user.status === 'online' ? 'bg-green-500' :
                            member.user.status === 'idle' ? 'bg-yellow-500' :
                            member.user.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {member.nickname || member.user.username}
                          </span>
                          {member.nickname && (
                            <span className="text-xs text-discord-text-secondary">
                              {member.user.username}
                            </span>
                          )}
                          {member.user.id === currentServer.ownerId && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                              所有者
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {member.roles.map(roleId => {
                            const role = currentServer.roles?.find(r => r.id === roleId);
                            return role && role.name !== '@everyone' ? (
                              <div
                                key={roleId}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: role.color }}
                                />
                                <span className="text-xs text-discord-text-secondary">
                                  {role.name}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-discord-tertiary rounded transition-colors text-discord-text-secondary hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'delete' && showDeleteConfirm && (
              <div className="max-w-lg">
                <div className="bg-discord-danger/10 border border-discord-danger rounded-lg p-6">
                  <h3 className="text-lg font-bold text-discord-danger mb-2">删除 '{currentServer.name}'</h3>
                  <p className="text-discord-text-secondary mb-4">
                    您确定要删除此服务器吗？此操作不可逆，所有数据将被永久删除。
                  </p>
                  <div className="bg-discord-secondary rounded p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img src={currentServer.icon} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-white">{currentServer.name}</div>
                        <div className="text-xs text-discord-text-secondary">
                          {currentServer.members?.length || 0} 成员 · {currentServer.channels.length} 频道
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-discord-text-secondary mb-2">
                      请输入服务器名称以确认删除：
                    </label>
                    <input
                      type="text"
                      placeholder={currentServer.name}
                      className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-danger"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteServer}
                      className="px-6 py-2 bg-discord-danger text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      删除服务器
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;