# 🤖 ValBot - Intelligent AI Chatbot Assistant> **Modern AI Chatbot Interface** built with React, TypeScript, and TailwindCSS by **Valbit (Rahib RK)**![ValBot Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-blue)## ✨ Features### 🎨 **Modern Design**- **Glassmorphism UI** with animated background blobs- **Dark theme** with purple-to-slate gradient- **Responsive design** that works on all devices- **Smooth animations** and transitions### 🤖 **Intelligent Chat**- **Contextual responses** to user messages- **Real-time typing indicators** - **Message history** with timestamps- **Copy & export** chat functionality- **Smart AI service** ready for API integration### 👨‍💻 **About Developer**- **Collapsible sidebar** with developer information- **Profile image** and social links- **Skills showcase** with modern tags- **Direct contact** links (GitHub, LinkedIn, Email)### 🚀 **Performance**- **Fast Vite build** system- **Optimized bundle size** (CSS: 13.51kB, JS: 13.35kB)- **Modern React patterns** with hooks- **TypeScript** for type safety## 🛠️ Tech Stack- **Frontend:** React 18 + TypeScript- **Styling:** TailwindCSS + Custom CSS- **Icons:** Lucide React- **Routing:** React Router- **Build Tool:** Vite- **Deployment:** Vercel Ready## 🚀 Quick Start### Prerequisites- Node.js 18+ - npm or yarn### Installation```bash# Clone the repositorygit clone https://github.com/raaeeiii/valbot.gitcd valbot# Install dependenciesnpm install# Start development servernpm run dev# Build for productionnpm run build# Preview production buildnpm run preview```### 🔧 Development
```bash
# Run in development mode
npm run dev
# Visit: http://localhost:3000

# TypeScript checking
npm run type-check

# Build for production
npm run build
```

## 🤖 AI Integration

ValBot comes with a **mock AI service** that provides intelligent responses. To integrate with real AI providers:

### OpenAI Integration
```typescript
// src/services/aiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async sendMessage(message: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content || "Sorry, I couldn't process that.";
  }
}
```

### Anthropic Claude Integration
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AIService {
  static async sendMessage(message: string): Promise<string> {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: message }]
    });
    return completion.content[0].text;
  }
}
```

## 📱 Features Overview

### Chat Interface
- **Real-time messaging** with smooth animations
- **Message bubbles** with user/assistant distinction
- **Timestamp display** for each message
- **Copy message** functionality
- **Export chat** as text file
- **Clear chat** option

### About Sidebar
- **Developer profile** with photo
- **Skills showcase** with modern tags  
- **Social media links** (GitHub, LinkedIn, Email)
- **About section** with developer bio
- **Collapsible design** for better UX

### Modern UI Elements
- **Glassmorphism effects** throughout
- **Animated background** with blob shapes
- **Smooth transitions** on all interactions
- **Responsive typography** and spacing
- **Modern color palette** with gradients

## 🎨 Customization

### Colors & Themes
Modify the color scheme in `src/components/ChatBot.tsx`:

```typescript
// Primary gradient backgrounds
bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900

// Message bubbles
bg-gradient-to-r from-emerald-500 to-teal-600  // User messages
bg-white/20 backdrop-blur-sm                   // Assistant messages

// Buttons and accents
bg-gradient-to-r from-purple-500 to-pink-600  // Send button
```

### Animations
Custom animations are defined in `src/styles/modern.css`:

```css
@keyframes blob {
  /* Animated background blobs */
}

.animate-blob {
  animation: blob 7s infinite;
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

### Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Or connect your GitHub repo for auto-deployment
```

### Custom Server
```bash
# Build for production
npm run build

# Serve the dist folder with any static file server
npx serve dist
```

## 🔧 Environment Variables

Create a `.env` file for API configurations:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Anthropic Configuration  
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Other AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 📞 Connect with Developer

**Valbit (Rahib RK)** - AI Engineer & Full-Stack Developer

- 🌐 **Portfolio:** [valbit.in](https://valbit.in)
- 💼 **LinkedIn:** [linkedin.com/in/rahibrk](https://linkedin.com/in/rahibrk)  
- 🐙 **GitHub:** [github.com/raaeeiii](https://github.com/raaeeiii)
- 📧 **Email:** contact@valbit.in

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by **Valbit**
- Inspired by modern AI chat interfaces
- Uses amazing open-source libraries and tools

---

**Made with ❤️ by Valbit** • **Powered by React + TypeScript + TailwindCSS**
