
import React from 'react';
import { Stethoscope, BrainCircuit, HelpCircle, HeartPulse } from 'lucide-react';

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
      accent: 'border-b-4 border-b-neutral-900'
    },
    {
      id: 'live',
      title: 'Info & Dúvidas',
      description: 'Assistente vocal para protocolos e dúvidas logísticas rápidas.',
      icon: HelpCircle,
      action: 'Falar agora',
      color: 'text-accent-600',
      bg: 'bg-white',
      accent: 'border-b-4 border-b-accent-500'
    },
    {
      id: 'map',
      title: 'Unidade de Apoio',
      description: 'Geolocalização de UBS, CAPS e rede de urgência próxima.',
      icon: HeartPulse,
      action: 'Localizar Rede',
      color: 'text-red-600',
      bg: 'bg-white',
      accent: 'border-b-4 border-b-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`floating-card group ${card.bg} ${card.accent} p-8 sm:p-10 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden`}>
          <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-all duration-500 shadow-inner ${card.color}`}>
            <card.icon size={32} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-800 mb-2 tracking-tight">{card.title}</h3>
          <p className="text-xs sm:text-sm text-neutral-400 mb-8 px-2 leading-relaxed font-bold h-12 line-clamp-2 italic">
            {card.description}
          </p>
          <button 
            onClick={() => onNavigate(card.id)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95"
          >
            {card.action}
          </button>
        </div>
      ))}
    </div>
  );
};
