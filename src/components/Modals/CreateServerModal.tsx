import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { api } from '../../services/api';

interface CreateServerModalProps {
  onClose: () => void;
}

const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addServer, setCurrentServer, currentUser } = useAppStore();

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      let server: any;

      // 尝试调用API
      try {
        const result = await api.createServer({ name: name.trim() });
        server = result.server;
      } catch (apiError: any) {
        // API不可用时，创建本地服务器（离线模式）
        console.log('API unavailable, creating local server:', apiError.message);
        const now = Date.now();
        server = {
          id: String(now),
          _id: String(now),
          name: name.trim(),
          icon: '',
          ownerId: currentUser?.id || '1',
          description: '',
          channels: [
            {
              id: String(now) + '-ch1',
              name: 'general',
              type: 'text' as const,
              category: 'Text Channels',
              topic: 'General discussion',
            },
            {
              id: String(now) + '-ch2',
              name: 'General',
              type: 'voice' as const,
              category: 'Voice Channels',
            },
          ],
          roles: [
            {
              id: '@everyone',
              name: '@everyone',
              color: '#99aab5',
              permissions: [],
              position: 0,
              hoist: false,
              mentionable: false,
            },
          ],
          members: [
            {
              user: currentUser || {
                id: '1',
                username: 'DemoUser',
                discriminator: '0001',
                avatar: '',
                status: 'online' as const,
              },
              roles: ['@everyone'],
              joinedAt: Date.now(),
            },
          ],
        };
      }

      if (server) {
        addServer(server);
        setCurrentServer(server._id || server.id);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '创建服务器失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim() && !loading) {
      handleCreate();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]"
      onClick={onClose}
    >
      <div
        className="bg-discord-primary rounded-lg w-[440px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">创建你的服务器</h2>
          <p className="text-discord-text-secondary text-sm">
            你的服务器是你和朋友们聚集的地方。
            <br />
            创建你的服务器，开始聊天。
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-discord-text-secondary uppercase tracking-wide mb-2">
              服务器名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="给你的服务器起个名字"
              className="w-full bg-discord-tertiary text-white px-3 py-2.5 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              autoFocus
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs text-discord-text-secondary mt-2">
              通过创建一个服务器开始，你可以随时更改名称。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-discord-secondary px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-discord-text-secondary hover:text-white text-sm font-medium transition-colors"
            disabled={loading}
          >
            返回
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="px-8 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                创建中...
              </>
            ) : (
              '创建服务器'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;