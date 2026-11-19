import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from './Icons';
import { useChatStore, type Message } from '../store/chatStore';

interface MessageComponentProps {
  message: Message;
  isLatest?: boolean;
  darkMode?: boolean;
  isStreaming?: boolean;
  animationDelay?: number;
}

// Simple markdown-like text formatter
const formatText = (text: string) => {
  // Convert **bold** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert `code` to <code>
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>');
  
  // Convert ### Headers
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>');
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Convert bullet points
  formatted = formatted.replace(/^• (.*$)/gm, '<li class="ml-4">$1</li>');
  
  return formatted;
};

export const MessageComponent: React.FC<MessageComponentProps> = ({ 
  message, 
  isLatest = false,
  darkMode = false,
  isStreaming = false,
  animationDelay = 0
}) => {
  const [copied, setCopied] = useState(false);
  const { getUIState } = useChatStore();
  const uiState = getUIState();
  const isDark = darkMode || uiState.darkMode;

  // Suppress unused parameter warning
  void isLatest;
  void animationDelay;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const isUser = message.role === 'user';
  const messageIsStreaming = isStreaming && isLatest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
          }`}
        >
          <span className="text-lg">
            {isUser ? '🧑‍💻' : '🤖'}
          </span>
        </motion.div>

        {/* Message Bubble */}
        <div className={`relative group`}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`relative px-4 py-3 rounded-2xl shadow-md max-w-md ${
              isUser
                ? isDark
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-100 border border-gray-600'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
            } ${
              isUser 
                ? 'rounded-br-md ml-2' 
                : 'rounded-bl-md mr-2'
            }`}
          >
            {/* Message Content */}
            <div 
              className={`prose prose-sm max-w-none leading-relaxed ${
                isUser 
                  ? 'prose-invert' 
                  : isDark 
                    ? 'prose-invert prose-gray' 
                    : 'prose-gray'
              }`}
              dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
            />

            {/* Streaming indicator */}
            {messageIsStreaming && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block ml-1 w-2 h-4 bg-current opacity-75"
              />
            )}

            {/* Copy button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-full shadow-lg ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 border'
              }`}
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </motion.button>
          </motion.div>

          {/* Timestamp */}
          <div className={`text-xs mt-2 px-2 ${
            isUser ? 'text-right' : 'text-left'
          } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
