import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Moon, Sun, Database, MessageSquare, ChevronDown, Activity, Search, Check } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  activeDataset?: string;
  tables?: string[];
  onDatasetChange?: (dataset: string) => void;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  activeDataset, 
  tables = [], 
  onDatasetChange,
  isDarkTheme,
  onToggleTheme,
  onOpenHelp
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const systemTables = ['customers', 'orders', 'order_items', 'products'];
  const userTables = tables.filter(t => !systemTables.includes(t));
  
  const filteredTables = userTables.filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSelectDataset = (dataset: string) => {
    if (onDatasetChange) {
      onDatasetChange(dataset);
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="layout-header shadow-sm relative z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-inner">
          <MessageSquare size={18} className="text-primary" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[1.05rem] font-bold text-text-primary tracking-tight leading-tight">{title}</h2>
          <span className="text-xs text-text-muted font-medium">{subtitle}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {onDatasetChange && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl px-3 py-1.5 shadow-sm group hover:border-border-hover transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <Database size={16} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              <div className="flex flex-col w-40">
                <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Database / Dataset</span>
                <span className="text-[13px] font-semibold text-text-primary truncate">
                  {activeDataset || "Default (Built-in)"}
                </span>
              </div>
              <ChevronDown size={14} className={`text-text-muted shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-72 bg-surface border border-border rounded-xl shadow-lg overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-border/50 bg-background/50">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-2 px-1">Select Dataset</div>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted" />
                    <input 
                      type="text" 
                      placeholder="Search datasets..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-surface-elevated border border-border text-text-primary text-[13px] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-primary/50 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                  {!searchQuery && (
                    <div className="mb-2">
                      <div className="text-[10px] text-text-muted font-bold tracking-wider uppercase px-3 py-1.5 mt-1">Built-in</div>
                      <button 
                        onClick={() => handleSelectDataset("")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${!activeDataset ? 'bg-primary/10 text-primary' : 'hover:bg-surface-elevated text-text-primary'}`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Database size={14} className={!activeDataset ? 'text-primary' : 'text-text-muted'} />
                          <div className="flex flex-col truncate">
                            <span className="text-[13px] font-medium truncate">Default</span>
                            <span className="text-[11px] text-text-muted">Built-in dataset</span>
                          </div>
                        </div>
                        {!activeDataset && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    </div>
                  )}
                  
                  {filteredTables.length > 0 && (
                    <div>
                      <div className="text-[10px] text-text-muted font-bold tracking-wider uppercase px-3 py-1.5">Uploaded Datasets</div>
                      {filteredTables.map(t => (
                        <button 
                          key={t}
                          onClick={() => handleSelectDataset(t)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors mb-0.5 ${activeDataset === t ? 'bg-primary/10 text-primary' : 'hover:bg-surface-elevated text-text-primary'}`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Database size={14} className={activeDataset === t ? 'text-primary' : 'text-text-muted'} />
                            <span className="text-[13px] font-medium truncate" title={t}>{t}</span>
                          </div>
                          {activeDataset === t && <Check size={14} className="text-primary shrink-0 ml-2" />}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {filteredTables.length === 0 && searchQuery && (
                    <div className="px-4 py-6 text-center text-[13px] text-text-muted">
                      No datasets found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-1.5 bg-success-bg border border-success/30 rounded-full px-3 py-1 text-success shadow-sm">
           <Activity size={14} className="animate-pulse" />
           <span className="text-[11px] font-bold uppercase tracking-wide">Connected</span>
        </div>
        
        <div className="w-px h-6 bg-border mx-1"></div>
        
        <button 
          className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50" 
          title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={onToggleTheme}
        >
          {isDarkTheme ? <Sun size={18} strokeWidth={2} className="text-primary" /> : <Moon size={18} strokeWidth={2} />}
        </button>
        <button 
          className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50" 
          title="Help"
          onClick={onOpenHelp}
        >
          <HelpCircle size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

