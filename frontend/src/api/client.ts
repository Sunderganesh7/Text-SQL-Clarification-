const API_BASE = typeof import.meta.env.VITE_API_BASE_URL === 'string'
  ? import.meta.env.VITE_API_BASE_URL
  : "http://127.0.0.1:8001";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  results?: any[];
  error?: string;
  clarification_needed?: boolean;
  options?: string[];
}

export interface UploadedDataset {
  id: number;
  file_name: string;
  table_name: string;
  row_count: number;
  column_count: number;
  upload_time: string;
  status: string;
}

export const api = {
  getTables: async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE}/database/tables`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch tables');
      return res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },
  
  getSchema: async () => {
    const timestamp = new Date().getTime();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${API_BASE}/database/schema?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      if (!res.ok) throw new Error('Failed to fetch schema');
      return res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },
  
  getDatasets: async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE}/data/datasets`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch datasets');
      return res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },
  
  deleteDataset: async (id: number) => {
    const res = await fetch(`${API_BASE}/data/datasets/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete dataset');
    return res.json();
  },
  
  uploadData: async (file: File) => {
    console.log(`[Upload] File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    const url = `${API_BASE}/data/upload`;
    console.log(`[Upload] URL: ${url}`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Upload Error] Status: ${res.status}, Body: ${errorText}`);
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  
  cleanData: async (file: File, config: any) => {
    console.log(`[Clean] File: ${file.name}`);
    const url = `${API_BASE}/data/clean`;
    console.log(`[Clean] URL: ${url}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));
    
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Clean Error] Status: ${res.status}, Body: ${errorText}`);
      throw new Error(`Clean failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  
  query: async (question: string, sessionId?: string, clarification?: string, activeDataset?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId, clarification, active_dataset: activeDataset }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error('Query failed');
      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
