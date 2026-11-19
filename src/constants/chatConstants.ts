export interface AIModelOption {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  provider: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  // Google Models
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 31B',
    shortName: 'Gemma 4 31B',
    tagline: 'Google state-of-the-art multimodal reasoning',
    badge: 'Default',
    provider: 'Google'
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google Gemma 4 26B (Fast)',
    shortName: 'Gemma 4 26B',
    tagline: 'Lightweight, rapid Google instruction model',
    badge: 'Fast',
    provider: 'Google'
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Google Gemma 3 27B',
    shortName: 'Gemma 3 27B',
    tagline: 'High-capability Google open weights model',
    badge: 'Balanced',
    provider: 'Google'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash',
    shortName: 'Gemini 2.0 Flash',
    tagline: 'Next-gen Google multimodal speed & reasoning',
    badge: 'Experimental',
    provider: 'Google'
  },
  // Meta Models
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B',
    shortName: 'Llama 3.3 70B',
    tagline: 'Meta flagship high-reasoning intelligence',
    badge: 'Powerful',
    provider: 'Meta'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Meta Llama 3.2 3B (Fast)',
    shortName: 'Llama 3.2 3B',
    tagline: 'Ultra-fast lightweight Meta instruction model',
    badge: 'Fast',
    provider: 'Meta'
  }
];

export const DEFAULT_MODEL_ID = 'google/gemma-4-31b-it:free';

export const welcomeMessages = [
  {
    id: 'welcome-1',
    role: 'assistant' as const,
    content: "Hello! 👋 I'm ValBot, your AI assistant. How can I help you today?",
    timestamp: new Date(),
  },
  {
    id: 'suggestion-1',
    role: 'assistant' as const,
    content: 'You can ask me about:\n• Technical architecture & code\n• Writing & content creation\n• Problem solving & tutoring\n• Project planning',
    timestamp: new Date(),
  },
];

export const sampleQueries = [
  'How do I implement dark mode in React with Tailwind?',
  'Can you explain async/await and event loop in JavaScript?',
  'What is the best way to architect state in React 19?',
  'How do I build a production-ready edge API with TypeScript?',
];
