import React from 'react';
import type { ChatMessage } from '../../api/client';

type QueryHistoryPanelProps = {
  messages: ChatMessage[];
};

export const QueryHistoryPanel: React.FC<QueryHistoryPanelProps> = ({ messages }) => {
  const userQueries = messages.filter(
    (m) => m.role === 'user' && !m.content.startsWith('[Clarification]')
  );

  return (
    <div className="flex flex-col h-full">
      <h4 className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wider">
        Query History
      </h4>
      {userQueries.length === 0 ? (
        <div className="text-xs text-text-muted italic">No queries yet.</div>
      ) : (
        <ul className="space-y-3 overflow-y-auto flex-1">
          {userQueries.map((m, i) => (
            <li
              key={m.id}
              className="text-sm text-text bg-background p-2 rounded border border-border/50 truncate"
              title={m.content}
            >
              <span className="text-text-muted mr-2">{i + 1}.</span>
              {m.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
