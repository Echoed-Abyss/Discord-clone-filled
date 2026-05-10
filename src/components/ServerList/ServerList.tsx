import React from 'react';
import { useAppStore } from '../../store';

const ServerList: React.FC = () => {
  const { servers, currentServerId, setCurrentServer, toggleCreateServer, toggleJoinServer, logout } = useAppStore();

  return (
    <div className="flex flex-col items-center pt-3 space-y-2 h-full">
      {/* Home / Direct Messages */}
      <button
        onClick={() => setCurrentServer('')}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white hover:rounded-2xl transition-all duration-200 cursor-pointer mb-2 ${
          !currentServerId ? 'bg-indigo-500' : 'bg-discord-primary hover:bg-indigo-500'
        }`}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </button>

      <div className="w-8 h-[2px] bg-discord-tertiary rounded-full mb-2" />

      {/* Server Icons */}
      {servers.map((server) => {
        const serverId = server._id || server.id || '';
        const isActive = currentServerId === serverId;
        
        return (
          <div key={serverId} className="relative group">
            <button
              onClick={() => setCurrentServer(serverId)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'bg-indigo-500 text-white rounded-2xl' 
                  : 'bg-discord-primary text-discord-green hover:bg-indigo-500 hover:text-white hover:rounded-2xl'
                }`}
            >
              {server.name.charAt(0).toUpperCase()}
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1.5 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {server.name}
            </div>
          </div>
        );
      })}

      {/* Add Server Button */}
      <button
        onClick={toggleCreateServer}
        className="w-12 h-12 rounded-full bg-discord-tertiary flex items-center justify-center text-discord-green hover:bg-discord-green hover:text-white hover:rounded-2xl transition-all duration-200 cursor-pointer group"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1.5 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          创建服务器
        </div>
      </button>

      {/* Join Server Button */}
      <button
        onClick={toggleJoinServer}
        className="w-12 h-12 rounded-full bg-discord-tertiary flex items-center justify-center text-discord-green hover:bg-discord-green hover:text-white hover:rounded-2xl transition-all duration-200 cursor-pointer group"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1.5 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          加入服务器
        </div>
      </button>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="mt-auto mb-4 w-12 h-12 rounded-full bg-discord-tertiary flex items-center justify-center text-discord-danger hover:bg-discord-danger hover:text-white hover:rounded-2xl transition-all duration-200 cursor-pointer group"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default ServerList;