import React, { useState, useMemo } from 'react';
import { MessageSquare, Search, Trash2, AlertTriangle, Clock } from 'lucide-react';
import type { ChatMessage } from '../../api/client';

interface ChatHistoryPanelProps {
  messages: ChatMessage[];
  activeMessageId?: string;
  onSelectMessage?: (id: string) => void;
  onClearHistory?: () => void;
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({ messages, activeMessageId, onSelectMessage, onClearHistory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Filter only user messages (ignore system/clarification) and match search query
  const userQuestions = useMemo(() => {
    return messages.filter(m => {
      if (m.role !== 'user' || m.content.startsWith('[Clarification]')) return false;
      if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [messages, searchQuery]);

  // Simple grouping by date (today, yesterday, this week)
  const groups = useMemo(() => {
    const g: Record<string, ChatMessage[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'Older': [],
    };
    const now = new Date();
    userQuestions.forEach(msg => {
      const msgDate = new Date((msg as any).timestamp ?? Date.now());
      const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) g['Today'].push(msg);
      else if (diffDays === 1) g['Yesterday'].push(msg);
      else if (diffDays <= 7) g['This Week'].push(msg);
      else g['Older'].push(msg);
    });
    return g;
  }, [userQuestions]);

  const renderGroup = (title: string, items: ChatMessage[]) => (
    <div className="flex flex-col space-y-3">
      <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-2">{title}</h4>
      {items.length === 0 ? (
        <div className="py-8 text-center bg-background rounded-xl border border-dashed border-border flex flex-col items-center">
          <div className="text-text-muted mb-2"><MessageSquare size={24} className="opacity-50" /></div>
          <div className="font-medium text-text-secondary text-sm">No conversations found</div>
          <div className="text-xs text-text-muted mt-1">Your questions will appear here.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(msg => (
            <button
              key={msg.id}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                activeMessageId === msg.id 
                ? 'bg-primary/5 border-primary/30 shadow-sm' 
                : 'bg-surface border-border hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => onSelectMessage && onSelectMessage(msg.id)}
            >
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                activeMessageId === msg.id ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted'
              }`}>
                <MessageSquare size={14} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`text-[15px] leading-snug truncate font-medium ${
                  activeMessageId === msg.id ? 'text-primary' : 'text-text-primary'
                }`}>{msg.content}</span>
                <span className="flex items-center gap-1.5 text-xs text-text-muted mt-1.5">
                  <Clock size={12} />
                  {(() => {
                    const ts = (msg as any).timestamp;
                    const date = ts ? new Date(ts) : null;
                    return date && !isNaN(date.getTime())
                      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now';
                  })()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Query History</h2>
          <p className="text-[13px] text-text-muted mt-0.5">View and search your past questions</p>
        </div>
        {messages.length > 0 && (
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-colors text-sm font-semibold border border-error/20 hover:border-transparent" 
            title="Clear History"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}></div>
          <div className="relative bg-surface p-8 rounded-2xl shadow-xl border border-border max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 mb-6 border border-error/20">
              <AlertTriangle className="text-error" size={24} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Clear Query History?</h3>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
              Are you sure you want to delete all saved queries and chat history? This action cannot be undone. Uploaded datasets and tables will not be affected.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2.5 rounded-lg font-medium text-text-primary bg-surface-elevated hover:bg-border border border-border transition-colors w-full sm:w-auto"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2.5 rounded-lg font-medium text-white bg-error hover:bg-red-600 focus:ring-2 focus:ring-error/50 transition-colors w-full sm:w-auto"
                onClick={() => {
                  onClearHistory && onClearHistory();
                  setShowClearConfirm(false);
                }}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="p-6 pb-4 border-b border-border/50 bg-background/30">
        <div className="relative flex items-center bg-surface border border-border rounded-xl px-4 py-3 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search size={18} className="text-text-muted mr-3" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full text-[15px] outline-none bg-transparent text-text-primary placeholder:text-text-muted font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
        {groups['Today'].length > 0 && renderGroup('Today', groups['Today'])}
        {groups['Yesterday'].length > 0 && renderGroup('Yesterday', groups['Yesterday'])}
        {groups['This Week'].length > 0 && renderGroup('This Week', groups['This Week'])}
        {groups['Older'].length > 0 && renderGroup('Older', groups['Older'])}
        
        {userQuestions.length === 0 && (
           <div className="flex flex-col items-center justify-center text-center py-16 h-full">
             <div className="w-16 h-16 bg-surface-elevated border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm text-text-muted">
               <MessageSquare size={28} />
             </div>
             <h3 className="text-lg font-bold text-text-primary mb-2">No queries yet</h3>
             <p className="text-[14px] text-text-secondary max-w-xs leading-relaxed">
               When you ask questions in Analytics Chat, they will automatically appear here.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};
