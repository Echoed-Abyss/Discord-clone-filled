// src/components/SearchBar/SearchBar.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SearchResult {
  id: string;
  type: 'message' | 'channel' | 'user' | 'file';
  title: string;
  subtitle?: string;
  timestamp?: number;
  channelName?: string;
}

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('any');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest'>('relevance');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Simulated search results
    if (query.trim()) {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'message',
          title: 'Hello everyone! How are you doing?',
          subtitle: 'Friend1',
          timestamp: Date.now() - 1800000,
          channelName: 'general',
        },
        {
          id: '2',
          type: 'message',
          title: 'Welcome to the **general** channel!',
          subtitle: 'DemoUser',
          timestamp: Date.now() - 3600000,
          channelName: 'general',
        },
        {
          id: '3',
          type: 'channel',
          title: '#general',
          subtitle: 'Text channel for general discussion',
        },
        {
          id: '4',
          type: 'user',
          title: 'Friend1',
          subtitle: 'Online',
        },
        {
          id: '5',
          type: 'file',
          title: 'screenshot.png',
          subtitle: '2.3 MB - Uploaded by DemoUser',
          timestamp: Date.now() - 7200000,
          channelName: 'general',
        },
      ].filter(result => {
        const searchLower = query.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchLower) ||
          (result.subtitle?.toLowerCase().includes(searchLower)) ||
          (result.channelName?.toLowerCase().includes(searchLower))
        );
      });

      setResults(mockResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [results, selectedIndex]);

  const handleSelectResult = (result: SearchResult) => {
    console.log('Selected:', result);
    setIsOpen(false);
    setQuery('');
  };

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'messages', label: '消息' },
    { id: 'channels', label: '频道' },
    { id: 'users', label: '用户' },
    { id: 'files', label: '文件' },
  ];

  const dateFilters = [
    { id: 'any', label: '任何时间' },
    { id: 'today', label: '今天' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
  ];

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'message':
        return (
          <svg className="w-5 h-5 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'channel':
        return (
          <svg className="w-5 h-5 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'file':
        return (
          <svg className="w-5 h-5 text-discord-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Quick Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-discord-tertiary text-discord-text-secondary text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:text-discord-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>搜索</span>
        <div className="flex items-center gap-1 ml-auto">
          <kbd className="px-1.5 py-0.5 text-xs bg-discord-secondary rounded">Ctrl</kbd>
          <kbd className="px-1.5 py-0.5 text-xs bg-discord-secondary rounded">K</kbd>
        </div>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setIsOpen(false)}>
          <div
            ref={searchRef}
            className="bg-discord-primary rounded-lg w-[600px] max-h-[520px] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-4">
              <div className="flex items-center gap-3 bg-discord-tertiary rounded-lg px-3 py-2">
                <svg className="w-5 h-5 text-discord-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索消息、频道、用户..."
                  className="flex-1 bg-transparent text-white placeholder-discord-text-secondary focus:outline-none text-sm"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-discord-text-secondary hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 pb-2 border-b border-discord-tertiary">
              <div className="flex items-center gap-4">
                {/* Type Filters */}
                <div className="flex items-center gap-1">
                  {filters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        activeFilter === filter.id
                          ? 'bg-discord-primary text-white'
                          : 'text-discord-text-secondary hover:text-white hover:bg-discord-secondary'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-discord-tertiary" />

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-discord-text-secondary">排序：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-sm text-discord-text-secondary focus:outline-none"
                  >
                    <option value="relevance">相关</option>
                    <option value="newest">最新</option>
                    <option value="oldest">最早</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-discord-tertiary" />

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-discord-text-secondary">时间：</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-sm text-discord-text-secondary focus:outline-none"
                  >
                    {dateFilters.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {query.trim() === '' ? (
                <div className="flex flex-col items-center justify-center py-12 text-discord-text-secondary">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">搜索 Discord</p>
                  <p className="text-sm">输入关键词开始搜索消息、频道、用户和文件</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-discord-text-secondary">
                  <p className="text-lg font-medium mb-2">未找到结果</p>
                  <p className="text-sm">尝试其他搜索词或检查筛选条件</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-discord-text-secondary uppercase">
                    搜索结果 — {results.length}
                  </div>
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-discord-hover'
                          : 'hover:bg-discord-hover'
                      }`}
                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-discord-text-secondary">{result.subtitle}</span>
                            {result.channelName && (
                              <>
                                <span className="text-xs text-discord-text-secondary">•</span>
                                <span className="text-xs text-discord-text-secondary">#{result.channelName}</span>
                              </>
                            )}
                            {result.timestamp && (
                              <>
                                <span className="text-xs text-discord-text-secondary">•</span>
                                <span className="text-xs text-discord-text-secondary">
                                  {new Date(result.timestamp).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-discord-text-secondary px-1.5 py-0.5 bg-discord-tertiary rounded">
                          {result.type === 'message' ? '消息' :
                           result.type === 'channel' ? '频道' :
                           result.type === 'user' ? '用户' : '文件'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-discord-tertiary flex items-center justify-between text-xs text-discord-text-secondary">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-discord-tertiary rounded">↑↓</kbd>
                  <span>导航</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-discord-tertiary rounded">Enter</kbd>
                  <span>选择</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-discord-tertiary rounded">Esc</kbd>
                  <span>关闭</span>
                </div>
              </div>
              <span>Discord 搜索</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;