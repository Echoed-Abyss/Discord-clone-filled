import React, { useState } from 'react';
import { useAppStore } from '../../store';

const JoinServerModal: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const { joinServer, toggleJoinServer, isLoading } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    await joinServer(inviteCode);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={toggleJoinServer}>
      <div className="bg-discord-primary rounded-lg w-[440px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">加入服务器</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-discord-text-secondary uppercase mb-1.5">
                邀请码
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="w-full bg-discord-tertiary text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
                placeholder="输入邀请码"
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={toggleJoinServer}
                className="px-4 py-2 text-sm text-discord-text-secondary hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!inviteCode.trim() || isLoading}
                className="px-6 py-2 bg-discord-green text-white rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? '加入中...' : '加入'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinServerModal;