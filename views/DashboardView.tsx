
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
import { X, Sparkles, Stethoscope, HeartPulse, Activity, BrainCircuit } from 'lucide-react';

import { AdminView } from './AdminView';
import { User as UserType } from '../types';

interface DashboardViewProps {
  user: UserType;
  onLogout: () => void;
  eyeRest: boolean;
  setEyeRest: (val: boolean) => void;
}

const STORAGE_KEY = 'redemm_profile_data';

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onLogout, eyeRest, setEyeRest }) => {
  const [activePage, setActivePage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(user.name);

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
            {/* Hero Section with Medical Symbols */}
            <div className="relative overflow-hidden bg-neutral-900 rounded-[2.5rem] p-8 md:p-14 text-white shadow-surgical-xl">
               <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="grid grid-cols-6 gap-16 -rotate-12 translate-x-[-10%] translate-y-[-10%]">
                    {Array.from({length: 24}).map((_, i) => {
                      const Icons = [Stethoscope, HeartPulse, Activity, BrainCircuit];
                      const Icon = Icons[i % Icons.length];
                      return <Icon key={i} size={60} strokeWidth={1} />;
                    })}
                 </div>
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="max-w-2xl text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30 mb-6">
                        <Sparkles size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">Plataforma Educacional Ativa</span>
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-4">
                        Olá, {userName.split(' ')[1]}
                     </h2>
                     <p className="text-base text-neutral-400 font-medium leading-relaxed max-w-xl italic">
                        Seu ambiente de suporte profissional e educacional está pronto para auxiliar no raciocínio clínico e pedagógico.
                     </p>
                  </div>
                  <div className="w-40 h-40 md:w-56 md:h-56 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex items-center justify-center relative animate-float">
                     <BrainCircuit size={64} className="text-emerald-500" />
                     <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full -z-10"></div>
                  </div>
               </div>
            </div>

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
      case 'admin': return <AdminView />;
      default: return <div className="p-20 text-center font-bold text-slate-400">Módulo em desenvolvimento</div>;
    }
  };

  return (
    <div className={`min-h-screen flex justify-center bg-edu ${eyeRest ? 'bg-[#f8f5f0]' : 'bg-[#fbfcff]'}`}>
      <div className="w-full max-w-[1600px] flex flex-col md:flex-row relative">
        <Sidebar 
          user={user}
          onLogout={onLogout} 
          activePage={activePage} 
          setActivePage={setActivePage} 
        />

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[70] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-80 h-full bg-white shadow-surgical-xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 flex justify-end"><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button></div>
              <Sidebar user={user} onLogout={onLogout} activePage={activePage} setActivePage={setActivePage} isMobile />
            </div>
          </div>
        )}
        
        <main className="flex-1 flex flex-col min-h-screen md:ml-64 w-full">
          <Header 
            userName={userName} 
            onOpenMenu={() => setIsMobileMenuOpen(true)} 
            eyeRest={eyeRest}
            setEyeRest={setEyeRest}
          />
          <div className="p-4 md:p-10 w-full flex-1">
            <div className="max-w-6xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
