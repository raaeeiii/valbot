import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIPersona = 'general' | 'coder' | 'writer' | 'tutor';

export interface PersonaConfig {
  id: AIPersona;
  label: string;
  tagline: string;
  description: string;
  systemPrompt: string;
}

export const DEFAULT_SYSTEM_PROMPT = `You are ValBot, an elite, highly intelligent AI assistant. Your goal is to provide exceptionally clear, accurate, and insightful answers. 
- Always format your responses beautifully using Markdown (bolding for emphasis, clean bullet points, and proper headers). 
- If asked to write code, provide production-ready, bug-free code with concise explanations. 
- Never use robotic filler phrases like 'As an AI' or 'Here is the answer'. 
- Be conversational, direct, and exceptionally helpful.`;

export const PERSONA_CONFIGS: Record<AIPersona, PersonaConfig> = {
  general: {
    id: 'general',
    label: 'General',
    tagline: 'Helpful ValBot',
    description: 'Versatile and friendly AI assistant for daily tasks',
    systemPrompt: DEFAULT_SYSTEM_PROMPT
  },
  coder: {
    id: 'coder',
    label: 'Coder',
    tagline: 'Senior Engineer',
    description: 'Production-ready code, debugging, and software architecture',
    systemPrompt: 'You are ValBot Coder, an expert senior software engineer and architect. Provide clean, modular, production-ready code with modern best practices, strong type safety, and direct explanations.'
  },
  writer: {
    id: 'writer',
    label: 'Writer',
    tagline: 'Pro Copywriter',
    description: 'Polished copywriting, persuasive drafting, and structural editing',
    systemPrompt: 'You are ValBot Writer, a master copywriter and editor. Craft clear, engaging, beautifully phrased text with impeccable grammar, tone adaptability, and compelling structure.'
  },
  tutor: {
    id: 'tutor',
    label: 'Tutor',
    tagline: 'Step-by-step',
    description: 'Patient teacher breaking down concepts simply using analogies',
    systemPrompt: 'You are ValBot Tutor, an inspiring and patient educator. Explain concepts step by step using relatable analogies and intuitive explanations, breaking down difficult topics simply.'
  }
};

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    tokens?: number;
    cost?: number;
    model?: string;
    isError?: boolean;
    errorCode?: string;
    attachedFiles?: { name: string; size: number }[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

export interface QuickPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  isBuiltIn: boolean;
}

export type ResponseStyle = 'concise' | 'balanced' | 'detailed';

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  streamingEnabled: boolean;
  autoSave: boolean;
  soundEnabled: boolean;
  systemPrompt?: string;
  reducedMotion?: boolean;
  responseStyle?: ResponseStyle;
  wrapCodeLines?: boolean;
}

