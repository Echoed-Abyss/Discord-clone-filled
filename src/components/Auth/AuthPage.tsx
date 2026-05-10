import React, { useState } from 'react';
import { useAppStore } from '../../store';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading, error, setError } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err: any) {
      // 错误已在store中处理
    }
  };

  return (
    <div className="fixed inset-0 bg-discord-primary flex items-center justify-center z-50">
      <div className="w-[480px] bg-discord-secondary rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? '欢迎回来' : '创建账号'}
          </h1>
          <p className="text-discord-text-secondary text-sm">
            {isLogin ? '我们很高兴再次见到你！' : '加入我们的社区！'}
          </p>
        </div>

        {error && (
          <div className="bg-discord-danger/10 border border-discord-danger text-discord-danger rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-discord-text-secondary uppercase mb-1.5">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-discord-tertiary text-white px-3 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary transition-all"
                placeholder="输入用户名"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-discord-text-secondary uppercase mb-1.5">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-discord-tertiary text-white px-3 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary transition-all"
              placeholder="输入邮箱地址"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-discord-text-secondary uppercase mb-1.5">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-discord-tertiary text-white px-3 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary transition-all"
              placeholder="输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-discord-primary hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-discord-text-secondary text-sm">
            {isLogin ? '还没有账号？' : '已有账号？'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-discord-link text-sm hover:underline ml-1"
          >
            {isLogin ? '注册' : '登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;