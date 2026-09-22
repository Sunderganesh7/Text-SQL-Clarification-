import React from 'react';
import { Database, Lightbulb, ChevronUp, TableProperties, Check, Activity } from 'lucide-react';

interface DatasetOverviewProps {
  activeDataset: string;
  tables: string[];
}

export const DatasetOverview: React.FC<DatasetOverviewProps> = ({ activeDataset, tables }) => {
  const displayDataset = activeDataset || "Default (Built-in)";
  const builtInTables = ['customers', 'orders', 'order_items', 'products'];
  
  const activeTables = activeDataset 
    ? [activeDataset] 
    : tables.filter(t => builtInTables.includes(t));

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border/50">
      <div className="p-5 border-b border-border flex items-center gap-3 flex-shrink-0 bg-background/50">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database size={16} className="text-primary" />
        </div>
        <h3 className="text-[15px] font-bold text-text-primary tracking-tight">Dataset Overview</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
        
        {/* Dataset Metadata */}
        <div className="flex flex-col">
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Active Context</h4>
          <div className="bg-surface-elevated border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <TableProperties size={18} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold text-text-primary truncate" title={displayDataset}>
                {displayDataset}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  {activeTables.length} {activeTables.length === 1 ? 'Table' : 'Tables'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-success-bg border border-success/30 rounded-xl p-4 flex gap-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4"></div>
          <Activity size={18} className="text-success mt-0.5 flex-shrink-0 animate-pulse" />
          <div className="flex flex-col gap-1 relative z-10">
            <h4 className="text-[13px] font-bold text-success uppercase tracking-wider">System Ready</h4>
            <p className="text-[13px] text-success/80 font-medium leading-relaxed">Schema and context are loaded. Ready for natural-language analysis.</p>
          </div>
        </div>

        {/* Tables List */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Included Tables</h4>
            <ChevronUp size={14} className="text-text-muted" />
          </div>
          
          <div className="flex flex-col gap-2">
            {activeTables.map(t => (
              <div key={t} className="flex items-center justify-between p-3 bg-surface border border-border/50 rounded-lg hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-3 overflow-hidden text-text-secondary">
                  <div className="w-6 h-6 rounded bg-surface-elevated flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <TableProperties size={12} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[13px] font-medium truncate group-hover:text-text-primary transition-colors">{t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-2 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Lightbulb size={16} className="text-primary" />
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Quick Tips</h4>
          </div>
          <ul className="text-[13px] font-medium text-text-secondary flex flex-col gap-4 pl-1">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Check size={10} strokeWidth={3} />
              </div> 
              <span>Use natural, everyday language</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Check size={10} strokeWidth={3} />
              </div> 
              <span>Be specific about your metrics</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Check size={10} strokeWidth={3} />
              </div> 
              <span>Ask for comparisons across categories</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Check size={10} strokeWidth={3} />
              </div> 
              <span>Mention specific time periods</span>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};