export interface UIState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  currentView: 'chat' | 'settings' | 'prompts';
  isTyping: boolean;
}

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const toValidDate = (date: Date | string | number | undefined): Date => {
  if (!date) return new Date();
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

interface ChatStore {
  // Sessions
  sessions: ChatSession[];
  currentSessionId: string;
  createSession: (title?: string) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  togglePinSession: (sessionId: string) => void;
  clearAllHistory: () => void;

  // Personas
  activePersona: AIPersona;
  setActivePersona: (persona: AIPersona) => void;

  // Messages
  messages: Record<string, Message[]>;
  addMessage: (sessionId: string, message: Omit<Message, 'id'>) => string;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (sessionId: string, messageId: string) => void;
  truncateAndEditMessage: (sessionId: string, messageId: string, newContent: string) => Message[];
  clearMessages: (sessionId: string) => void;
  
  // Quick Prompts
  quickPrompts: QuickPrompt[];
  addQuickPrompt: (prompt: Omit<QuickPrompt, 'id'>) => void;
  deleteQuickPrompt: (promptId: string) => void;
  
  // Settings
  settings: ChatSettings;
  updateSettings: (updates: Partial<ChatSettings>) => void;
  
  // UI State
  uiState: UIState;
  setDarkMode: (darkMode: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: UIState['currentView']) => void;
  setIsTyping: (isTyping: boolean) => void;
  
  // Getters
  getCurrentMessages: () => Message[];
  getCurrentSession: () => ChatSession | undefined;
  getUIState: () => UIState;
  getSidebarState: () => { collapsed: boolean };
}

// Default quick prompts
const defaultQuickPrompts: QuickPrompt[] = [
  {
    id: '1',
    title: 'Explain Code',
    content: 'Can you explain how this code works?',
    category: 'Development',
    isBuiltIn: true
  },
  {
    id: '2',
    title: 'Write Documentation',
    content: 'Please write comprehensive documentation for this code.',
    category: 'Development',
    isBuiltIn: true
  },
  {
    id: '3',
    title: 'Debug Issue',
    content: "Help me debug this issue. Here's the error:",
    category: 'Development',
    isBuiltIn: true
  },
  {
    id: '4',
    title: 'Optimize Code',
    content: 'How can I optimize this code for better performance?',
    category: 'Development',
    isBuiltIn: true
  }
];

// Default settings
const defaultSettings: ChatSettings = {
  model: 'google/gemma-4-31b-it:free',
  temperature: 0.7,
  maxTokens: 2048,
  streamingEnabled: true,
  autoSave: true,
  soundEnabled: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  reducedMotion: false,
  responseStyle: 'balanced',
  wrapCodeLines: true,
};

// Default UI state
const defaultUIState: UIState = {
  darkMode: true,
  sidebarCollapsed: false,
  currentView: 'chat',
  isTyping: false
};

// Create initial session
const createInitialSession = (): ChatSession => ({
  id: generateId(),
  title: 'New Chat',
  createdAt: new Date(),
  updatedAt: new Date(),
  isPinned: false
});

const initialSession = createInitialSession();

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [initialSession],
      currentSessionId: initialSession.id,
      messages: { [initialSession.id]: [] },
      activePersona: 'general',
      quickPrompts: defaultQuickPrompts,
      settings: defaultSettings,
      uiState: defaultUIState,

      // Persona methods
      setActivePersona: (persona: AIPersona) => {
        set({ activePersona: persona });
      },

      // Session methods
      createSession: (title = 'New Chat') => {
        const { sessions, messages, currentSessionId } = get();
        
        // Prevent creating duplicate empty 'New Chat' sessions
        const currentSession = sessions.find(s => s.id === currentSessionId);
        const currentMessages = messages[currentSessionId] || [];
        if (currentSession?.title === 'New Chat' && currentMessages.length === 0) {
          return;
        }

        const newSession: ChatSession = {
          id: generateId(),
          title,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPinned: false
        };
        
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          messages: { ...state.messages, [newSession.id]: [] }
        }));
      },

      deleteSession: (sessionId: string) => {
        const { sessions, currentSessionId } = get();
        if (sessions.length <= 1) return;
        
        const targetIndex = sessions.findIndex(s => s.id === sessionId);
        const newSessions = sessions.filter(s => s.id !== sessionId);
        
        let newCurrentId = currentSessionId;
        if (currentSessionId === sessionId) {
          const nextIndex = targetIndex < newSessions.length ? targetIndex : newSessions.length - 1;
          newCurrentId = newSessions[nextIndex]?.id || newSessions[0].id;
        }
        
        set(state => {
          const updatedMessages = { ...state.messages };
          delete updatedMessages[sessionId];
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
            messages: updatedMessages
          };
        });
      },

      togglePinSession: (sessionId: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, isPinned: !session.isPinned, updatedAt: new Date() }
              : session
          )
        }));
      },

      setCurrentSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          )
        }));
      },

      clearAllHistory: () => {
        const freshSession = createInitialSession();
        set({
          sessions: [freshSession],
          currentSessionId: freshSession.id,
          messages: { [freshSession.id]: [] }
        });
      },

      // Message methods
      addMessage: (sessionId: string, message: Omit<Message, 'id'>) => {
        const newId = generateId();
        const newMessage: Message = {
          ...message,
          id: newId,
          timestamp: toValidDate(message.timestamp)
        };
        
        set(state => {
          const sessionMessages = state.messages[sessionId] || [];
          const isFirstUserMessage = sessionMessages.length === 0 && message.role === 'user';
          
          let newSessions = state.sessions;
          if (isFirstUserMessage) {
            // Auto-rename session based on first user message (stripping attached file markers if present)
            const cleanText = message.content.replace(/\[Attached file:[^\]]+\]/g, '').replace(/```[\s\S]*?```/g, '').trim();
            const cleanTitle = (cleanText || message.content).replace(/\s+/g, ' ').trim();
            const newTitle = cleanTitle.length > 30 
              ? cleanTitle.substring(0, 30) + '...' 
              : cleanTitle || 'New Chat';
              
            newSessions = state.sessions.map(s => 
              s.id === sessionId && s.title === 'New Chat' 
                ? { ...s, title: newTitle, updatedAt: new Date() } 
                : s
            );
          } else {
            newSessions = state.sessions.map(s => 
              s.id === sessionId ? { ...s, updatedAt: new Date() } : s
            );
          }

          return {
            sessions: newSessions,
            messages: {
              ...state.messages,
              [sessionId]: [...sessionMessages, newMessage]
            }
          };
        });

        return newId;
      },

      updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => {
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: (state.messages[sessionId] || []).map(msg =>
              msg.id === messageId 
                ? { 
                    ...msg, 
                    ...updates,
                    timestamp: updates.timestamp ? toValidDate(updates.timestamp) : msg.timestamp 
                  } 
                : msg
            )
          }
        }));
      },

      removeMessage: (sessionId: string, messageId: string) => {
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: (state.messages[sessionId] || []).filter(msg => msg.id !== messageId)
          }
        }));
      },

      truncateAndEditMessage: (sessionId: string, messageId: string, newContent: string): Message[] => {
        const { messages } = get();
        const sessionMessages = messages[sessionId] || [];
        const targetIndex = sessionMessages.findIndex(m => m.id === messageId);
        if (targetIndex === -1) return sessionMessages;

        const updatedTargetMessage: Message = {
          ...sessionMessages[targetIndex],
          content: newContent,
          timestamp: new Date()
        };

        // Truncate everything after targetIndex
        const newSessionMessages = [
          ...sessionMessages.slice(0, targetIndex),
          updatedTargetMessage
        ];

        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: newSessionMessages
          }
        }));

        return newSessionMessages;
      },

      clearMessages: (sessionId: string) => {
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: []
          }
        }));
      },

      // Quick prompt methods
      addQuickPrompt: (prompt: Omit<QuickPrompt, 'id'>) => {
        const newPrompt: QuickPrompt = {
          ...prompt,
          id: generateId()
        };
        
        set(state => ({
          quickPrompts: [...state.quickPrompts, newPrompt]
        }));
      },

      deleteQuickPrompt: (promptId: string) => {
        set(state => ({
          quickPrompts: state.quickPrompts.filter(p => p.id !== promptId && p.isBuiltIn)
        }));
      },

      // Settings methods
      updateSettings: (updates: Partial<ChatSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      // UI methods
      setDarkMode: (darkMode: boolean) => {
        set(state => ({
          uiState: { ...state.uiState, darkMode }
        }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set(state => ({
          uiState: { ...state.uiState, sidebarCollapsed: collapsed }
        }));
      },

      setCurrentView: (view: UIState['currentView']) => {
        set(state => ({
          uiState: { ...state.uiState, currentView: view }
        }));
      },

      setIsTyping: (isTyping: boolean) => {
        set(state => ({
          uiState: { ...state.uiState, isTyping }
        }));
      },

      // Getters
      getCurrentMessages: () => {
        const { messages, currentSessionId } = get();
        return messages[currentSessionId] || [];
      },

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(s => s.id === currentSessionId);
      },

      getUIState: () => {
        return get().uiState;
      },

      getSidebarState: () => {
        return { collapsed: get().uiState.sidebarCollapsed };
      }
    }),
    {
      name: 'valbot-chat-store',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        activePersona: state.activePersona,
        messages: state.messages,
        quickPrompts: state.quickPrompts.filter(p => !p.isBuiltIn),
        settings: {
          model: state.settings.model,
          temperature: state.settings.temperature,
          maxTokens: state.settings.maxTokens,
          streamingEnabled: state.settings.streamingEnabled,
          autoSave: state.settings.autoSave,
          soundEnabled: state.settings.soundEnabled,
          systemPrompt: state.settings.systemPrompt !== undefined ? state.settings.systemPrompt : DEFAULT_SYSTEM_PROMPT,
          reducedMotion: state.settings.reducedMotion || false,
          responseStyle: state.settings.responseStyle || 'balanced',
          wrapCodeLines: state.settings.wrapCodeLines !== false,
        },
        uiState: state.uiState
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Ensure sessions exist
        if (!Array.isArray(state.sessions) || state.sessions.length === 0) {
          const fresh = createInitialSession();
          state.sessions = [fresh];
          state.currentSessionId = fresh.id;
          state.messages = { [fresh.id]: [] };
        } else {
          // Revive session dates from serialized strings
          const revivedSessions = state.sessions.map(s => ({
            ...s,
            createdAt: toValidDate(s.createdAt),
            updatedAt: toValidDate(s.updatedAt),
            isPinned: !!s.isPinned
          }));

          // Deduplicate redundant empty "New Chat" sessions from storage
          let foundEmptyNewChat = false;
          const cleanedSessions: ChatSession[] = [];
          for (const s of revivedSessions) {
            const sMessages = state.messages?.[s.id] || [];
            if (s.title === 'New Chat' && sMessages.length === 0) {
              if (!foundEmptyNewChat) {
                cleanedSessions.push(s);
                foundEmptyNewChat = true;
              }
            } else {
              cleanedSessions.push(s);
            }
          }
          state.sessions = cleanedSessions.length > 0 ? cleanedSessions : revivedSessions;

          // Validate currentSessionId
          const activeExists = state.sessions.some(s => s.id === state.currentSessionId);
          if (!activeExists) {
            state.currentSessionId = state.sessions[0].id;
          }
        }

        if (!state.activePersona) {
          state.activePersona = 'general';
        }

        const validModelIds = new Set([
          'google/gemma-4-31b-it:free',
          'google/gemma-4-26b-a4b-it:free',
          'google/gemma-3-27b-it:free',
          'google/gemini-2.0-flash-exp:free',
          'meta-llama/llama-3.3-70b-instruct:free',
          'meta-llama/llama-3.2-3b-instruct:free'
        ]);

        if (!state.settings || !state.settings.model || !validModelIds.has(state.settings.model)) {
          state.settings = {
            ...defaultSettings,
            ...state.settings,
            model: 'google/gemma-4-31b-it:free'
          };
        } else {
          if (!state.settings.systemPrompt || state.settings.systemPrompt.trim() === '') {
            state.settings.systemPrompt = DEFAULT_SYSTEM_PROMPT;
          }
          if (!state.settings.responseStyle) {
            state.settings.responseStyle = 'balanced';
          }
          if (state.settings.wrapCodeLines === undefined) {
            state.settings.wrapCodeLines = true;
          }
        }

        // Revive message timestamps from serialized strings
        if (state.messages && typeof state.messages === 'object') {
          for (const sId of Object.keys(state.messages)) {
            if (Array.isArray(state.messages[sId])) {
              state.messages[sId] = state.messages[sId].map(m => ({
                ...m,
                timestamp: toValidDate(m.timestamp)
              }));
            }
          }
        }

        // Safely strip any old apiKey stored in localStorage
        if (state.settings && 'apiKey' in state.settings) {
          delete state.settings.apiKey;
        }
      }
    }
  )
);
