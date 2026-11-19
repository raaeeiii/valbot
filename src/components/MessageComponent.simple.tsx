import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, 
  Check, 
  Pencil, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  Sparkles,
  X
} from 'lucide-react';
import { useChatStore, type Message, toValidDate } from '../store/chatStore';

interface MessageComponentProps {
  message: Message;
  darkMode?: boolean;
  isStreaming?: boolean;
  animationDelay?: number;
  onEditUserMessage?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onModifyResponse?: (instruction: string) => void;
}

interface CodeBlockProps {
  language: string;
  value: string;
  wrapLines?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, wrapLines = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d091a]/95 text-slate-200 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-xs font-mono">
        <span className="uppercase tracking-wider text-[11px] font-semibold text-cyan-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-sans text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax highlighted body */}
      <div className="overflow-x-auto text-xs sm:text-sm font-mono">
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '0.875rem 1rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.6',
          }}
          wrapLongLines={wrapLines}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const MessageComponent: React.FC<MessageComponentProps> = ({ 
  message, 
  isStreaming = false,
  animationDelay = 0,
  onEditUserMessage,
  onRegenerate,
  onModifyResponse
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showModifyMenu, setShowModifyMenu] = useState(false);

  const { settings } = useChatStore();
  const reducedMotion = settings.reducedMotion;
  const wrapCodeLines = settings.wrapCodeLines !== false;

  const isUser = message.role === 'user';
  const isError = message.metadata?.isError;

  // Cleanup speech if unmounted
  useEffect(() => {
    return () => {
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSpeechToggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Strip markdown code fences for cleaner speech
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/[#*_`]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSaveEdit = () => {
    const trimmed = editedContent.trim();
    if (!trimmed) return;
    setIsEditing(false);
    if (onEditUserMessage) {
      onEditUserMessage(message.id, trimmed);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const formattedTime = toValidDate(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  /* ---------------------------------------------------- */
  /* USER MESSAGE LAYOUT (Sleek, Proportional Pill)       */
  /* ---------------------------------------------------- */
  if (isUser) {
    return (
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
        transition={{ 
          duration: reducedMotion ? 0 : 0.2,
          ease: 'easeOut',
          delay: animationDelay
        }}
        className="group relative flex flex-col items-end ml-auto w-full max-w-[85%] sm:max-w-[75%]"
      >
        {isEditing ? (
          <div className="w-full min-w-[240px] sm:min-w-[340px] p-3 rounded-2xl bg-[#1a1130] border border-violet-500/40 shadow-xl space-y-2.5">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-black/40 border border-violet-400/40 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none font-sans"
              rows={Math.min(editedContent.split('\n').length + 1, 6)}
              autoFocus
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow transition-colors"
              >
                Save & Resubmit
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Proportional User Bubble: tight fit for short messages like "hey" */}
            <div className="w-fit max-w-[100%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/30">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words select-text font-normal m-0 p-0">
                {message.content}
              </p>
            </div>

            {/* Time & Edit pencil subtly placed outside/below the pill */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400">
              <span>{formattedTime}</span>
              {onEditUserMessage && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-0.5 rounded text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                  title="Edit and resubmit message"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    );
  }

  /* ---------------------------------------------------- */
  /* ASSISTANT MESSAGE LAYOUT (Official Gemini / ChatGPT)  */
  /* ---------------------------------------------------- */
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ 
        duration: reducedMotion ? 0 : 0.22,
        ease: 'easeOut',
        delay: animationDelay
      }}
      className={`group relative w-full flex items-start gap-3 sm:gap-4 transition-all ${
        isError 
          ? 'p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 shadow-sm'
          : 'bg-transparent text-slate-100 p-1'
      }`}
    >
      {/* Bot Avatar aligned at top-left */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-cyan-400/30 shadow-sm overflow-hidden p-1">
        <img src="/logo.png" alt="ValBot" className="w-full h-full object-contain" />
      </div>

      {/* Markdown Content Flowing Directly on Open Canvas */}
      <div className="flex-1 min-w-0">
        <div className={`prose prose-invert max-w-none bg-transparent px-1 py-0.5 text-slate-100 leading-7 text-[15px] break-words ${isStreaming ? 'animate-pulse' : ''}`}>
          <ReactMarkdown
            components={{
              code(props) {
                const { children, className, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                if (match) {
                  return (
                    <CodeBlock 
                      language={match[1]} 
                      value={codeString} 
                      wrapLines={wrapCodeLines}
                    />
                  );
                }
                return (
                  <code
                    className="bg-black/30 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm border border-cyan-500/20"
                    {...rest}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-3 last:mb-0 leading-7 text-slate-100">{children}</p>;
              },
              h1({ children }) {
                return <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2 text-white">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg sm:text-xl font-bold mt-3 mb-2 text-white">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base sm:text-lg font-semibold mt-2.5 mb-1 text-white">{children}</h3>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-slate-200">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 my-2.5 space-y-1.5 text-slate-200">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-7 text-slate-200">{children}</li>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-cyan-500/60 pl-3.5 my-2.5 text-slate-300 italic bg-white/5 py-1.5 rounded-r">
                    {children}
                  </blockquote>
                );
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
                  >
                    {children}
                  </a>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                    <table className="min-w-full divide-y divide-white/10 text-left text-xs sm:text-sm">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return <th className="px-3 py-2 bg-white/10 font-semibold text-white">{children}</th>;
              },
              td({ children }) {
                return <td className="px-3 py-2 border-t border-white/5 text-slate-200">{children}</td>;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action Toolbar directly on dark canvas */}
        {!isError && (
          <div className="mt-2.5 flex items-center gap-1 text-slate-400 pt-1">
            <span className="text-[11px] text-slate-500 mr-2">{formattedTime}</span>

            {/* Copy Response */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy response"
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Text-to-Speech / Read Aloud */}
            <button
              type="button"
              onClick={handleSpeechToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                isSpeaking ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isSpeaking ? 'Stop read aloud' : 'Read message aloud'}
              aria-label="Text to speech"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Regenerate Response */}
            {onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(message.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                title="Regenerate this response"
                aria-label="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Gemini-Style Modify Response Dropdown */}
            {onModifyResponse && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModifyMenu(!showModifyMenu)}
                  className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 text-xs ${
                    showModifyMenu ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                  title="Modify response (Gemini style)"
                  aria-label="Modify response"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>

                <AnimatePresence>
                  {showModifyMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 bottom-8 z-30 w-44 rounded-2xl bg-[#140b28] border border-cyan-500/30 shadow-2xl p-1.5 flex flex-col space-y-1 backdrop-blur-xl"
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center justify-between border-b border-white/5">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Modify Response
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowModifyMenu(false)}
                          className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModifyMenu(false);
                          onModifyResponse("Please make the previous response shorter and more concise.");
                        }}
                        className="px-2.5 py-1.5 text-left text-xs rounded-lg text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                      >
                        ✂️ Shorter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModifyMenu(false);
                          onModifyResponse("Please expand the previous response with more detail, context, and thorough explanations.");
                        }}
                        className="px-2.5 py-1.5 text-left text-xs rounded-lg text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                      >
                        📝 Longer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModifyMenu(false);
                          onModifyResponse("Please simplify the previous response so anyone can understand it easily.");
                        }}
                        className="px-2.5 py-1.5 text-left text-xs rounded-lg text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                      >
                        💡 Simpler
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModifyMenu(false);
                          onModifyResponse("Please rewrite the previous response in a formal, executive, and highly professional business tone.");
                        }}
                        className="px-2.5 py-1.5 text-left text-xs rounded-lg text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                      >
                        👔 More Professional
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
