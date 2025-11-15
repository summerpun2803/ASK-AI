import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm.jsx';
import ChatInterface from './components/chatInterface.jsx';
import { getToken, getUsername, setAuth, clearAuth } from './utils/auth.js';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = getToken();
    const savedUsername = getUsername();
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleAuthSuccess = (token, username) => {
    setAuth(token, username);
    setIsLoggedIn(true);
    setUsername(username);
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUsername('');
  };

  if (!isLoggedIn) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return <ChatInterface username={username} onLogout={handleLogout} />;
}