import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename?: string;
}

function safeValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const columns = Object.keys(data[0]);
  const rows = [
    columns.join(','),
    ...data.map(row =>
      columns.map(col => {
        const v = safeValue(row[col]);
        // Escape double quotes and wrap if contains comma/quote/newline
        const escaped = v.replace(/"/g, '""');
        return /[,"\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ];
  const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportExcel(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');
  XLSX.writeFile(wb, filename + '.xlsx');
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename = 'datainsight-query-results' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasData = data && data.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => hasData ? setOpen(o => !o) : undefined}
        disabled={!hasData}
        title={hasData ? 'Export results' : 'No results to export'}
        className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider px-3 py-1.5 bg-surface border border-border rounded-lg hover:border-primary/50 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        <Download size={13} />
        Export
        <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && hasData && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-surface border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px] py-1">
          <button
            onClick={() => { exportCSV(data, filename); setOpen(false); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-[13px] text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <FileText size={14} className="text-text-muted" />
            Export CSV
          </button>
          <button
            onClick={() => { exportExcel(data, filename); setOpen(false); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-[13px] text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <FileSpreadsheet size={14} className="text-text-muted" />
            Export Excel
          </button>
        </div>
      )}
    </div>
  );
};
