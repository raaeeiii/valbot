import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  Check, 
  Download, 
  Sliders, 
  Database, 
  Sparkles,
  WrapText
} from 'lucide-react';
import { useChatStore, type ResponseStyle } from '../store/chatStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    clearAllHistory, 
    sessions, 
    messages 
  } = useChatStore();

  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(settings.responseStyle || 'balanced');
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt || '');
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion || false);
  const [wrapCodeLines, setWrapCodeLines] = useState(settings.wrapCodeLines !== false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [exportedNotification, setExportedNotification] = useState(false);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSave = () => {
    updateSettings({
      responseStyle,
      systemPrompt: systemPrompt.trim(),
      reducedMotion,
      wrapCodeLines
    });
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 600);
  };

  const handleExportAllChats = () => {
    try {
      const exportPayload = {
        app: 'ValBot AI',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        totalSessions: sessions.length,
        sessions,
        messages
      };
      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `valbot-chat-history-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportedNotification(true);
      setTimeout(() => setExportedNotification(false), 2000);
    } catch (err) {
      console.error('Failed to export chat history:', err);
    }
  };

  const handleConfirmClear = () => {
    clearAllHistory();
    setConfirmClearOpen(false);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Centered Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl bg-[#120a24] border border-white/10 shadow-2xl shadow-purple-900/40 overflow-hidden z-10 text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-400/30">
                <img src="/logo.png" alt="ValBot" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold tracking-wide text-white leading-tight">
                  ValBot Preferences
                </h3>
                <p className="text-[11px] text-slate-400">Customize AI behavior, workspace & data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Clean 2-Section Layout */}
          <div className="p-6 space-y-6 overflow-y-auto chat-scrollbar flex-1">
            
            {/* SECTION 1: AI & Workspace Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/5 pb-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>AI & Interface Preferences</span>
              </div>

              {/* 1. Response Style Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Response Style
                </label>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  Controls the default length and depth of ValBot's answers.
                </p>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                  {(['concise', 'balanced', 'detailed'] as ResponseStyle[]).map((style) => {
                    const isActive = responseStyle === style;
                    const labels: Record<ResponseStyle, { name: string; desc: string }> = {
                      concise: { name: 'Concise', desc: 'Direct & brief' },
                      balanced: { name: 'Balanced', desc: 'Clear standard' },
                      detailed: { name: 'Detailed', desc: 'In-depth steps' }
                    };
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setResponseStyle(style)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium shadow-md shadow-cyan-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="font-semibold">{labels[style].name}</span>
                        <span className="text-[10px] opacity-80">{labels[style].desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom System Instructions */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Custom System Instructions
                </label>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  Instructions appended to every chat session across all personas.
                </p>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="e.g., Speak like a principal staff engineer. Provide full TypeScript types and test cases whenever proposing code."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* 3. Workspace Toggles */}
              <div className="space-y-2.5 pt-1">
                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="pr-3">
                    <span className="text-sm font-medium text-slate-200 block">
                      Reduced Motion
                    </span>
                    <span className="text-xs text-slate-400">
                      Minimize animations for maximum responsiveness & lower memory usage
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 bg-white/10 cursor-pointer shrink-0"
                  />
                </div>

                {/* Wrap Long Code Lines Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="pr-3 flex items-start gap-2">
                    <WrapText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">
                        Wrap Long Code Lines
                      </span>
                      <span className="text-xs text-slate-400">
                        Wrap syntax code blocks instead of horizontal scrolling
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={wrapCodeLines}
                    onChange={(e) => setWrapCodeLines(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 bg-white/10 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Data & Productivity */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-400 border-b border-white/5 pb-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Data & Productivity</span>
              </div>

              {/* Export All Chats Button */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">
                    Export Chat History
                  </span>
                  <span className="text-xs text-slate-400">
                    Download a full JSON backup of all {sessions.length} conversation sessions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportAllChats}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-cyan-200 text-xs font-medium transition-colors shrink-0 shadow-sm"
                >
                  {exportedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Exported!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export (.json)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard Shortcuts Badge */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs font-medium text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Keyboard Shortcuts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/20 px-2.5">
                    <span className="text-slate-400">Send:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] text-cyan-300 font-mono">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/20 px-2.5">
                    <span className="text-slate-400">Newline:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] text-cyan-300 font-mono">Shift+Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/20 px-2.5">
                    <span className="text-slate-400">Search:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] text-cyan-300 font-mono">Ctrl+K</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear All Chats Confirmation Zone (if triggered) */}
            {confirmClearOpen && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-center space-y-2.5">
                <p className="text-xs text-rose-200">
                  Are you sure? This will permanently delete all {sessions.length} chats and saved messages from this browser.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    Yes, Permanently Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
            {/* Left: Clear All Chat History button */}
            {!confirmClearOpen ? (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Wipe chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            ) : (
              <span className="text-[11px] text-rose-400 italic">Confirm above</span>
            )}

            {/* Right: Cancel & Save Changes */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                {savedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
