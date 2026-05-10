// src/components/EmojiPicker/EmojiPicker.tsx
import React, { useState, useMemo, useCallback } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJIS = {
  recent: ['👍', '❤️', '😂', '🎉', '🔥', '😊', '👋', '🙏'],
  people: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛'],
  nature: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🍀', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍂', '🍁', '🍄', '🐚', '🌎'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎿', '🛷', '🥌'],
  objects: ['💻', '🖥️', '⌨️', '🖱️', '🖲️', '💾', '💿', '📀', '📱', '📲', '☎️', '📞', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'],
};

const CATEGORIES = [
  { id: 'recent', icon: '🕐', label: '最近使用' },
  { id: 'people', icon: '😊', label: '人物' },
  { id: 'nature', icon: '🌿', label: '自然' },
  { id: 'food', icon: '🍔', label: '食物' },
  { id: 'activities', icon: '⚽', label: '活动' },
  { id: 'objects', icon: '💡', label: '物品' },
  { id: 'symbols', icon: '💜', label: '符号' },
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return EMOJIS[activeCategory as keyof typeof EMOJIS] || [];

    // Search across all categories
    const allEmojis = Object.values(EMOJIS).flat();
    return allEmojis.filter(emoji => {
      // Basic search - in real app, you'd use emoji names
      return true; // Simplified for demo
    }).slice(0, 30);
  }, [activeCategory, searchQuery]);

  const handleSelect = useCallback((emoji: string) => {
    onEmojiSelect(emoji);
  }, [onEmojiSelect]);

  const emojiRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={emojiRef}
      className="bg-discord-secondary border border-discord-tertiary rounded-lg shadow-2xl w-[320px] overflow-hidden"
    >
      {/* Search */}
      <div className="p-2 border-b border-discord-tertiary">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索表情..."
          className="w-full bg-discord-tertiary text-white text-sm px-3 py-1.5 rounded focus:outline-none placeholder-discord-text-secondary"
        />
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex border-b border-discord-tertiary bg-discord-tertiary">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 p-2 text-center transition-colors relative ${
                activeCategory === category.id
                  ? 'text-white'
                  : 'text-discord-text-secondary hover:text-white'
              }`}
              title={category.label}
            >
              <span className="text-base">{category.icon}</span>
              {activeCategory === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-discord-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="h-[200px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-discord-tertiary">
        <div className="grid grid-cols-7 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleSelect(emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              className="w-9 h-9 flex items-center justify-center rounded hover:bg-discord-hover transition-colors text-xl"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="flex items-center justify-center h-full text-discord-text-secondary text-sm">
            未找到匹配的表情
          </div>
        )}
      </div>

      {/* Emoji Preview */}
      {hoveredEmoji && (
        <div className="border-t border-discord-tertiary p-2 flex items-center gap-3">
          <span className="text-3xl">{hoveredEmoji}</span>
          <div>
            <div className="text-sm font-medium text-white">:emoji_name:</div>
            <div className="text-xs text-discord-text-secondary">表情预览</div>
          </div>
        </div>
      )}

      {/* Custom Emoji Section */}
      <div className="border-t border-discord-tertiary p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-discord-text-secondary uppercase">
            服务器表情
          </span>
          <button className="text-xs text-discord-link hover:underline">管理</button>
        </div>
        <div className="grid grid-cols-8 gap-1 mt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-discord-tertiary rounded-full flex items-center justify-center text-xs text-discord-text-secondary"
            >
              ?
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;