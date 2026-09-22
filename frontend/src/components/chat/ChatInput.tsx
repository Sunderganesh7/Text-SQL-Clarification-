import React, { useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      <div className="relative bg-surface border border-border shadow-sm rounded-2xl transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 overflow-hidden flex flex-col group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data..."
          disabled={isLoading}
          className="w-full bg-transparent text-text-primary placeholder:text-text-muted p-4 resize-none outline-none min-h-[60px] max-h-48 overflow-y-auto disabled:opacity-50"
          rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
        />
        <div className="flex justify-between items-center p-3 border-t border-border/50 bg-background/50">
          <span className="text-[10px] text-text-muted font-medium ml-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
            Shift + Enter for new line
          </span>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center p-2 rounded-xl text-white bg-primary hover:bg-primary-hover disabled:bg-surface-elevated disabled:text-text-muted disabled:border disabled:border-border transition-colors shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send size={16} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
