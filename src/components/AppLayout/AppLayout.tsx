import React, { useState } from 'react';
import { useAppStore } from '../../store';
import ServerList from '../ServerList/ServerList';
import ChannelSidebar from '../ChannelSidebar/ChannelSidebar';
import ChatArea from '../ChatArea/ChatArea';
import MemberList from '../MemberList/MemberList';
import UserSettings from '../UserSettings/UserSettings';
import ServerSettings from '../ServerSettings/ServerSettings';
import ChannelSettings from '../ChannelSettings/ChannelSettings';
import VoiceChannel from '../VoiceChannel/VoiceChannel';
import UserInfoBar from '../UserInfoBar/UserInfoBar';
import SearchBar from '../SearchBar/SearchBar';
import Inbox from '../Inbox/Inbox';
import CreateServerModal from '../Modals/CreateServerModal';
import JoinServerModal from '../Modals/JoinServerModal';

const AppLayout: React.FC = () => {
  const { showUserSettings, showServerSettings, showChannelSettings, showMemberList, currentServerId, currentUser } = useAppStore();
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);

  return (
    <div className="flex h-screen bg-discord-primary text-discord-text-primary overflow-hidden">
      {/* Server List Sidebar */}
      <div className="w-[72px] flex-shrink-0 bg-discord-tertiary flex flex-col">
        {/* 用户头像在服务器列表顶部 */}
        {currentUser && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="relative group cursor-pointer" onClick={() => useAppStore.getState().toggleUserSettings()}>
              <img
                src={currentUser.avatar || '/api/placeholder/48/48'}
                alt={currentUser.username}
                className="w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-[3px] border-discord-tertiary" />
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1.5 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                用户设置
              </div>
            </div>
          </div>
        )}

        <div className="w-8 h-[2px] bg-discord-hover rounded-full mx-auto mb-2" />

        {/* 服务器列表 */}
        <div className="flex-1 overflow-y-auto">
          <ServerList
            onCreateServer={() => setShowCreateServer(true)}
            onJoinServer={() => setShowJoinServer(true)}
          />
        </div>

        {/* 收件箱在服务器列表底部 */}
        <div className="pb-2 flex justify-center">
          <Inbox />
        </div>
      </div>

      {/* Channel Sidebar */}
      {currentServerId ? (
        <div className="w-60 flex-shrink-0 bg-discord-secondary flex flex-col">
          <div className="h-12 flex items-center justify-between px-4 border-b border-discord-tertiary shadow-sm">
            <h2 className="text-white font-semibold truncate">Demo Server</h2>
            <div className="flex items-center gap-1">
              <SearchBar />
            </div>
          </div>
          <ChannelSidebar />
          <VoiceChannel />
          <UserInfoBar />
        </div>
      ) : (
        <div className="w-60 flex-shrink-0 bg-discord-secondary flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">没有服务器</h3>
              <p className="text-discord-text-secondary text-sm mb-4">加入或创建一个服务器开始聊天</p>
              <button
                onClick={() => setShowCreateServer(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors mb-2 w-full"
              >
                创建服务器
              </button>
              <button
                onClick={() => setShowJoinServer(true)}
                className="px-4 py-2 bg-discord-green text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors w-full"
              >
                加入服务器
              </button>
            </div>
          </div>
          <UserInfoBar />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-discord-primary">
        {currentServerId ? (
          <ChatArea />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">欢迎使用 Discord Clone</h1>
              <p className="text-discord-text-secondary">选择一个服务器开始聊天</p>
            </div>
          </div>
        )}
      </div>

      {/* Member List */}
      {showMemberList && currentServerId && (
        <div className="w-60 flex-shrink-0 bg-discord-secondary">
          <MemberList />
        </div>
      )}

      {/* Modals */}
      {showUserSettings && <UserSettings />}
      {showServerSettings && <ServerSettings />}
      {showChannelSettings && <ChannelSettings />}
      {showCreateServer && <CreateServerModal onClose={() => setShowCreateServer(false)} />}
      {showJoinServer && <JoinServerModal onClose={() => setShowJoinServer(false)} />}
    </div>
  );
};

export default AppLayout;