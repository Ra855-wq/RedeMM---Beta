
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardCards } from '../components/DashboardCards';
import { DashboardLists } from '../components/DashboardLists';
import { StatisticsSection } from '../components/StatisticsSection';
import { UnidadeApoioView } from './UnidadeApoioView';
import { AssistantView } from './AssistantView';
import { ConsultationsView } from './ConsultationsView';
import { CollaborationView } from './CollaborationView';
import { ProfileView } from './ProfileView';
import { LiveAssistantView } from './LiveAssistantView';
import { X } from 'lucide-react';

interface DashboardViewProps {
  onLogout: () => void;
  eyeRest: boolean;
  setEyeRest: (val: boolean) => void;
}

const STORAGE_KEY = 'redemm_profile_data';

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout, eyeRest, setEyeRest }) => {
  const [activePage, setActivePage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).name : 'Dr. Rafael Araujo';
  });

  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.name) setUserName(e.detail.name);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const renderContent = () => {
    switch(activePage) {
      case 'home':
        return (
          <div className="animate-zoom-fade space-y-10">
            <DashboardCards onNavigate={setActivePage} />
            <DashboardLists />
            <StatisticsSection />
          </div>
        );
      case 'map': return <UnidadeApoioView />;
      case 'assistant': return <AssistantView />;
      case 'live': return <LiveAssistantView />;
      case 'consultations': return <ConsultationsView />;
      case 'collaboration': return <CollaborationView />;
      case 'profile': return <ProfileView />;
      default: return <div className="p-20 text-center font-bold text-slate-400">Módulo em desenvolvimento</div>;
    }
  };

  return (
    <div className={`min-h-screen flex justify-center ${eyeRest ? 'bg-[#f8f5f0]' : 'bg-[#f8fafc]'}`}>
      <div className="w-full max-w-[1600px] flex flex-col md:flex-row relative">
        <Sidebar 
          onLogout={onLogout} 
          activePage={activePage} 
          setActivePage={setActivePage} 
        />

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[70] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-80 h-full bg-white shadow-surgical-xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 flex justify-end"><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button></div>
              <Sidebar onLogout={onLogout} activePage={activePage} setActivePage={setActivePage} isMobile />
            </div>
          </div>
        )}
        
        <main className="flex-1 flex flex-col min-h-screen md:ml-72 w-full">
          <Header 
            userName={userName} 
            onOpenMenu={() => setIsMobileMenuOpen(true)} 
            eyeRest={eyeRest}
            setEyeRest={setEyeRest}
          />
          <div className="p-6 md:p-12 w-full flex-1">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
