import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Trash2,
  Search,
  X,
  Edit2,
  Pin,
  PanelLeftOpen,
  PanelLeftClose,
  SquarePen,
  History
} from 'lucide-react';
import { useChatStore, toValidDate, type ChatSession } from '../store/chatStore';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
  darkMode?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onToggle,
  isMobile = false,
  onOpenSettings
}) => {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    updateSessionTitle,
    togglePinSession,
    setCurrentSession,
    getSidebarState,
    setSidebarCollapsed,
    messages
  } = useChatStore();

  const sidebarState = getSidebarState();
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search filter across BOTH title and stored message content
  const lowerSearch = searchTerm.trim().toLowerCase();
  const filteredSessions = sessions.filter(session => {
    if (!lowerSearch) return true;
    if (session.title.toLowerCase().includes(lowerSearch)) return true;
    
    // Check stored messages for this session
    const sessionMessages = messages[session.id] || [];
    return sessionMessages.some(m => m.content && m.content.toLowerCase().includes(lowerSearch));
  });

  // Pinned sessions group
  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const unpinnedSessions = filteredSessions.filter(s => !s.isPinned);

  // Accurate Date Grouping using real local midnight timestamps for unpinned sessions
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const sevenDaysAgoStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const todaySessions: ChatSession[] = [];
  const yesterdaySessions: ChatSession[] = [];
  const previous7DaysSessions: ChatSession[] = [];
  const olderSessions: ChatSession[] = [];

  for (const s of unpinnedSessions) {
    const time = toValidDate(s.updatedAt).getTime();
    if (time >= todayStart) {
      todaySessions.push(s);
    } else if (time >= yesterdayStart) {
      yesterdaySessions.push(s);
    } else if (time >= sevenDaysAgoStart) {
      previous7DaysSessions.push(s);
    } else {
      olderSessions.push(s);
    }
  }

  const handleNewChat = () => {
    createSession('New Chat');
    if (isMobile && onToggle) onToggle();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length > 1) {
      deleteSession(sessionId);
    }
  };

  const handleTogglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinSession(sessionId);
  };

  const toggleSidebar = () => {
    if (isMobile && onToggle) {
      onToggle();
    } else {
      setSidebarCollapsed(!sidebarState.collapsed);
      onToggle?.();
    }
  };

  const isCollapsed = isMobile ? false : sidebarState.collapsed;

  const renderSessionGroup = (title: string, groupSessions: ChatSession[], isPinnedGroup = false) => {
    if (groupSessions.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 flex items-center justify-between">
          <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
            isPinnedGroup ? 'text-cyan-400' : 'text-slate-400'
          }`}>
            {isPinnedGroup && <Pin className="w-3 h-3 text-cyan-400" />}
            {title}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {groupSessions.length}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {groupSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
                onClick={() => {
                  setCurrentSession(session.id);
                  if (isMobile && onToggle) onToggle();
                }}
                className={`group flex items-center justify-between cursor-pointer rounded-xl transition-all px-3 py-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-white border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                {editingSessionId === session.id ? (
                  <div className="flex-1 flex items-center pr-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingTitle.trim()) {
                            updateSessionTitle(session.id, editingTitle.trim());
                          }
                          setEditingSessionId(null);
                        } else if (e.key === 'Escape') {
                          setEditingSessionId(null);
                        }
                      }}
                      onBlur={() => {
                        if (editingTitle.trim()) {
                          updateSessionTitle(session.id, editingTitle.trim());
                        }
                        setEditingSessionId(null);
                      }}
                      className="w-full bg-[#18112e] text-white text-sm px-2.5 py-1 rounded-lg outline-none border border-cyan-400/50"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-1.5 flex-1 min-w-0 pr-2">
                      {session.isPinned && (
                        <Pin className="w-3 h-3 text-cyan-400 shrink-0" />
                      )}
                      <span className="text-sm truncate select-none">
                        {session.title}
                      </span>
                    </div>

                    {(hoveredSession === session.id || isActive) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Pin / Unpin Button */}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(session.id, e)}
                          className={`p-1 rounded-md transition-colors ${
                            session.isPinned 
                              ? 'text-cyan-400 hover:bg-cyan-500/20' 
                              : 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                          }`}
                          title={session.isPinned ? "Unpin chat" : "Pin chat to top"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Rename Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitle(session.title);
                            setEditingSessionId(session.id);
                          }}
                          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        {sessions.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this conversation?')) {
                                handleDeleteSession(session.id, e);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* GEMINI-STYLE COLLAPSED VERTICAL ICON RAIL (Desktop)  */}
      {/* ---------------------------------------------------- */}
      {isCollapsed ? (
        <div className="h-full flex flex-col items-center py-4 px-2 w-full select-none justify-between">
          {/* Top Rail Section */}
          <div className="flex flex-col items-center space-y-3.5 w-full">
            {/* ValBot Logo Badge */}
            <div 
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl flex items-center justify-center p-1 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-400/20 cursor-pointer hover:border-cyan-400/50 hover:scale-105 transition-all shadow-sm"
              title="ValBot AI Workspace"
            >
              <img src="/logo.png" alt="ValBot Logo" className="w-full h-full object-contain" />
            </div>

            {/* Expand Sidebar Toggle Pill */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 hover:from-cyan-500/30 hover:to-purple-600/30 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm cursor-pointer active:scale-95"
              title="New chat"
              aria-label="New chat"
            >
              <SquarePen className="w-4 h-4" />
            </button>

            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setSidebarCollapsed(false);
                setTimeout(() => searchInputRef.current?.focus(), 150);
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Search chats"
              aria-label="Search chats"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Pinned Chats Trigger Button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Pinned chats"
              aria-label="Pinned chats"
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* History Trigger Button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Recent chats"
              aria-label="Recent chats"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Rail Section: Settings Button */}
          <div className="flex flex-col items-center w-full pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => onOpenSettings ? onOpenSettings() : setIsSettingsOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* FULL EXPANDED SIDEBAR (Desktop 280px or Mobile)      */
        /* ---------------------------------------------------- */
        <div className="relative h-full flex flex-col w-full bg-transparent overflow-hidden select-none">
          {/* Top Header / Logo & Collapse Button */}
          <div className="p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center p-0.5 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-400/20">
                <img src="/logo.png" alt="ValBot Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-wide text-white leading-tight">
                  ValBot
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  AI Workspace
                </span>
              </div>
            </div>
            
            {isMobile ? (
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <div className="px-3 pb-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewChat}
              className="w-full flex items-center justify-start px-3.5 py-2.5 space-x-2.5 rounded-xl font-medium transition-all bg-gradient-to-r from-cyan-500/20 to-purple-600/20 hover:from-cyan-500/30 hover:to-purple-600/30 text-cyan-200 border border-cyan-500/30 shadow-sm"
            >
              <SquarePen className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-semibold">New Chat</span>
            </motion.button>
          </div>
          
          {/* Search Bar with Clear/Reset button */}
          <div className="px-3 pb-3 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chats & messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto chat-scrollbar px-3 pb-4">
            {renderSessionGroup("Pinned", pinnedSessions, true)}
            {renderSessionGroup("Today", todaySessions)}
            {renderSessionGroup("Yesterday", yesterdaySessions)}
            {renderSessionGroup("Previous 7 Days", previous7DaysSessions)}
            {renderSessionGroup("Older", olderSessions)}
            
            {filteredSessions.length === 0 && searchTerm && (
              <div className="text-center text-xs text-slate-500 mt-6 px-2">
                No chats matching <span className="text-cyan-400">"{searchTerm}"</span>
              </div>
            )}
          </div>

          {/* Bottom Actions / Settings */}
          <div className="mt-auto px-3 pb-4 pt-3 shrink-0 border-t border-white/5">
            <button 
              type="button"
              onClick={() => onOpenSettings ? onOpenSettings() : setIsSettingsOpen(true)}
              className="w-full flex items-center justify-start space-x-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-slate-300 hover:bg-white/5 hover:text-white"
              title="ValBot Settings"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Fallback Settings Modal if not mounted at root */}
      {!onOpenSettings && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </>
  );
};
