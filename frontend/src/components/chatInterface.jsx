import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import MessageList from './MessageList.jsx';
import ChatInput from './chatInput.jsx';
import { chatService } from '../services/apiService.js';

export default function ChatInterface({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const data = await chatService.loadChats();
      const formattedMessages = data.chats.map(chat => ({
        role: chat.role,
        content: chat.reply || chat.prompt,
        imageUrl: chat.image_url,
        type: chat.type
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatService.sendMessage(currentInput);
      if (data.error) {
        alert(data.error);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          imageUrl: data.image_url
        }]);
      }
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!input.trim() || loading) {
      if (!input.trim()) alert('Please enter a prompt for image generation');
      return;
    }

    const userMessage = { role: 'user', content: `Generate image: ${input}` };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatService.generateImage(currentInput);
      if (data.error) {
        alert(data.error);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Image generated',
          imageUrl: data.image_url,
          type: 'image'
        }]);
      }
    } catch (err) {
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header username={username} onLogout={onLogout} />
      <MessageList messages={messages} loading={loading} />
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        onGenerateImage={generateImage}
        disabled={loading}
      />
    </div>
  );
}
