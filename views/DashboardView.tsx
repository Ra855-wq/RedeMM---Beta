
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardCards } from '../components/DashboardCards';
import { DashboardLists } from '../components/DashboardLists';
import { StatisticsSection } from '../components/StatisticsSection';
import { MapView } from './MapView';
import { AssistantView } from './AssistantView';
import { ConsultationsView } from './ConsultationsView';
import { CollaborationView } from './CollaborationView';

interface DashboardViewProps {
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('home');

  const renderContent = () => {
    switch(activePage) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-700">
            <DashboardCards onNavigate={setActivePage} />
            <DashboardLists />
            <StatisticsSection />
          </div>
        );
      case 'map':
        return <MapView />;
      case 'assistant':
        return <AssistantView />;
      case 'consultations':
        return <ConsultationsView />;
      case 'collaboration':
        return <CollaborationView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-xl font-bold text-slate-600 tracking-tight">Em Desenvolvimento</h2>
            <p className="text-sm">Este módulo da RedeMM estará disponível em breve.</p>
            <button 
                onClick={() => setActivePage('home')}
                className="mt-6 text-primary-800 font-bold hover:underline"
            >
                Voltar para o Início
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex">
      <Sidebar onLogout={onLogout} activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header userName="Dra. Marina Santos" />
        
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
