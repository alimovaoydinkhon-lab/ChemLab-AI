import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard';
import ExperimentView from './components/Experiment/ExperimentView';
import ImageLab from './components/ImageLab';
import GeneralChat from './components/GeneralChat';
import { AppView, Role, ExperimentData, Language } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [role, setRole] = useState<Role>('student');
  const [language, setLanguage] = useState<Language>('en');
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentData | null>(null);

  const handleExperimentGenerated = (data: ExperimentData) => {
    setCurrentExperiment(data);
    setCurrentView(AppView.EXPERIMENT);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            role={role}
            language={language}
            onExperimentGenerated={handleExperimentGenerated} 
          />
        );
      case AppView.EXPERIMENT:
        if (currentExperiment) {
          return (
            <ExperimentView 
              data={currentExperiment} 
              role={role} 
              language={language}
              onBack={() => setCurrentView(AppView.DASHBOARD)} 
            />
          );
        }
        return <Dashboard role={role} language={language} onExperimentGenerated={handleExperimentGenerated} />;
      case AppView.IMAGE_LAB:
        return <ImageLab language={language} />;
      case AppView.CHAT:
        return <GeneralChat language={language} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
           // Reset experiment view if leaving specific experiment context
           if (view !== AppView.EXPERIMENT) setCurrentExperiment(null);
           setCurrentView(view);
        }} 
        role={role}
        setRole={setRole}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-1 ml-64 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;