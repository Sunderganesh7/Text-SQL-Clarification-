import React, { useRef, useEffect } from 'react';
import { Bot, Database, Info, Loader2, Copy, Sparkles, Check } from 'lucide-react';
import type { ChatMessage } from '../../api/client';
import { ChatInput } from './ChatInput';
import { ResultTable } from './ResultTable';
import { AutoChart } from './AutoChart';
import { ExportButton } from './ExportButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onClearHistory?: () => void;
  onClarifyResponse: (msg: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClarifyResponse
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopySQL = (sql: string) => {
    navigator.clipboard.writeText(sql);
  };

  const suggestions = [
    "Which city has the highest total sales?",
    "Show total units sold by city",
    "Which city has the highest average rating?",
    "Compare sales performance across cities"
  ];

  const renderClarificationCard = (msg: ChatMessage) => {
    const { content, options } = msg;

    try {
      return (
        <div className="w-full">
          <div className="flex flex-col pt-1 mb-6">
            <h4 className="text-lg font-bold text-text-primary tracking-tight">I need a bit more information</h4>
            <p className="text-text-secondary mt-1">{content}</p>
          </div>

          {options && options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isLoading) onClarifyResponse(opt);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Database size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">{opt}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex items-center gap-2 text-text-muted bg-surface-elevated p-3 rounded-lg border border-border/50 w-max">
            <Info size={16} className="text-primary" />
            <span className="text-[13px] font-medium">Or you can describe your requirement in your own words.</span>
          </div>
        </div>
      );
    } catch (e) {
      return <div className="text-warning p-4 bg-warning-bg rounded-lg border border-warning/20">{content}</div>;
    }
  };

  const renderAIResponse = (msg: ChatMessage) => {
      if (msg.clarification_needed) {
        return renderClarificationCard(msg);
      }

      const { results, sql: generated_sql, error } = msg;

      return (
        <div className="flex flex-col w-full space-y-8 max-w-4xl">
          {/* AI Answer first */}
          {msg.content && (
            <div className="flex flex-col space-y-3">
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} /> AI INSIGHT
              </h4>
              <div className="text-[14px] leading-relaxed text-text-primary">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-text-primary tracking-tight" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-text-primary tracking-tight" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mt-3 mb-2 text-text-primary" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-text-muted" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-text-muted" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-text-primary" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline 
                        ? <code className="bg-surface border border-border px-1.5 py-0.5 rounded md text-[12px] text-primary font-mono" {...props} />
                        : <pre className="bg-[#0F172A] p-4 rounded-xl text-[13px] font-mono text-blue-300 overflow-x-auto border border-border/10 shadow-sm my-4"><code {...props} /></pre>,
                    table: ({node, ...props}) => <div className="overflow-x-auto mb-4 border border-border rounded-xl shadow-sm"><table className="w-full text-left text-[13px]" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-surface-elevated border-b border-border text-text-muted text-[10px] font-bold uppercase tracking-wider" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-2.5 whitespace-nowrap" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-2 border-b border-border/30 text-text-primary whitespace-nowrap" {...props} />,
                    tbody: ({node, ...props}) => <tbody className="divide-y divide-border/30 bg-surface" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Key Results second */}
          {results && results.length > 0 && (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Key Results</h4>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                    {results.length} RECORDS
                  </div>
                  <ExportButton data={results} />
                </div>
              </div>
              <AutoChart data={results} />
              <ResultTable data={results} />
            </div>
          )}

          {/* Generated SQL third */}
          {generated_sql && (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Generated SQL
                </h4>
                <span className="flex items-center gap-1.5 text-[10px] text-success font-bold px-2.5 py-1 bg-success-bg border border-success/30 rounded-full uppercase tracking-wider">
                  <Check size={12} strokeWidth={3} /> EXECUTED SUCCESSFULLY
                </span>
              </div>
              <div className="relative group bg-[#0F172A] rounded-xl border border-border/20 overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">SQL Query</span>
                </div>
                <pre className="p-4 pt-12 text-[13px] font-mono text-[#82AAFF] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {generated_sql}
                </pre>
                <button
                  className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-medium backdrop-blur-sm"
                  onClick={() => handleCopySQL(generated_sql)}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          )}

          {/* Error block */}
          {error && (
            <div className="mt-4 p-4 bg-error-bg border border-error/30 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-error" />
              </div>
              <div className="flex flex-col pt-1">
                <strong className="text-[13px] font-semibold text-error mb-1">Analysis couldn't be completed</strong>
                <p className="font-mono text-xs text-error/80 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>
      );
    };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col space-y-8 pb-32">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-20 md:mt-32">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-primary">
                <Bot size={32} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">How can I help you?</h2>
              <p className="text-text-secondary text-base max-w-md leading-relaxed">
                Ask questions about your uploaded dataset in plain English, and I'll generate the SQL to find the answers.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-sm
                  ${msg.role === 'assistant' 
                    ? 'bg-gradient-to-tr from-primary to-primary-hover ring-4 ring-primary/10' 
                    : 'bg-surface-elevated text-text-primary border border-border'}`}
                >
                  {msg.role === 'assistant' ? <Bot size={18} /> : 'S'}
                </div>
                
                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    ${msg.role === 'user' 
                      ? 'bg-surface-elevated border border-border px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] text-text-primary shadow-sm leading-relaxed whitespace-pre-wrap' 
                      : 'w-full'}`
                  }>
                    {msg.role === 'assistant' ? renderAIResponse(msg) : msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4 md:gap-6 flex-row">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-sm bg-gradient-to-tr from-primary to-primary-hover ring-4 ring-primary/10">
                <Bot size={18} />
              </div>
              <div className="flex flex-col w-full max-w-sm">
                <div className="bg-surface border border-border p-4 md:p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-[13px] font-semibold text-primary">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="uppercase tracking-wider text-[11px]">Analyzing your data...</span>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-3 text-xs font-medium text-text-muted">
                      <Database size={14} className="opacity-60" />
                      <span>Finding relevant tables & columns</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-text-muted">
                      <Bot size={14} className="opacity-60" />
                      <span>Generating SQL query</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggested Queries */}
          {!isLoading && (
            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Suggested queries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isLoading) onSendMessage(q);
                    }}
                    disabled={isLoading}
                    className="text-[13px] py-2 px-4 bg-surface hover:bg-surface-elevated border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all shadow-sm disabled:opacity-50 text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 bg-background border-t border-border/50 p-4 z-10">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
