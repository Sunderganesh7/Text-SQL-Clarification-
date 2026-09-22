import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { ChatHistoryPanel } from './components/chat/ChatHistoryPanel';
import { DatasetOverview } from './components/data/DatasetOverview';
import { DataUpload } from './components/data/DataUpload';
import { DataCleaningUI } from './components/data/DataCleaningUI';
import { DatasetManager } from './components/data/DatasetManager';
import { SchemaViewer } from './components/schema/SchemaViewer';
import { api } from './api/client';
import type { ChatMessage } from './api/client';
import { v4 as uuidv4 } from 'uuid';
import { HelpPage } from './components/layout/HelpPage';

type Tab = 'chat' | 'data' | 'schema' | 'history' | 'help';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [previousTab, setPreviousTab] = useState<Tab>('chat');
  const [tables, setTables] = useState<string[]>([]);
  
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [sessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_session_id');
      if (saved) return saved;
    } catch {}
    const newSessionId = uuidv4();
    localStorage.setItem('chat_session_id', newSessionId);
    return newSessionId;
  });
  
  // Dynamic Datasets state
  const [activeDataset, setActiveDataset] = useState<string>('');
  
  // Data upload state
  const [uploadReport, setUploadReport] = useState<any>(null);
  const [uploadIssues, setUploadIssues] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  useEffect(() => {
    // Set default active dataset to first uploaded table if none selected
    const uploadedTables = tables.filter(t => !['customers', 'orders', 'order_items', 'products'].includes(t));
    if (!activeDataset && uploadedTables.length > 0) {
      setActiveDataset(uploadedTables[0]);
    }
  }, [tables, activeDataset]);

  // Persist messages to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save chat history to localStorage', err);
    }
  }, [messages]);

  const fetchTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data.tables || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.query(text, sessionId, undefined, activeDataset || undefined);
      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: res.message || (res.status === 'clarification_required' ? res.question : null) || (res.status === 'success' ? 'Here are the results:' : ''),
        sql: res.sql,
        results: res.results,
        error: res.error,
        clarification_needed: res.clarification_needed || res.status === 'clarification_required',
        options: res.options // Pass options if returned from backend
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        error: err.name === 'AbortError' ? 'The request took too long. Please check that the backend and Ollama are running.' : err.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarifyResponse = async (clarification: string) => {
    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: `[Clarification]: ${clarification}` };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const lastRealUserMessage = [...messages].reverse().find(m => m.role === 'user' && !m.content.startsWith('[Clarification]'));
      
      const res = await api.query(lastRealUserMessage?.content || "Explain data", sessionId, clarification, activeDataset || undefined);
      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: res.message || (res.status === 'clarification_required' ? res.question : null) || (res.status === 'success' ? 'Here are the results:' : ''),
        sql: res.sql,
        results: res.results,
        error: res.error,
        clarification_needed: res.clarification_needed || res.status === 'clarification_required'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        error: err.name === 'AbortError' ? 'The request took too long. Please check that the backend and Ollama are running.' : err.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setUploadReport(null);
    setUploadError(null);
    try {
      const uploadRes = await api.uploadData(file);
      if (uploadRes && uploadRes.status === 'error') {
        throw new Error(uploadRes.message || "Upload failed");
      }
      const config = { mode: "safe" };
      const cleanRes = await api.cleanData(file, config);
      
      if (cleanRes && cleanRes.status === 'success') {
        setUploadReport(cleanRes.report);
        setUploadIssues(cleanRes.issues || []);
      } else if (cleanRes && cleanRes.error) {
        throw new Error(cleanRes.error);
      }
      
      fetchTables();
      window.dispatchEvent(new Event('refresh-datasets'));
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload/clean file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenHelp = () => {
    if (activeTab !== 'help') {
      setPreviousTab(activeTab);
      setActiveTab('help');
    }
  };

  return (
    <>
      <div className="layout-container">
        <Sidebar activeTab={activeTab === 'help' ? previousTab : activeTab} onTabChange={(t) => {
          if (t !== 'help') setActiveTab(t);
        }} tables={tables} />
      
        <div className="layout-main">
          {activeTab === 'chat' ? (
            <Header 
              title="Analytics Chat" 
              subtitle="Ask questions about your data in natural language"
              activeDataset={activeDataset}
              tables={tables}
              onDatasetChange={setActiveDataset}
              isDarkTheme={isDarkTheme}
              onToggleTheme={toggleTheme}
              onOpenHelp={handleOpenHelp}
            />
          ) : (
            <Header 
              title={activeTab === 'data' ? 'Data Import & Cleaning' : activeTab === 'schema' ? 'Schema Explorer' : activeTab === 'help' ? 'Help & Documentation' : 'Query History'} 
              subtitle={tables.length > 0 ? `${tables.length} tables active` : 'No data loaded'}
              isDarkTheme={isDarkTheme}
              onToggleTheme={toggleTheme}
              onOpenHelp={handleOpenHelp}
            />
          )}

          <div className="flex-1 overflow-hidden flex flex-col relative">
            {activeTab === 'chat' && (
              <div className="flex h-full w-full">
                <div className="flex-1 flex flex-col border-r border-border min-w-0">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onClearHistory={() => {
                      setMessages([]);
                      localStorage.removeItem('chat_history');
                    }}
                    onClarifyResponse={handleClarifyResponse}
                  />
                </div>
                <div className="w-80 hidden lg:block bg-surface overflow-y-auto shrink-0">
                  <DatasetOverview activeDataset={activeDataset} tables={tables} />
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="p-6 overflow-y-auto h-full w-full">
                <HelpPage onBack={() => setActiveTab(previousTab)} />
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-6 overflow-y-auto h-full w-full max-w-7xl mx-auto space-y-8">
                {uploadError && (
                  <div className="bg-error-bg text-error p-4 rounded-xl border border-error/20 flex items-center shadow-sm">
                    <span className="font-semibold mr-2">Error:</span> {uploadError}
                  </div>
                )}
                {!uploadReport ? (
                  <div className="space-y-8">
                    <DataUpload onUpload={handleUpload} isLoading={isLoading} />
                    <DatasetManager onRefreshSchema={fetchTables} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-primary">Import Complete</h2>
                      <button 
                        className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-elevated transition-colors"
                        onClick={() => { setUploadReport(null); fetchTables(); }}
                      >
                        Upload Another
                      </button>
                    </div>
                    <DataCleaningUI report={uploadReport} issues={uploadIssues} />
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'schema' && (
              <div className="p-6 overflow-y-auto h-full w-full max-w-7xl mx-auto">
                <SchemaViewer />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="h-full w-full py-6 px-6">
                <ChatHistoryPanel messages={messages} activeMessageId={undefined} onSelectMessage={() => {}} onClearHistory={() => setMessages([])} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
