export const parseMarkdownLinks = (text: string): string => {
  // Convert Discord-style mentions
  return text
    .replace(/<@!?(\d+)>/g, '@user')
    .replace(/<#(\d+)>/g, '#channel')
    .replace(/<@&(\d+)>/g, '@role');
};

export const highlightCode = (code: string, language?: string): string => {
  // In a real app, use highlight.js or prism.js
  return code;
};