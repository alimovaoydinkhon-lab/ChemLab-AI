import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, MessageCircle } from 'lucide-react';
import { sendGeneralChatMessage } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { translations } from '../utils/translations';

interface GeneralChatProps {
  language: Language;
}

const GeneralChat: React.FC<GeneralChatProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await sendGeneralChatMessage(history, userMsg.text, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-slate-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden h-[85vh]">
        {/* Header */}
        <div className="bg-academic-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-academic-700 rounded-lg">
              <MessageCircle className="w-6 h-6 text-academic-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t.genChatTitle}</h2>
              <p className="text-xs text-academic-200">Powered by Gemini 3 Pro</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="p-2 hover:bg-academic-700 rounded-full transition-colors text-academic-200 hover:text-white"
            title={t.clearChat}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
               <Bot className="w-16 h-16 mb-4 text-slate-300" />
               <h3 className="text-xl font-serif text-slate-600 mb-2">{t.howCanIHelp}</h3>
               <p className="max-w-md text-sm">{t.howCanIHelpDesc}</p>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-academic-600' : 'bg-white border border-slate-200'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-academic-600" />}
                </div>
                
                <div 
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-academic-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full">
               <div className="flex gap-3 max-w-[70%]">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-academic-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 pr-12 text-slate-800 focus:ring-2 focus:ring-academic-500 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-academic-600 text-white rounded-lg hover:bg-academic-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneralChat;