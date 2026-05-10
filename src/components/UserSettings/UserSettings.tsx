import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store';

const UserSettings: React.FC = () => {
  const { currentUser, updateUser, toggleUserSettings } = useAppStore();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarPreview(result);
        setAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        username,
        bio,
        avatar: avatarPreview,
      });
      toggleUserSettings();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={toggleUserSettings}>
      <div className="bg-discord-primary rounded-lg w-[600px] max-h-[80vh] flex overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Sidebar */}
        <div className="w-48 bg-discord-secondary p-4 flex-shrink-0">
          <h3 className="text-xs font-semibold text-discord-text-secondary uppercase mb-4">用户设置</h3>
          <button className="w-full text-left px-2 py-1.5 rounded text-sm text-discord-text-primary bg-discord-hover">
            👤 我的账户
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-6">我的账户</h2>
          
          {/* Avatar Section */}
          <div className="bg-discord-secondary rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={avatarPreview || currentUser.avatar || 'https://ui-avatars.com/api/?name=User&size=80'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">更换</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div>
                <h3 className="text-white font-semibold">{currentUser.username}</h3>
                <button 
                  onClick={handleAvatarClick}
                  className="text-discord-link text-sm hover:underline"
                >
                  上传头像
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-discord-text-secondary uppercase mb-1 block font-semibold">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary"
              />
            </div>
            <div>
              <label className="text-xs text-discord-text-secondary uppercase mb-1 block font-semibold">关于我</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-discord-primary resize-none"
                placeholder="介绍一下你自己..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-discord-tertiary">
              <button
                onClick={toggleUserSettings}
                className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 transition-colors"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;