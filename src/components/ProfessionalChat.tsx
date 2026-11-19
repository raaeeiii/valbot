import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PanelLeft,
  SquarePen,
  Sparkles, 
  Trash2, 
  Download, 
  Bot, 
  Code2, 
  PenTool, 
  GraduationCap,
  Terminal,
  Flame,
  Wrench 
} from 'lucide-react';
import { 
  useChatStore, 
  type Message, 
  type AIPersona, 
  PERSONA_CONFIGS, 
  toValidDate 
} from '../store/chatStore';
import { MessageComponent } from './MessageComponent.simple';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { AIService, AIServiceError, QUOTA_EXHAUSTED_MESSAGE, type ChatApiMessage } from '../services/aiService';

interface ProfessionalChatProps {
  darkMode?: boolean;
  onOpenMobileSidebar?: () => void;
}

const SuggestionCard = ({ 
  icon, 
  title, 
  desc, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ y: -3, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border flex flex-col justify-start transition-all bg-white/[0.04] border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.07] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] cursor-pointer"
  >
    <div className="flex items-center space-x-2 sm:space-x-2.5 mb-1 sm:mb-2 text-white">
      <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
        {icon}
      </div>
      <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-cyan-200 transition-colors truncate">
        {title}
      </span>
    </div>
    <div className="text-[11px] sm:text-xs leading-snug sm:leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-1 sm:line-clamp-2">
      {desc}
    </div>
  </motion.button>
);

