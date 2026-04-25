
import React from 'react';
import { 
  Home, Stethoscope, MapPin, User, LogOut,
  BrainCircuit, MessageSquare, HelpCircle, HeartPulse, Zap, Users, Sparkles, Shield
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  isMobile?: boolean;
  user?: UserType;
  onOpenBadge?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, activePage, setActivePage, isMobile, user, onOpenBadge }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'assistant', icon: BrainCircuit, label: 'Cérebro Clínico' },
    { id: 'live', icon: HelpCircle, label: 'Assistente Vocal' },
    { id: 'collaboration', icon: MessageSquare, label: 'Rede Médica' },
    { id: 'consultations', icon: Users, label: 'Gestão Pacientes' },
    { id: 'map', icon: HeartPulse, label: 'Unidade de Apoio' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  if (user?.role === 'doctor') {
    menuItems.push({ id: 'badge', icon: Shield, label: 'Credencial' });
  }

  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', icon: Shield, label: 'Moderador' });
  }

  const handleMenuClick = (id: string) => {
    if (id === 'badge' && onOpenBadge) {
      onOpenBadge();
    } else if (id !== 'badge') {
      setActivePage(id);
    }
  };

  return (
    <aside className={`${isMobile ? 'w-full h-full' : 'hidden md:flex w-64 fixed h-screen p-3'} flex-col bg-transparent z-50`}>
      <div className={`${isMobile ? 'h-full' : 'h-full rounded-[2rem] shadow-2xl shadow-neutral-900/5'} flex flex-col bg-white border border-neutral-100 overflow-hidden`}>
        {/* Logo Section Refined */}
        <div className="p-6 border-b border-neutral-50 flex flex-col items-center shrink-0">
          <div className="relative group cursor-pointer mb-4">
             <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-accent-400 rounded-full blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
             <div className="relative w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <BrainCircuit className="text-white w-7 h-7" />
                <Sparkles className="absolute -top-1 -right-1 text-accent-400 w-4 h-4 animate-pulse" />
             </div>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black text-neutral-900 tracking-tighter leading-none">AppRede<span className="text-accent-600">MM</span></h1>
          </div>
          <div className="mt-3 px-3 py-1 bg-accent-600 rounded-full text-[7px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-accent-500/20">v0.1.0-beta</div>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold transition-all duration-500 relative group/item
                  ${isActive 
                    ? 'bg-neutral-900 text-white shadow-2xl shadow-neutral-900/40 translate-x-1' 
                    : 'text-neutral-400 hover:bg-white hover:text-neutral-900 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:-translate-y-0.5'}`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-accent-500 rounded-r-full animate-in slide-in-from-left-2" />
                )}
                <div className={`${isActive ? 'text-accent-400' : 'opacity-60 group-hover/item:text-accent-500 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-300'}`}>
                  <Icon size={16} />
                </div>
                <span className="truncate group-hover/item:translate-x-1 transition-transform duration-300">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-50 shrink-0">
          <div className="bg-neutral-900 rounded-xl p-3 mb-3 flex items-center gap-3">
             <div className="w-7 h-7 rounded-full bg-accent-500 flex items-center justify-center text-white animate-pulse-glow">
                <Zap size={12} />
             </div>
             <div className="overflow-hidden">
                <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">IA v0.1.0-β</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-colors">
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
};
