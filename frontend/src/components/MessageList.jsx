import React, { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 shadow-sm border border-gray-200 rounded-2xl px-4 py-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-gray-500 mt-20">
      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-lg font-medium">No messages yet</p>
      <p className="text-sm">Start a conversation or generate an image!</p>
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-800 shadow-sm border border-gray-200'
        }`}
      >
        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Generated"
            className="mt-2 rounded-lg max-w-full"
          />
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && <EmptyState />}
      
      {messages.map((msg, idx) => (
        <Message key={idx} message={msg} />
      ))}
      
      {loading && <LoadingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
