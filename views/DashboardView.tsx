import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardCards } from '../components/DashboardCards';
import { DashboardLists } from '../components/DashboardLists';
import { StatisticsSection } from '../components/StatisticsSection';

interface DashboardViewProps {
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar onLogout={onLogout} activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header userName="Dra. Marina Santos" />
        
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activePage === 'home' && (
            <div className="animate-fade-in">
              <DashboardCards />
              <DashboardLists />
              <StatisticsSection />
            </div>
          )}
          
          {activePage !== 'home' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚧</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-600">Módulo em desenvolvimento</h2>
              <p>A funcionalidade selecionada estará disponível em breve.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
