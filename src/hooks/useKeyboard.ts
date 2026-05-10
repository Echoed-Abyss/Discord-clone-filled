import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
}

export const useKeyboard = (bindings: KeyBinding[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      bindings.forEach(({ key, ctrl, shift, alt, handler }) => {
        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          (!ctrl || e.ctrlKey || e.metaKey) &&
          (!shift || e.shiftKey) &&
          (!alt || e.altKey)
        ) {
          e.preventDefault();
          handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bindings]);
};