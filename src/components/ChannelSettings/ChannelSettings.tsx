// src/components/ChannelSettings/ChannelSettings.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Channel } from '../../types';

const ChannelSettings: React.FC = () => {
  const { servers, currentServerId, currentChannelId, updateChannel, toggleChannelSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [channelName, setChannelName] = useState('');
  const [channelTopic, setChannelTopic] = useState('');
  const [slowMode, setSlowMode] = useState(0);
  const [isNSFW, setIsNSFW] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentServer = useMemo(() => 
    servers.find(s => s.id === currentServerId),
    [servers, currentServerId]
  );

  const currentChannel = useMemo(() => 
    currentServer?.channels.find(c => c.id === currentChannelId),
    [currentServer, currentChannelId]
  );

  useEffect(() => {
    if (currentChannel) {
      setChannelName(currentChannel.name);
      setChannelTopic(currentChannel.topic || '');
      setSlowMode(currentChannel.slowMode || 0);
      setIsNSFW(currentChannel.isNSFW || false);
    }
  }, [currentChannel]);

  const tabs = [
    { id: 'overview', label: '概览', icon: '📋' },
    { id: 'permissions', label: '权限', icon: '🔐' },
    { id: 'invites', label: '邀请', icon: '🎟️' },
    { id: 'integrations', label: '集成', icon: '🔌' },
    { id: 'webhooks', label: 'Webhooks', icon: '🪝' },
    { id: 'delete', label: '删除频道', icon: '⚠️', danger: true },
  ];

  const handleSave = () => {
    if (currentChannel) {
      updateChannel({
        ...currentChannel,
        name: channelName,
        topic: channelTopic,
        slowMode,
        isNSFW,
      });
    }
  };

  const handleDeleteChannel = () => {
    console.log('Deleting channel:', currentChannelId);
    toggleChannelSettings();
  };

  if (!currentChannel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-discord-primary rounded-lg w-[800px] h-[560px] flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-52 bg-discord-secondary p-4 flex flex-col">
          <div className="flex items-center gap-2 px-2 mb-4">
            <span className="text-discord-text-secondary font-bold text-xl">#</span>
            <h2 className="text-sm font-semibold text-white truncate">{currentChannel.name}</h2>
          </div>

          <div className="flex-1 space-y-0.5">
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
          <div className="px-6 py-4 border-b border-discord-tertiary flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-discord-text-secondary mt-1">
                #{currentChannel.name} · {currentChannel.type === 'text' ? '文字频道' : 
                  currentChannel.type === 'voice' ? '语音频道' : 
                  currentChannel.type === 'announcement' ? '公告频道' : '论坛频道'}
              </p>
            </div>
            <button
              onClick={toggleChannelSettings}
              className="text-discord-text-secondary hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-3xl">
                {/* Channel Name */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">频道名称</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-discord-text-secondary font-bold">#</span>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="flex-1 bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary"
                    />
                  </div>
                </div>

                {/* Channel Topic */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">频道主题</h3>
                  <textarea
                    value={channelTopic}
                    onChange={(e) => setChannelTopic(e.target.value)}
                    rows={3}
                    className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary resize-none"
                    placeholder="让成员知道此频道的用途..."
                  />
                  <p className="text-xs text-discord-text-secondary mt-1">
                    使用此空间来描述此频道。这将显示在频道列表的顶部。
                  </p>
                </div>

                {/* Channel Type (read-only) */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">频道类型</h3>
                  <div className="bg-discord-secondary rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {currentChannel.type === 'voice' ? '🔊' : 
                         currentChannel.type === 'announcement' ? '📢' : 
                         currentChannel.type === 'forum' ? '💬' : '#'}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {currentChannel.type === 'voice' ? '语音频道' : 
                           currentChannel.type === 'announcement' ? '公告频道' : 
                           currentChannel.type === 'forum' ? '论坛频道' : '文字频道'}
                        </div>
                        <div className="text-xs text-discord-text-secondary">
                          {currentChannel.type === 'voice' ? '用于语音通信' : 
                           currentChannel.type === 'announcement' ? '用于发布重要公告' : 
                           currentChannel.type === 'forum' ? '用于话题讨论' : '用于文字消息'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slow Mode */}
                <div>
                  <h3 className="text-sm font-semibold text-discord-text-primary mb-3">慢速模式</h3>
                  <p className="text-sm text-discord-text-secondary mb-3">
                    成员发送消息的最小时间间隔。设置为 0 以禁用。
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="21600"
                      step="5"
                      value={slowMode}
                      onChange={(e) => setSlowMode(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-white w-32 text-right">
                      {slowMode === 0 ? '关闭' :
                       slowMode < 60 ? `${slowMode}秒` :
                       slowMode < 3600 ? `${Math.floor(slowMode / 60)}分钟` :
                       `${Math.floor(slowMode / 3600)}小时`}
                    </span>
                  </div>
                </div>

                {/* NSFW Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-white">年龄限制频道</div>
                      <div className="text-xs text-discord-text-secondary">
                        将此频道标记为包含成人内容
                      </div>
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

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-discord-tertiary">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-discord-primary text-white rounded font-medium hover:bg-discord-primary-hover transition-colors"
                  >
                    保存更改
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">频道权限</h2>
                  <p className="text-sm text-discord-text-secondary mb-6">
                    自定义此频道的权限。这些权限将覆盖服务器角色默认权限。
                  </p>

                  <div className="space-y-4">
                    <div className="bg-discord-secondary rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">角色/成员</h3>
                      <button className="w-full bg-discord-tertiary text-discord-text-secondary text-sm px-3 py-2 rounded text-left hover:bg-discord-hover transition-colors">
                        + 添加角色或成员
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white">基本权限</h3>
                      {[
                        { name: '查看频道', permission: 'VIEW_CHANNEL', description: '允许成员查看此频道' },
                        { name: '管理频道', permission: 'MANAGE_CHANNELS', description: '允许成员编辑、删除此频道' },
                        { name: '发送消息', permission: 'SEND_MESSAGES', description: '允许成员在此频道发送消息' },
                        { name: '嵌入链接', permission: 'EMBED_LINKS', description: '允许成员发送嵌入链接' },
                        { name: '附加文件', permission: 'ATTACH_FILES', description: '允许成员上传文件' },
                      ].map(perm => (
                        <div key={perm.permission} className="flex items-center justify-between py-2 border-b border-discord-tertiary last:border-0">
                          <div>
                            <div className="text-sm text-white">{perm.name}</div>
                            <div className="text-xs text-discord-text-secondary">{perm.description}</div>
                          </div>
                          <div className="w-10 h-6 rounded-full bg-discord-primary relative cursor-pointer">
                            <div className="absolute w-4 h-4 bg-white rounded-full top-1 right-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delete' && showDeleteConfirm && (
              <div className="max-w-lg">
                <div className="bg-discord-danger/10 border border-discord-danger rounded-lg p-6">
                  <h3 className="text-lg font-bold text-discord-danger mb-2">删除 '#{currentChannel.name}'</h3>
                  <p className="text-discord-text-secondary mb-4">
                    您确定要删除此频道吗？此操作不可逆，所有消息将被永久删除。
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteChannel}
                      className="px-6 py-2 bg-discord-danger text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      删除频道
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

export default ChannelSettings;