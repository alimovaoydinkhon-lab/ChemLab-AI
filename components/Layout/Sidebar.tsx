import React from 'react';
import { BookOpen, FlaskConical, MessageSquare, Image, GraduationCap, School, Globe } from 'lucide-react';
import { AppView, Role, Language } from '../../types';
import { translations } from '../../utils/translations';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, role, setRole, language, setLanguage }) => {
  const t = translations[language];

  return (
    <div className="w-64 bg-academic-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-academic-700">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <FlaskConical className="w-8 h-8 text-academic-500" />
          {t.appTitle}
        </h1>
        <p className="text-xs text-academic-100 mt-2 opacity-70">{t.pedagogicalEdition}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setCurrentView(AppView.DASHBOARD)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === AppView.DASHBOARD ? 'bg-academic-700 text-white' : 'hover:bg-academic-700/50 text-academic-100'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{t.dashboard}</span>
        </button>
        <button
          onClick={() => setCurrentView(AppView.IMAGE_LAB)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === AppView.IMAGE_LAB ? 'bg-academic-700 text-white' : 'hover:bg-academic-700/50 text-academic-100'}`}
        >
          <Image className="w-5 h-5" />
          <span>{t.imageLab}</span>
        </button>
        <button
          onClick={() => setCurrentView(AppView.CHAT)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === AppView.CHAT ? 'bg-academic-700 text-white' : 'hover:bg-academic-700/50 text-academic-100'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>{t.aiAssistant}</span>
        </button>
      </nav>

      <div className="p-4 border-t border-academic-700 bg-academic-800 space-y-4">
        {/* Language Selection */}
        <div>
           <p className="text-xs uppercase text-academic-500 font-bold mb-2 tracking-wider flex items-center gap-1">
             <Globe className="w-3 h-3" /> Language
           </p>
           <div className="flex gap-1">
             {(['en', 'ru', 'kk'] as Language[]).map((lang) => (
               <button
                 key={lang}
                 onClick={() => setLanguage(lang)}
                 className={`flex-1 text-xs py-1.5 rounded transition-colors ${language === lang ? 'bg-academic-500 text-white font-bold' : 'bg-academic-700/50 text-academic-300 hover:bg-academic-700'}`}
               >
                 {lang.toUpperCase()}
               </button>
             ))}
           </div>
        </div>

        {/* Mode Selection */}
        <div>
          <p className="text-xs uppercase text-academic-500 font-bold mb-2 tracking-wider">{t.modeSelection}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded border transition-all ${role === 'student' ? 'bg-academic-700 border-academic-500 text-white' : 'border-academic-600 text-academic-400 hover:bg-academic-700'}`}
              title={t.student}
            >
              <GraduationCap className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{t.student}</span>
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded border transition-all ${role === 'teacher' ? 'bg-academic-700 border-academic-500 text-white' : 'border-academic-600 text-academic-400 hover:bg-academic-700'}`}
              title={t.teacher}
            >
              <School className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{t.teacher}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;