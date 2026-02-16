import React, { useState } from 'react';
import { ExperimentData, Role, ChatMessage, Language } from '../../types';
import AssemblyCanvas from './AssemblyCanvas';
import { sendExperimentChatMessage } from '../../services/geminiService';
import { Send, User, Bot, AlertOctagon, ListChecks, Beaker } from 'lucide-react';
import { translations } from '../../utils/translations';

interface ExperimentViewProps {
  data: ExperimentData;
  role: Role;
  language: Language;
  onBack: () => void;
}

const ExperimentView: React.FC<ExperimentViewProps> = ({ data, role, language, onBack }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'assembly'>('guide');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const t = translations[language];

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const apiHistory = chatHistory.map(h => ({ role: h.role, text: h.text }));
      const responseText = await sendExperimentChatMessage(apiHistory, userMsg.text, data, role, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm hover:underline">← {t.back}</button>
                <h2 className="text-2xl font-serif font-bold text-slate-800">{data.title}</h2>
            </div>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl truncate">{data.objective}</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'guide' ? 'bg-white text-academic-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.guideProtocol}
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'assembly' ? 'bg-white text-academic-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.virtualAssembly}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel: Content or Canvas */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {activeTab === 'guide' ? (
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              {/* Methodological Note for Teachers */}
              {role === 'teacher' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                    <GraduationCapIcon className="w-5 h-5" /> {t.methodologicalNote}
                  </h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Ensure students understand the theoretical basis of {data.title} before commencing. Focus on safety protocols regarding {data.reagents[0]}.
                  </p>
                </div>
              )}

              {/* Equipment & Reagents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                    <Beaker className="w-5 h-5 text-academic-500" /> {t.equipment}
                  </h3>
                  <ul className="space-y-2">
                    {data.equipment.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                    <AlertOctagon className="w-5 h-5 text-rose-500" /> {t.safetyReagents}
                  </h3>
                  <ul className="space-y-2">
                    {data.reagents.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="w-1.5 h-1.5 bg-rose-300 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <p className="text-xs font-bold text-rose-700 uppercase mb-1">{t.precautions}</p>
                    <ul className="list-disc list-inside text-rose-600 text-xs">
                        {data.safety.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6 text-lg">
                  <ListChecks className="w-6 h-6 text-academic-500" /> {t.procedure}
                </h3>
                <div className="space-y-6">
                  {data.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-academic-100 text-academic-700 font-bold flex items-center justify-center text-sm">
                        {i + 1}
                      </div>
                      <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Errors */}
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                 <h3 className="font-bold text-amber-900 mb-3">{t.commonErrors}</h3>
                 <ul className="list-disc list-inside text-amber-800 space-y-1 text-sm">
                     {data.errors.map((err, i) => <li key={i}>{err}</li>)}
                 </ul>
              </div>
            </div>
          ) : (
            <div className="h-full pb-4">
               <AssemblyCanvas experiment={data} language={language} />
            </div>
          )}
        </div>

        {/* Right Panel: Context Chat (Collapsible on mobile) */}
        <div className="w-full md:w-96 border-l border-slate-200 bg-white flex flex-col h-[50vh] md:h-auto">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Bot className="w-4 h-4 text-academic-500" />
              {t.labAssistant}
            </h3>
            <p className="text-xs text-slate-500">{t.labAssistantDesc}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                <p>Have a question about this experiment?</p>
              </div>
            )}
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-academic-100'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-academic-600" />}
                </div>
                <div className={`p-3 rounded-lg text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-academic-50 text-slate-800 border border-academic-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-academic-100 flex items-center justify-center flex-shrink-0">
                       <Bot className="w-4 h-4 text-academic-600" />
                   </div>
                   <div className="p-3 bg-academic-50 rounded-lg border border-academic-100">
                       <div className="flex gap-1">
                           <span className="w-2 h-2 bg-academic-400 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-academic-400 rounded-full animate-bounce delay-75"></span>
                           <span className="w-2 h-2 bg-academic-400 rounded-full animate-bounce delay-150"></span>
                       </div>
                   </div>
                </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.askQuestion}
                className="w-full pl-4 pr-10 py-2.5 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-academic-500 text-sm"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-academic-600 hover:text-academic-800 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const GraduationCapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

export default ExperimentView;