export const ProfessionalChat: React.FC<ProfessionalChatProps> = ({ 
  darkMode = true,
  onOpenMobileSidebar
}) => {
  const {
    getCurrentMessages,
    getCurrentSession,
    addMessage,
    removeMessage,
    truncateAndEditMessage,
    clearMessages,
    getUIState,
    setIsTyping,
    settings,
    activePersona,
    setActivePersona,
    createSession,
    messages: allStoreMessages
  } = useChatStore();

  const messages = getCurrentMessages();
  const currentSession = getCurrentSession();
  const uiState = getUIState();
  const reducedMotion = settings.reducedMotion;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, uiState.isTyping]);

  // Clean up any ongoing request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const executeChatRequest = async (
    targetSessionId: string, 
    conversationPayload: ChatApiMessage[]
  ) => {
    setIsTyping(true);
    abortControllerRef.current = new AbortController();

    // Combine active persona prompt with custom settings system prompt & response style
    const personaPrompt = PERSONA_CONFIGS[activePersona]?.systemPrompt || '';
    let responseStyleInstruction = '';
    if (settings.responseStyle === 'concise') {
      responseStyleInstruction = 'Response style instruction: Provide concise, direct, and bulleted answers. Avoid filler or lengthy prologues.';
    } else if (settings.responseStyle === 'detailed') {
      responseStyleInstruction = 'Response style instruction: Provide thorough, in-depth explanations with step-by-step clarity.';
    } else if (settings.responseStyle === 'balanced') {
      responseStyleInstruction = 'Response style instruction: Provide well-balanced, clear, and structured answers.';
    }

    const combinedSystemPrompt = [
      personaPrompt, 
      settings.systemPrompt?.trim(),
      responseStyleInstruction
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const reply = await AIService.sendMessage(
        conversationPayload, 
        combinedSystemPrompt, 
        abortControllerRef.current.signal,
        settings.model
      );

      addMessage(targetSessionId, {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        metadata: {
          tokens: AIService.estimateTokens(reply),
          cost: AIService.estimateCost(reply),
          model: settings.model || 'google/gemma-4-31b-it:free'
        }
      });
    } catch (error: unknown) {
      if (error instanceof AIServiceError && error.code === 'ABORTED') {
        // Stopped cleanly by user - no error banner
        return;
      }

      console.error('Failed to send message:', error);

      if (error instanceof AIServiceError && error.code === 'QUOTA_EXHAUSTED') {
        addMessage(targetSessionId, {
          role: 'assistant',
          content: QUOTA_EXHAUSTED_MESSAGE,
          timestamp: new Date(),
          metadata: { isError: true, errorCode: 'QUOTA_EXHAUSTED' }
        });
      } else if (error instanceof AIServiceError && error.code === 'RATE_LIMITED') {
        addMessage(targetSessionId, {
          role: 'assistant',
          content: "I'm receiving too many requests right now. Please wait a moment and try again.",
          timestamp: new Date(),
          metadata: { isError: true, errorCode: 'RATE_LIMITED' }
        });
      } else {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
        addMessage(targetSessionId, {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          metadata: { isError: true, errorCode: 'UNKNOWN' }
        });
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession || !content.trim()) return;

    const targetSessionId = currentSession.id;
    const cleanContent = content.trim();

    // Snapshot previous history for this session BEFORE adding new message
    const previousSessionMessages = allStoreMessages[targetSessionId] || [];

    // Add user message to target session
    addMessage(targetSessionId, {
      role: 'user',
      content: cleanContent,
      timestamp: new Date()
    });

    // Prepare payload
    const conversationPayload: ChatApiMessage[] = [
      ...previousSessionMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
      {
        role: 'user',
        content: cleanContent
      }
    ];

    await executeChatRequest(targetSessionId, conversationPayload);
  };

  // User Inline Edit & Resubmit Action
  const handleEditUserMessage = async (messageId: string, newContent: string) => {
    if (!currentSession) return;
    const targetSessionId = currentSession.id;

    // Truncate messages in store after the edited message
    const remainingMessages = truncateAndEditMessage(targetSessionId, messageId, newContent);

    // Prepare payload up to the edited user message
    const conversationPayload: ChatApiMessage[] = remainingMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    await executeChatRequest(targetSessionId, conversationPayload);
  };

  // Assistant Regenerate Action
  const handleRegenerate = async (assistantMessageId: string) => {
    if (!currentSession) return;
    const targetSessionId = currentSession.id;
    const sessionMessages = allStoreMessages[targetSessionId] || [];

    // Remove the assistant message
    removeMessage(targetSessionId, assistantMessageId);

    // Payload: all messages before this assistant response
    const targetIdx = sessionMessages.findIndex(m => m.id === assistantMessageId);
    const messagesBefore = targetIdx !== -1 ? sessionMessages.slice(0, targetIdx) : sessionMessages;

    const conversationPayload: ChatApiMessage[] = messagesBefore
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    if (conversationPayload.length > 0) {
      await executeChatRequest(targetSessionId, conversationPayload);
    }
  };

  // Gemini Modify Response Action (Shorter, Longer, Simpler, More Professional)
  const handleModifyResponse = async (instruction: string) => {
    await handleSendMessage(instruction);
  };

  // Export Chat to Markdown
  const handleExportChat = () => {
    if (!currentSession || messages.length === 0) return;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let markdownDoc = `# ValBot Conversation: ${currentSession.title}\n`;
    markdownDoc += `*Exported on ${formattedDate} via ValBot AI Workspace*\n\n`;
    markdownDoc += `---\n\n`;

    messages.forEach((msg) => {
      const timeStr = toValidDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (msg.role === 'user') {
        markdownDoc += `### 👤 User (${timeStr})\n\n${msg.content}\n\n`;
      } else {
        markdownDoc += `### 🤖 ValBot (${timeStr})\n\n${msg.content}\n\n`;
      }
      markdownDoc += `---\n\n`;
    });

    const blob = new Blob([markdownDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanFilename = currentSession.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    a.href = url;
    a.download = `${cleanFilename}_valbot_chat.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showWelcome = messages.length === 0;

  const personas: { id: AIPersona; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'coder', label: 'Coder', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'writer', label: 'Writer', icon: <PenTool className="w-3.5 h-3.5" /> },
    { id: 'tutor', label: 'Tutor', icon: <GraduationCap className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="flex flex-col h-full relative z-10 w-full overflow-hidden bg-transparent">
      {/* Header bar */}
      <header className="w-full flex-none sticky top-0 z-30 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/5 bg-[#0e081e]/85 backdrop-blur-xl">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button 
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all shrink-0"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar menu"
          >
            <PanelLeft className="w-4 h-4 text-cyan-400" />
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5 shrink-0 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-400/20">
              <img src="/logo.png" alt="ValBot" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center space-x-1.5 min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-white tracking-wide truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">
                {showWelcome ? 'ValBot' : (currentSession?.title || 'ValBot')}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-semibold shrink-0">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Header Center / Right: Persona Selector + Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Quick New Chat Button (Mobile only) */}
          <button
            type="button"
            onClick={() => createSession()}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 active:scale-95 transition-all shadow-sm shrink-0"
            title="Start fresh chat"
            aria-label="New chat"
          >
            <SquarePen className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Persona Pills (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10">
            {personas.map((p) => {
              const isSelected = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePersona(p.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={PERSONA_CONFIGS[p.id].description}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Export Chat Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
              title="Export chat as Markdown (.md)"
              aria-label="Export chat"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Clear Messages Action */}
          {messages.length > 0 && currentSession && (
            <button
              onClick={() => {
                if (window.confirm('Clear all messages in this chat?')) {
                  clearMessages(currentSession.id);
                }
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center gap-1.5"
              title="Clear messages in current chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Persona Switcher Bar */}
      <div className="sm:hidden flex items-center justify-center space-x-1 px-3 py-1 bg-[#0e081e]/60 border-b border-white/5">
        {personas.map((p) => {
          const isSelected = activePersona === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePersona(p.id)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages / Welcome Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-3 sm:px-8 pb-32 sm:pb-36 pt-2 sm:pt-4">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-start sm:justify-center min-h-full max-w-4xl mx-auto pt-3 sm:pt-0 pb-6 sm:py-8"
            >
              <div className="text-center mb-4 sm:mb-10 max-w-2xl px-2">
                {/* Branded ValBot Animated Logo Orb with Breathing Glow */}
                <motion.div
                  animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-6 rounded-2xl sm:rounded-3xl flex items-center justify-center relative p-1 mt-1 sm:mt-0"
                >
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 blur-[15px] sm:blur-[20px] opacity-60 animate-pulse" />
                  <div className="absolute inset-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#130d29] to-[#0a0515] border border-cyan-400/30" />
                  <img 
                    src="/logo.png" 
                    alt="ValBot Logo" 
                    className="w-8 h-8 sm:w-14 sm:h-14 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]" 
                  />
                </motion.div>
                
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 tracking-tight text-white">
                  Ready to create something new?
                </h2>
                
                <p className="text-xs sm:text-base text-slate-300 max-w-[290px] sm:max-w-xl mx-auto leading-relaxed">
                  Multi-model AI workspace powered by Google &amp; Meta. Build code, brainstorm, or test ideas at lightning speed.
                </p>
              </div>

              {/* 4 Interactive Suggestion Cards (Compact 2x2 on Mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 w-full">
                <SuggestionCard 
                  icon={<Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  title="Build an App" 
                  desc="Design a modern React component with sleek dark UI"
                  onClick={() => handleSendMessage("Create a sleek, modern glassmorphic dashboard card component in React and Tailwind CSS with smooth hover animations.")}
                />
                <SuggestionCard 
                  icon={<Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  title="Explain Simply" 
                  desc="How do AI models & quantum computers actually work?"
                  onClick={() => handleSendMessage("Explain how large language models and quantum computers actually work using a fun, mind-blowing real-world analogy.")}
                />
                <SuggestionCard 
                  icon={<Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  title="Roast or Pitch" 
                  desc="Give witty, brutally honest feedback on my startup idea"
                  onClick={() => handleSendMessage("Act as a witty Silicon Valley tech critic. Ask me for my app or business idea, then give me a fun roast followed by 3 genius ways to make it succeed.")}
                />
                <SuggestionCard 
                  icon={<Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  title="Solve & Debug" 
                  desc="Crack a tricky coding problem or logic puzzle fast"
                  onClick={() => handleSendMessage("Give me a fun, interactive 3-line coding riddle in JavaScript or Python, and wait for my guess before revealing the trick!")}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto pt-2 space-y-5 sm:space-y-6"
            >
              {messages.map((message: Message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  darkMode={darkMode}
                  animationDelay={0}
                  onEditUserMessage={handleEditUserMessage}
                  onRegenerate={handleRegenerate}
                  onModifyResponse={handleModifyResponse}
                />
              ))}
              
              {uiState.isTyping && (
                <div className="pb-2">
                  <TypingIndicator darkMode={darkMode} />
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Composer Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            isGenerating={uiState.isTyping}
            onStopGenerating={handleStopGenerating}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};
