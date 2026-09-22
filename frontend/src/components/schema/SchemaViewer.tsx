import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../api/client';
import { Database, Key, CheckCircle2, Search, Table2, Link as LinkIcon, DatabaseZap, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

interface SchemaColumn {
  name: string;
  data_type: string;
  nullable: boolean;
  primary_key: boolean;
  default: any;
}

interface SchemaForeignKey {
  constrained_columns: string[];
  referred_table: string;
  referred_columns: string[];
}

interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
  foreign_keys: SchemaForeignKey[];
}

interface SchemaData {
  database: string;
  tables: SchemaTable[];
}

export const SchemaViewer: React.FC = () => {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSchema = () => {
    setIsLoading(true);
    api.getSchema()
      .then(data => {
        setSchema(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSchema();
    const handleRefresh = () => fetchSchema();
    window.addEventListener('refresh-datasets', handleRefresh);
    return () => window.removeEventListener('refresh-datasets', handleRefresh);
  }, []);

  // Handle selected table auto-selection when schema changes
  useEffect(() => {
    if (schema && schema.tables && schema.tables.length > 0) {
      const tableNames = schema.tables.map(t => t.name);
      if (!selectedTableName || !tableNames.includes(selectedTableName)) {
        setSelectedTableName(tableNames[0]);
      }
    } else {
      setSelectedTableName(null);
    }
  }, [schema, selectedTableName]);

  // Derived Summary Stats
  const { totalTables, totalColumns } = useMemo(() => {
    if (!schema || !schema.tables) return { totalTables: 0, totalColumns: 0 };
    let cols = 0;
    schema.tables.forEach(table => {
      cols += table.columns?.length || 0;
    });
    return { 
      totalTables: schema.tables.length, 
      totalColumns: cols 
    };
  }, [schema]);

  // Search filtering
  const filteredTables = useMemo(() => {
    if (!schema || !schema.tables) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return schema.tables.filter(table => {
      if ((table.name || '').toLowerCase().includes(lowerQuery)) return true;
      // Search in columns
      if (table.columns && table.columns.some(col => (col.name || '').toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  }, [schema, searchQuery]);

  if (isLoading && !schema) return (
    <div className="flex flex-col items-center justify-center p-12 text-text-muted bg-surface border border-border border-dashed rounded-2xl shadow-sm m-6 h-[calc(100vh-8rem)]">
      <Loader2 size={32} className="animate-spin text-primary mb-4" />
      <span className="font-medium text-[15px]">Loading schema...</span>
    </div>
  );
  if (!schema || !schema.tables) return (
    <div className="flex flex-col items-center justify-center p-12 text-error bg-error-bg border border-error/20 rounded-2xl shadow-sm m-6 h-[calc(100vh-8rem)]">
      <AlertTriangle size={32} className="mb-4" />
      <span className="font-medium text-[15px]">Failed to load schema</span>
    </div>
  );

  const currentTableDef = schema.tables.find(t => t.name === selectedTableName) || null;
  const hasPrimaryKey = currentTableDef?.columns?.some(c => c.primary_key);

  return (
    <div className="flex h-full w-full bg-background rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-surface border-r border-border h-full">
        <div className="flex flex-col p-5 border-b border-border/50 bg-background/50">
          <h3 className="flex items-center gap-2 font-bold text-lg text-text-primary mb-4 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
              <Database size={16} />
            </div>
            Database Schema
          </h3>
          <div className="relative flex items-center bg-surface border border-border rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search size={16} className="text-text-muted mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="w-full text-[14px] outline-none bg-transparent text-text-primary placeholder:text-text-muted font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-1">
          {filteredTables.length > 0 ? (
            filteredTables.map(table => (
              <button 
                key={table.name} 
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left group
                  ${selectedTableName === table.name 
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20' 
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent'
                  }`}
                onClick={() => setSelectedTableName(table.name)}
              >
                <Table2 size={16} className={`${selectedTableName === table.name ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'}`} />
                <span className="truncate text-[14px]">{table.name}</span>
              </button>
            ))
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <Table2 size={24} className="text-text-muted opacity-50 mb-3" />
              <div className="text-text-secondary text-sm font-medium">No tables found matching "{searchQuery}"</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
        <div className="flex items-center justify-between p-6 md:px-8 border-b border-border/50 bg-surface/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Overview</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg shadow-sm">
                <Database size={14} className="text-primary" />
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Tables:</span>
                <span className="text-[13px] font-bold text-text-primary">{totalTables}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg shadow-sm">
                <Table2 size={14} className="text-primary" />
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Columns:</span>
                <span className="text-[13px] font-bold text-text-primary">{totalColumns}</span>
              </div>
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-border border border-border rounded-lg text-[13px] font-semibold text-text-primary transition-colors shadow-sm disabled:opacity-50"
            onClick={() => {
              window.dispatchEvent(new Event('refresh-datasets'));
            }}
            disabled={isLoading}
          >
            <Loader2 size={14} className={`${isLoading ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
          {currentTableDef ? (
            <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
                      <DatabaseZap size={20} />
                    </div>
                    {selectedTableName}
                  </h2>
                </div>
                <div className="flex gap-4 bg-surface border border-border p-2 rounded-xl shadow-sm">
                   <div className="flex flex-col items-center px-4 py-1 border-r border-border/50">
                     <span className="text-xl font-bold text-primary">{currentTableDef.columns?.length || 0}</span>
                     <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Columns</span>
                   </div>
                   <div className="flex flex-col items-center px-4 py-1">
                     <span className="text-xl font-bold text-primary">{currentTableDef.foreign_keys?.length || 0}</span>
                     <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Foreign Keys</span>
                   </div>
                </div>
              </div>

              {!hasPrimaryKey && currentTableDef.columns && currentTableDef.columns.length > 0 && (
                <div className="p-4 bg-warning-bg/50 text-warning text-sm font-medium border border-warning/20 rounded-xl flex items-center gap-3 shadow-sm">
                  <AlertTriangle size={18} />
                  No primary key detected in this table. This might affect certain SQL operations.
                </div>
              )}

              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-full">
                    <thead className="bg-surface-elevated border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/3">Column Name</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/4">Data Type</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-5/12">Constraints / Keys</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {currentTableDef.columns?.map(col => {
                        const isFK = currentTableDef.foreign_keys?.find(fk => (fk.constrained_columns || []).includes(col.name));
                        return (
                          <tr key={col.name} className="hover:bg-primary/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-[14px] text-text-primary">{col.name}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10 font-semibold tracking-wide uppercase">
                                {col.data_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex flex-wrap gap-2">
                                  {col.primary_key && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary px-2 py-1 rounded-md tracking-wider" title="Primary Key">
                                      <Key size={12} /> PK
                                    </span>
                                  )}
                                  {isFK && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/20 border border-primary/20 px-2 py-1 rounded-md tracking-wider" title="Foreign Key">
                                      <LinkIcon size={12} /> FK
                                    </span>
                                  )}
                                  {!col.nullable && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success-bg border border-success/20 px-2 py-1 rounded-md tracking-wider" title="Not Null">
                                      <CheckCircle2 size={12} /> NOT NULL
                                    </span>
                                  )}
                                  {!col.primary_key && !isFK && col.nullable && <span className="text-text-muted font-medium text-xs py-1 px-2">-</span>}
                                </div>
                                {isFK && (
                                  <div className="text-[12px] text-text-secondary mt-1 flex items-center gap-2 font-mono bg-surface-elevated px-2.5 py-1 rounded-md w-max border border-border/50 shadow-sm">
                                    <span className="text-text-muted">References</span>
                                    <ArrowRight size={12} className="text-primary" />
                                    <span className="font-semibold text-primary">{isFK.referred_table || 'unknown'}</span>
                                    <span className="text-text-muted">.</span>
                                    <span className="text-text-primary">{(isFK.referred_columns || []).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!currentTableDef.columns || currentTableDef.columns.length === 0) && (
                        <tr>
                          <td colSpan={3} className="text-center py-12 text-text-muted">
                            <div className="flex flex-col items-center justify-center">
                              <Table2 size={32} className="opacity-20 mb-3" />
                              <span>No columns found for this table.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-surface-elevated rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-border opacity-50">
                <Table2 size={40} className="text-text-muted" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">No Table Selected</h3>
              <p className="text-[15px] text-text-secondary max-w-sm leading-relaxed">
                Select a table from the sidebar to view its schema details, columns, and relationships.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
