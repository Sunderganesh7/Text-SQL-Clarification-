import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  datasetName: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  datasetName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="absolute right-4 top-4">
          <button
            className="text-text-muted hover:text-text-primary bg-surface-elevated hover:bg-border rounded-full p-1.5 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 mb-6 border border-error/20">
            <AlertTriangle className="text-error" size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-text-primary mb-2">Delete Dataset?</h3>
          <p className="text-text-secondary mb-1">Are you sure you want to delete:</p>
          <p className="font-semibold text-text-primary mb-4 bg-surface-elevated p-2 rounded-lg border border-border">{datasetName}</p>
          
          <div className="text-sm text-text-muted mb-6 bg-error/5 p-4 rounded-xl border border-error/10">
            <p className="font-semibold text-error mb-2">This will permanently remove:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Imported MySQL table</li>
              <li>Dataset metadata</li>
              <li>Schema information</li>
              <li>RAG metadata</li>
            </ul>
            <p className="mt-3 font-semibold">This action cannot be undone.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-medium text-text-primary bg-surface-elevated hover:bg-border border border-border transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-lg font-medium text-white bg-error hover:bg-red-600 focus:ring-2 focus:ring-error/50 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : 'Delete Dataset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
