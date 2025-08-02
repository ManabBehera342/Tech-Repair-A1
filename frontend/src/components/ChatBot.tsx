import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your repair assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        'Check repair status',
        'Submit new request',
        'FAQ',
        'Contact support'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userText: string): Message => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('status') || lowerText.includes('track')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'To check your repair status, please provide your ticket number (e.g., TR-001234). You can find this in your confirmation email.',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['I don\'t have my ticket number', 'How to find ticket number']
      };
    }
    
    if (lowerText.includes('new request') || lowerText.includes('submit')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'I can help you submit a new repair request! First, let me know what type of device needs repair:',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Energizer Power Bank', 'Gate Motor Controller', 'Power Adapter', 'Other device']
      };
    }
    
    if (lowerText.includes('faq') || lowerText.includes('question')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'Here are some frequently asked questions that might help:',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          'How long does repair take?',
          'What\'s covered under warranty?',
          'Repair costs',
          'View all FAQs'
        ]
      };
    }
    
    if (lowerText.includes('warranty')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'We provide a 90-day warranty on all repair work. If the same issue occurs within this period, we\'ll fix it free of charge. Original manufacturer warranties may also apply.',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Check device warranty', 'Contact support']
      };
    }
    
    if (lowerText.includes('cost') || lowerText.includes('price')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'Repair costs vary by device and issue. We offer free diagnostics and will provide a detailed estimate before starting work. Most repairs range from $50-200.',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Get estimate', 'Submit repair request']
      };
    }
    
    if (lowerText.includes('contact') || lowerText.includes('support')) {
      return {
        id: (Date.now() + 1).toString(),
        text: 'You can reach our support team at:\n📧 support@techrepair.com\n📞 1-800-REPAIR-1\n⏰ Mon-Fri 9AM-6PM EST',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Submit a ticket', 'Schedule callback']
      };
    }
    
    // Default response
    return {
      id: (Date.now() + 1).toString(),
      text: 'I\'m here to help with repair requests, status updates, and general questions. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        'Check repair status',
        'Submit new request',
        'FAQ',
        'Contact support'
      ]
    };
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Repair Assistant</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[70%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {message.sender === 'user' ? 
                        <User className="w-3 h-3" /> : 
                        <Bot className="w-3 h-3" />
                      }
                    </div>
                    <div className={`rounded-2xl px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Replies */}
                {message.quickReplies && message.sender === 'bot' && (
                  <div className="flex flex-wrap gap-2">
                    {message.quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;