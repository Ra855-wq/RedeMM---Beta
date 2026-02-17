
import React from 'react';
import { Stethoscope, BrainCircuit, HelpCircle, HeartPulse, Sparkles, Zap, Map } from 'lucide-react';

interface DashboardCardsProps {
    onNavigate: (page: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'assistant',
      title: 'Cérebro Clínico',
      description: 'Diagnóstico diferencial e raciocínio clínico avançado via IA.',
      icon: BrainCircuit,
      action: 'Iniciar Consulta',
      color: 'text-neutral-900',
      bg: 'bg-white',
      accent: 'border-emerald-500'
    },
    {
      id: 'live',
      title: 'Info & Dúvidas',
      description: 'Assistente vocal para protocolos e dúvidas logísticas rápidas.',
      icon: HelpCircle,
      action: 'Falar agora',
      color: 'text-blue-600',
      bg: 'bg-white',
      accent: 'border-blue-500'
    },
    {
      id: 'map',
      title: 'Unidade de Apoio',
      description: 'Geolocalização de UBS, CAPS e rede de urgência próxima.',
      icon: Map,
      action: 'Localizar Rede',
      color: 'text-rose-600',
      bg: 'bg-white',
      accent: 'border-rose-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {cards.map((card, index) => (
        <div 
          key={index} 
          onClick={() => onNavigate(card.id)}
          className={`floating-card group bg-white border border-slate-100 p-12 rounded-[4rem] flex flex-col items-center text-center cursor-pointer shadow-surgical hover:shadow-surgical-xl transition-all duration-700 relative overflow-hidden`}
        >
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="text-emerald-500 animate-pulse" size={20} />
          </div>
          
          <div className={`w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-700 shadow-inner ${card.color}`}>
            <card.icon size={48} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">{card.title}</h3>
          <p className="text-sm text-slate-400 mb-12 px-2 leading-relaxed font-bold h-12 line-clamp-2 italic uppercase tracking-widest text-[10px]">
            {card.description}
          </p>
          
          <button className="w-full bg-neutral-900 text-white font-black py-6 rounded-[2rem] transition-all duration-300 text-[11px] uppercase tracking-[0.25em] shadow-xl group-hover:bg-emerald-600 flex items-center justify-center gap-3 active:scale-95">
            <Zap size={14} /> {card.action}
          </button>
        </div>
      ))}
    </div>
  );
};
