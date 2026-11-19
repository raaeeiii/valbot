import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Paperclip, 
  Mic, 
  MicOff, 
  X, 
  FileText, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Cpu 
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { AVAILABLE_MODELS } from '../constants/chatConstants';

interface AttachedFile {
  name: string;
  content: string;
  size: number;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
  onStopGenerating?: () => void;
  disabled?: boolean;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating = false,
  onStopGenerating,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const { settings, updateSettings } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === settings.model) || AVAILABLE_MODELS[0];

  // Close model dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Check SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init warning:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  const processFiles = (files: FileList | File[]) => {
    setFileError(null);
    const MAX_FILE_SIZE = 100 * 1024; // 100 KB limit to stay safely within context boundaries

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`"${file.name}" exceeds the 100KB limit for text context.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (typeof content === 'string') {
          setAttachedFiles((prev) => {
            if (prev.some((f) => f.name === file.name && f.size === file.size)) return prev;
            return [...prev, { name: file.name, content, size: file.size }];
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating && onStopGenerating) {
      onStopGenerating();
      return;
    }

    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || disabled) return;

    let finalMessage = '';

    // Append formatted files
    if (attachedFiles.length > 0) {
      const fileBlocks = attachedFiles.map((f) => {
        const ext = f.name.split('.').pop() || 'text';
        return `[Attached file: ${f.name}]\n\`\`\`${ext}\n${f.content}\n\`\`\``;
      }).join('\n\n');

      finalMessage = trimmed ? `${fileBlocks}\n\n${trimmed}` : fileBlocks;
    } else {
      finalMessage = trimmed;
    }

    onSendMessage(finalMessage);
    setInput('');
    setAttachedFiles([]);
    setFileError(null);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = (input.trim().length > 0 || attachedFiles.length > 0) && !disabled;

  return (
    <div className="w-full relative">
      {/* File Size Error Alert */}
      {fileError && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between backdrop-blur-md">
          <span>{fileError}</span>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="p-0.5 hover:bg-rose-500/20 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative w-full">
        {/* Hidden File Input for Paperclip */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.py,.c,.cpp,.html,.css"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Composer Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col rounded-2xl border transition-all duration-200 bg-[#140e26]/95 backdrop-blur-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_0_35px_rgba(0,0,0,0.6)] ${
            isDragOver
              ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-950/20'
              : 'border-white/10 focus-within:border-cyan-400/40 focus-within:bg-[#131126]/95 focus-within:shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]'
          }`}
        >
          {/* Attached Files Chips View */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 pt-1 border-b border-white/5 mb-1.5">
              {attachedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-cyan-500/30 text-xs text-slate-200 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[130px] font-mono">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(1)}k)</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-0.5 rounded hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Area: No Inner Focus Rectangle, Auto Single-Row on Empty */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to speech... speak clearly'
                : 'Ask ValBot anything... (Shift + Enter for new line)'
            }
            rows={1}
            disabled={disabled}
            className="w-full max-h-[140px] min-h-[36px] py-1 px-1 bg-transparent border-0 shadow-none resize-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 text-sm sm:text-base leading-relaxed text-slate-100 placeholder:text-slate-400 placeholder:truncate disabled:opacity-50"
            style={{ overflowY: input ? 'auto' : 'hidden' }}
            aria-label="Message prompt input"
          />

          {/* Bottom Bar: Action tools + Model Dropdown + Send/Stop button */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-1">
            {/* Left Controls: File Attachment, Dictation & Model Selector */}
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* Attach File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors disabled:opacity-40"
                title="Attach text/code files (.txt, .md, .ts, .py, .json, etc.)"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Voice Dictation Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={disabled}
                  className={`p-1.5 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-400 animate-pulse'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                  title={isListening ? 'Stop voice recording' : 'Dictate with microphone'}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Model Selector Pill / Dropdown (Gemini & ChatGPT style) */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  disabled={disabled || isGenerating}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-medium border transition-all ${
                    isModelDropdownOpen
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                  } disabled:opacity-50`}
                  title={`Active Model: ${currentModel.name}`}
                  aria-label="Select AI Model"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-200 truncate max-w-[90px] sm:max-w-none">
                    {currentModel.shortName}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isModelDropdownOpen && (
                  <div className="absolute left-0 bottom-9 z-40 w-72 sm:w-84 max-h-[380px] overflow-y-auto chat-scrollbar rounded-2xl bg-[#140b28] border border-cyan-500/30 shadow-2xl p-2 space-y-2 backdrop-blur-2xl text-white">
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 border-b border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Select Model
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono font-medium">Free AI</span>
                    </div>

                    {/* Google & Meta Provider Groups */}
                    {(['Google', 'Meta'] as const).map((providerName) => {
                      const providerModels = AVAILABLE_MODELS.filter((m) => m.provider === providerName);
                      if (providerModels.length === 0) return null;

                      return (
                        <div key={providerName} className="space-y-1">
                          <div className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>{providerName}</span>
                            <span className="text-[9px] text-slate-500 lowercase font-normal">{providerModels.length} models</span>
                          </div>

                          {providerModels.map((m) => {
                            const isSelected = (settings.model || 'google/gemma-4-31b-it:free') === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  updateSettings({ model: m.id });
                                  setIsModelDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-white'
                                    : 'hover:bg-white/5 border border-transparent text-slate-300 hover:text-white'
                                }`}
                              >
                                <div className="flex flex-col pr-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-semibold">{m.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                      isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/10 text-slate-400'
                                    }`}>
                                      {m.badge}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">{m.tagline}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Control: Send OR Stop Generating */}
            <div className="flex items-center pl-2">
              {isGenerating ? (
                /* Stop Generating Button */
                <button
                  type="button"
                  onClick={onStopGenerating}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all active:scale-95 cursor-pointer animate-pulse"
                  title="Stop generating"
                  aria-label="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                /* Send Button */
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send message"
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                    canSend
                      ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-100 active:scale-95 cursor-pointer'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed scale-95 opacity-60'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
