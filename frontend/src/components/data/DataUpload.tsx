import React, { useCallback, useState } from 'react';
import { Upload, FileType, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface DataUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm max-w-2xl mx-auto overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Upload Dataset</h2>
          <p className="text-[15px] text-text-secondary mt-2">Import your CSV or XLSX file to begin analysis</p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer bg-background/50 group
            ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-surface-elevated'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
            ${dragActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
            <Upload size={32} className={`${dragActive || 'group-hover:animate-bounce'}`} />
          </div>
          
          <h3 className="text-[17px] font-bold text-text-primary mb-2">
            {dragActive ? 'Drop file here' : 'Drag & drop file here'}
          </h3>
          <p className="text-sm text-text-muted mb-6">or click to browse from your computer</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex items-center gap-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span className="px-3 py-1 bg-surface border border-border rounded-lg shadow-sm">CSV</span>
            <span className="px-3 py-1 bg-surface border border-border rounded-lg shadow-sm">XLSX</span>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 bg-success-bg border border-success/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-success/20 flex items-center justify-center text-success flex-shrink-0 shadow-sm">
                <FileType size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-text-primary truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <span className="text-xs text-text-muted mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <CheckCircle2 size={20} className="text-success flex-shrink-0" />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => selectedFile && onUpload(selectedFile)}
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
            className="w-full text-[15px] font-bold"
          >
            {isLoading ? 'Processing...' : (
              <span className="flex items-center gap-2">
                Upload & Clean <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
