import React from 'react';
import { Database, Upload, MessageSquare, Clock, TableProperties, BarChart2 } from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'data' | 'schema' | 'history' | 'help';
  onTabChange: (tab: 'chat' | 'data' | 'schema' | 'history' | 'help') => void;
  tables: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, tables }) => {
  const builtInTablesList = ['customers', 'orders', 'order_items', 'products'];
  const uploadedTables = tables.filter(t => !builtInTablesList.includes(t));
  const builtInTables = tables.filter(t => builtInTablesList.includes(t));

  return (
    <div className="layout-sidebar h-full flex flex-col">
      <div className="p-6 shrink-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="text-primary" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-text-primary">DataInsight AI</h1>
            <span className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider font-semibold">Enterprise Analytics</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        <div className="space-y-1.5">
          <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Workspace</h3>
          
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'chat' ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}
            onClick={() => onTabChange('chat')}
          >
            <MessageSquare size={18} className={activeTab === 'chat' ? 'text-primary' : 'opacity-70'} />
            <span>Analytics Chat</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'data' ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}
            onClick={() => onTabChange('data')}
          >
            <Upload size={18} className={activeTab === 'data' ? 'text-primary' : 'opacity-70'} />
            <span>Data Import</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'schema' ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}
            onClick={() => onTabChange('schema')}
          >
            <Database size={18} className={activeTab === 'schema' ? 'text-primary' : 'opacity-70'} />
            <span>Schema Explorer</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}
            onClick={() => onTabChange('history')}
          >
            <Clock size={18} className={activeTab === 'history' ? 'text-primary' : 'opacity-70'} />
            <span>Query History</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Datasets</h3>
          </div>
          
          {uploadedTables.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted italic">No uploaded datasets</div>
          ) : (
            <div className="space-y-1">
              {uploadedTables.map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary group">
                  <TableProperties size={14} className="opacity-50 group-hover:text-primary transition-colors" />
                  <span className="truncate group-hover:text-text-primary transition-colors">{t}</span>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-border/50 hover:border-primary/30"
            onClick={() => onTabChange('data')}
          >
            <span className="text-lg leading-none font-light">+</span>
            New Dataset
          </button>
        </div>

        {builtInTables.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">System Tables</h3>
            <div className="space-y-1">
              {builtInTables.map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted/60 cursor-default">
                  <Database size={14} className="opacity-40" />
                  <span className="truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="shrink-0 p-4 border-t border-border/50 bg-background/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-elevated cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-background">
            SG
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm text-text-primary font-medium truncate">Sunderganesh</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] text-text-muted font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

