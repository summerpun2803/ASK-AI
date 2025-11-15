import React from 'react';
import { MessageSquare, User, LogOut } from 'lucide-react';

export default function Header({ username, onLogout }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-800">AskLumen</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
          <User className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-600">{username}</span>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}