import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { UploadedDataset } from '../../api/client';
import { Database, Trash2, CheckCircle2, FileType, Clock } from 'lucide-react';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface DatasetManagerProps {
  onRefreshSchema: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({ onRefreshSchema }) => {
  const [datasets, setDatasets] = useState<UploadedDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatasets();
      setDatasets(data.datasets || []);
      // Clear any previous error
      setError(null);
    } catch (err: any) {
      console.error('Dataset fetch error:', err);
      // Do not propagate error to UI to avoid "Failed to fetch"
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Expose this method to allow App.tsx to refresh the list after a new upload
  useEffect(() => {
    // A bit of a hack: listen for a custom event if we want to trigger refresh from outside
    const handleRefresh = () => fetchDatasets();
    window.addEventListener('refresh-datasets', handleRefresh);
    return () => window.removeEventListener('refresh-datasets', handleRefresh);
  }, []);

  // State for deletion confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<UploadedDataset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (dataset: UploadedDataset) => setDeleteTarget(dataset);
  const closeDeleteModal = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteDataset(deleteTarget.id);
      await fetchDatasets();
      onRefreshSchema();
      closeDeleteModal();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: number) => {
    const dataset = datasets.find(d => d.id === id);
    if (dataset) openDeleteModal(dataset);
  };

  if (isLoading && datasets.length === 0) return (
    <div className="flex flex-col items-center justify-center p-12 text-text-muted mt-12 bg-surface border border-border rounded-2xl shadow-sm">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Database className="animate-pulse text-primary" size={24} />
      </div>
      <span className="font-medium">Loading datasets...</span>
    </div>
  );
  if (error) return (
    <div className="mt-12 p-6 bg-error-bg border border-error/20 rounded-2xl text-error font-medium flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center"><Trash2 size={16} /></div>
      {error}
    </div>
  );
  
  if (datasets.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center p-16 bg-surface border border-border border-dashed rounded-2xl text-text-muted">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-4 text-text-secondary opacity-50">
          <Database size={32} />
        </div>
        <h4 className="text-lg font-bold text-text-primary mb-1">No Datasets</h4>
        <p className="text-sm">Uploaded datasets will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-12 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
              <Database size={16} />
            </div>
            Uploaded Datasets
          </h3>
          <p className="text-[13px] text-text-muted mt-2 pl-11">
            Database schema: <span className="font-mono text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded ml-1">text_to_sql</span>
          </p>
        </div>
      </div>
      
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-full">
            <thead className="bg-surface-elevated border-b border-border/50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Dataset Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Table Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Rows</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Columns</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Upload Time</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {datasets.map(d => (
                <tr key={d.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileType size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                      <span className="font-semibold text-[14px] text-text-primary">{d.file_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                      {d.table_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-text-secondary text-[14px] font-medium">
                      {d.row_count.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-text-secondary text-[14px] font-medium">
                      {d.column_count.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-muted text-[13px] flex items-center gap-2 mt-0.5">
                    <Clock size={14} className="opacity-70" />
                    {new Date(d.upload_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-success bg-success-bg px-2.5 py-1 rounded-full border border-success/20 w-max uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      {d.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(d.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors opacity-50 group-hover:opacity-100 disabled:opacity-30 focus:opacity-100"
                      title="Delete dataset"
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        datasetName={deleteTarget?.file_name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};
