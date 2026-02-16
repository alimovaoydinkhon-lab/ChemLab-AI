import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { generateExperimentDetails } from '../services/geminiService';
import { Role, ExperimentData, Language } from '../types';
import { translations } from '../utils/translations';

interface DashboardProps {
  role: Role;
  language: Language;
  onExperimentGenerated: (data: ExperimentData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ role, language, onExperimentGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[language];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateExperimentDetails(topic, role, language);
      onExperimentGenerated(data);
    } catch (err) {
      setError("We couldn't generate that experiment. Please try a simpler topic.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = language === 'en' ? [
    "Water Electrolysis",
    "Acid-Base Titration",
    "Esters Synthesis",
    "Copper Sulfate Crystallization"
  ] : language === 'ru' ? [
    "Электролиз воды",
    "Кислотно-основное титрование",
    "Синтез эфиров",
    "Кристаллизация медного купороса"
  ] : [
    "Су электролизі",
    "Қышқылды-негізді титрлеу",
    "Эфирлер синтезі",
    "Мыс сульфатының кристалдануы"
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
            {t.virtualLab}
          </h1>
          <p className="text-slate-600 text-lg max-w-lg mx-auto">
            {t.virtualLabDesc}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-academic-100 text-academic-700 text-xs font-bold uppercase tracking-wide">
            {role === 'student' ? t.modeStudent : t.modeTeacher}
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-lg outline-none text-slate-800 placeholder:text-slate-300"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic}
              className="bg-academic-600 hover:bg-academic-700 text-white px-8 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  {t.start}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
            <div className="text-rose-500 bg-rose-50 px-4 py-2 rounded-lg text-sm inline-block">
                {error}
            </div>
        )}

        <div className="pt-8">
          <p className="text-slate-400 text-sm mb-4">{t.tryThese}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm hover:border-academic-400 hover:text-academic-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;