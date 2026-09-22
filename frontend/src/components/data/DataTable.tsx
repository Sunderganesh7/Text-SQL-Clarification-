import React from 'react';
import { Database } from 'lucide-react';

interface DataTableProps {
  data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-muted bg-surface border border-border border-dashed rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center mb-3">
          <Database size={24} className="opacity-50" />
        </div>
        <span className="font-medium">No results to display.</span>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-text-muted font-mono text-[11px] bg-surface-elevated px-1.5 py-0.5 rounded">NULL</span>;
    if (typeof val === 'number') {
      // Format number with commas, up to 2 decimal places if it has decimals
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
      }).format(val);
    }
    return String(val);
  };

  const isNumericCol = (col: string) => {
    // Check first few rows to see if mostly numbers
    let numCount = 0;
    const sampleSize = Math.min(data.length, 5);
    for (let i = 0; i < sampleSize; i++) {
      if (typeof data[i][col] === 'number') numCount++;
    }
    return numCount > sampleSize / 2;
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm bg-surface">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className="bg-surface-elevated border-b border-border/50">
          <tr>
            {columns.map((col) => (
              <th 
                key={col} 
                className={`px-5 py-3.5 text-[11px] font-bold text-text-muted uppercase tracking-wider ${isNumericCol(col) ? 'text-right' : ''}`}
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors group">
              {columns.map((col) => (
                <td 
                  key={col} 
                  className={`px-5 py-3 text-[13px] text-text-primary ${isNumericCol(col) ? 'text-right font-medium font-mono text-[12px]' : ''}`}
                >
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
