
import React from 'react';
import { 
  Home, Stethoscope, MapPin, User, LogOut,
  BrainCircuit, MessageSquare, HelpCircle, HeartPulse, Zap, Users, Sparkles
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, activePage, setActivePage, isMobile }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'assistant', icon: BrainCircuit, label: 'Cérebro Clínico' },
    { id: 'live', icon: HelpCircle, label: 'Assistente Vocal' },
    { id: 'collaboration', icon: MessageSquare, label: 'Rede Médica' },
    { id: 'consultations', icon: Users, label: 'Gestão Pacientes' },
    { id: 'map', icon: HeartPulse, label: 'Unidade de Apoio' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <aside className={`${isMobile ? 'w-full h-full' : 'hidden md:flex w-72 fixed h-screen p-4'} flex-col bg-transparent z-50`}>
      <div className={`${isMobile ? 'h-full' : 'h-full rounded-[3rem] shadow-2xl shadow-neutral-900/5'} flex flex-col bg-white border border-neutral-100 overflow-hidden`}>
        {/* Logo Section Refined */}
        <div className="p-8 border-b border-neutral-50 flex flex-col items-center shrink-0">
          <div className="relative group cursor-pointer mb-5">
             <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-accent-400 rounded-full blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
             <div className="relative w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <BrainCircuit className="text-white w-8 h-8" />
                <Sparkles className="absolute -top-1 -right-1 text-accent-400 w-5 h-5 animate-pulse" />
             </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-neutral-900 tracking-tighter leading-none">REDE<span className="text-accent-600">MM</span></h1>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.4em] mt-2">Surgical Genius</p>
          </div>
          <div className="mt-4 px-4 py-1.5 bg-accent-600 rounded-full text-[8px] font-black text-white uppercase tracking-[0.25em] shadow-lg shadow-accent-500/20">v3.1 Surgical</div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/15' 
                    : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900'}`}
              >
                <div className={`${isActive ? 'text-accent-400' : 'opacity-60'}`}>
                  <Icon size={18} />
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-neutral-50 shrink-0">
          <div className="bg-neutral-900 rounded-2xl p-4 mb-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white animate-pulse-glow">
                <Zap size={14} />
             </div>
             <div className="overflow-hidden">
                <p className="text-[9px] font-black text-white uppercase tracking-widest truncate">IA 3.1 Pro</p>
                <p className="text-[8px] text-neutral-500 font-bold uppercase">Operacional</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
};
