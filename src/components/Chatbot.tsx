import React, { useState } from 'react';
import { Bot, MessageSquare, SendHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Exported for unit testing
export function validateMessageInput(message: string): boolean {
  return message.trim().length > 0;
}

export type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateMessageInput(inputValue)) {
      setError('Message cannot be empty.');
      return;
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const newBotMsg: ChatMessage = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: 'This is a mocked AI response.',
      };
      setMessages((prev) => [...prev, newBotMsg]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="mt-auto pt-6 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-[#6D4AFF]" />
        <span className="text-sm font-semibold text-[#F8FAFC]">Agent Command</span>
      </div>
      
      {/* Message Display Area */}
      <div 
        className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] flex flex-col gap-3 custom-scrollbar pr-2"
        data-testid="message-list"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
               "p-3 rounded-xl max-w-[90%] text-sm",
               msg.sender === 'user' 
                 ? "self-end bg-[#6D4AFF]/20 border border-[#6D4AFF]/30 text-white" 
                 : "self-start bg-black/40 border border-white/5 text-[#94A3B8]"
            )}
            data-testid={`message-${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
           <div className="self-start bg-black/40 border border-white/5 text-[#00F5D4] p-3 rounded-xl max-w-[80%] text-sm animate-pulse">
             Typing...
           </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-2 relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            placeholder="Type a message"
            className={cn(
              "w-full bg-black/30 border rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]",
              error ? "border-[#FF4D6D] focus:ring-[#FF4D6D] focus:border-[#FF4D6D]" : "border-white/10 focus:ring-[#00F5D4] focus:border-[#00F5D4]"
            )}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-[#94A3B8] hover:text-[#00F5D4] disabled:opacity-50 transition-colors"
            disabled={isLoading}
            data-testid="send-button"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <span className="text-xs text-[#FF4D6D] px-1" data-testid="error-message">{error}</span>
        )}
      </form>
    </div>
  );
}
