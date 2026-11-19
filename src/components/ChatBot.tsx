import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { Sidebar } from './Sidebar';
import { ProfessionalChat } from './ProfessionalChat';
import { SettingsModal } from './SettingsModal';

const ChatBot: React.FC = () => {
  const { getUIState, setSidebarCollapsed } = useChatStore();
  const uiState = getUIState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isCollapsed = uiState.sidebarCollapsed;

  return (
    <div className="h-screen w-full flex overflow-hidden transition-colors duration-300 bg-[#080412] text-white selection:bg-cyan-500/30 selection:text-white">
      
      {/* Background ambient branding glow: Cyan, Indigo, Violet */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -left-28 w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* Desktop Sidebar: Dynamically resizes parent width so main workspace expands */}
      <aside 
        className={`hidden md:flex z-20 shrink-0 border-r border-white/5 bg-[#0a0515]/85 backdrop-blur-2xl transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-[68px]' : 'w-[280px]'
        }`}
      >
        <Sidebar 
          darkMode={true}
          onToggle={() => setSidebarCollapsed(!isCollapsed)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </aside>

      {/* Mobile Slide-over Drawer with Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-[280px] max-w-[85vw] h-full bg-[#0d071d] border-r border-cyan-500/20 shadow-2xl z-10 flex flex-col"
            >
              <Sidebar 
                darkMode={true}
                onToggle={() => setIsMobileSidebarOpen(false)} 
                isMobile 
                onOpenSettings={() => {
                  setIsMobileSidebarOpen(false);
                  setIsSettingsOpen(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Area: Encapsulated in modern dark glass card with responsive borders */}
      <main className="flex-1 flex flex-col min-w-0 z-10 p-0 md:p-3 lg:p-4">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden transition-all bg-[#0f0921]/70 md:border border-white/5 md:rounded-[2rem] shadow-2xl shadow-cyan-950/20 backdrop-blur-3xl">
          <ProfessionalChat 
            darkMode={true} 
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </div>
      </main>

      {/* Global Settings Modal: Portaled to document.body, centered over full screen */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatBot;
