'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'select' | 'multiselect' | 'confirm' | 'preview';
}

export function ChatMessage({ role, content, timestamp, type = 'text' }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-slate-200 text-slate-700"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", "max-w-[75%]")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 shadow-sm",
            isUser
              ? "bg-blue-500 text-white"
              : "bg-white border border-slate-200 text-slate-900"
          )}
        >
          <div className={cn("prose prose-sm max-w-none", isUser && "prose-invert")}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-2">{children}</ul>,
                ol: ({ children }) => <ol className="my-2">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                code: ({ children }) => (
                  <code className={cn(
                    "px-1 py-0.5 rounded text-sm",
                    isUser ? "bg-blue-600" : "bg-slate-100"
                  )}>
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-500 mt-1 px-1">
          {timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}
