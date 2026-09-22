import React from 'react';

interface ResultTableProps {
  data: Record<string, unknown>[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    
    if (typeof value === 'number') {
      // Format large numbers with commas, but keep small ones as is
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
      }).format(value);
    }
    
    if (typeof value === 'string') {
      // Check if string looks like an ISO date
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (dateRegex.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch {}
      }
      return value;
    }
    
    return String(value);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm bg-surface">
      <table className="w-full border-collapse text-[13px] text-left">
        <thead className="bg-surface-elevated sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th 
                key={col} 
                className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-r border-border/50 last:border-r-0 whitespace-nowrap"
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors group">
              {columns.map(col => {
                const rawVal = row[col];
                const formattedVal = formatValue(rawVal);
                const isNumber = typeof rawVal === 'number';
                
                return (
                  <td 
                    key={col} 
                    className={`px-4 py-2.5 text-text-primary whitespace-nowrap border-r border-border/30 last:border-r-0 group-hover:border-border/50 transition-colors ${isNumber ? 'tabular-nums text-right' : ''}`}
                    title={String(rawVal)}
                  >
                    <div className="max-w-[250px] truncate">
                      {formattedVal}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
