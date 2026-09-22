import React from 'react';
import { CheckCircle2, AlertTriangle, Info, Rows, Columns, CopyX, HelpCircle } from 'lucide-react';

interface DataCleaningUIProps {
  report: any;
  issues: string[];
}

export const DataCleaningUI: React.FC<DataCleaningUIProps> = ({ report, issues }) => {
  return (
    <div className="flex flex-col space-y-6">
      
      {/* Information Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Rows size={16} className="group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Rows</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{report.rows_after?.toLocaleString() || 0}</span>
        </div>
        
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Columns size={16} className="group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Columns</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{report.columns_after?.toLocaleString() || 0}</span>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-warning/50 transition-all">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <CopyX size={16} className="group-hover:text-warning transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Duplicates</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{report.potential_issues?.duplicate_rows?.toLocaleString() || 0}</span>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-error/50 transition-all">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <HelpCircle size={16} className="group-hover:text-error transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Missing Values</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{report.potential_issues?.missing_values?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Safe Changes Section */}
        <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-success-bg/50 border-b border-border/50 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={16} />
            </div>
            <h3 className="font-bold text-text-primary tracking-tight">Safe Changes</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" /> 
                <span className="text-text-secondary">Whitespaces automatically trimmed from <span className="font-medium text-text-primary">{report.safe_changes?.whitespace_trimmed?.toLocaleString() || 0}</span> cells</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" /> 
                <span className="text-text-secondary"><span className="font-medium text-text-primary">{report.safe_changes?.empty_rows_removed?.toLocaleString() || 0}</span> completely empty rows removed</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" /> 
                <span className="text-text-secondary"><span className="font-medium text-text-primary">{report.safe_changes?.column_names_normalized?.toLocaleString() || 0}</span> column names normalized to lowercase and underscores</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Requires Review Section */}
        <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-warning-bg/30 border-b border-border/50 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle size={16} />
            </div>
            <h3 className="font-bold text-text-primary tracking-tight">Requires Review</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3 text-[14px]">
              {issues.length > 0 ? (
                issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{issue}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-3 text-text-muted italic">
                  <Info size={16} className="opacity-50" />
                  No major issues found requiring review.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
