
import React from 'react';
import { Stethoscope, MapPin, BrainCircuit, MessageSquare } from 'lucide-react';

interface DashboardCardsProps {
    onNavigate: (page: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'assistant',
      title: 'IA Clínica',
      description: 'Raciocínio avançado para casos complexos e protocolos do SUS.',
      icon: BrainCircuit,
      action: 'Acessar Cérebro',
    },
    {
      id: 'collaboration',
      title: 'Rede Médica',
      description: 'Interaja com outros profissionais e discuta casos em tempo real.',
      icon: MessageSquare,
      action: 'Abrir Chat',
    },
    {
      id: 'map',
      title: 'Rede de Apoio',
      description: 'Encontre UBS, CAPS e serviços de referência por todo o Brasil.',
      icon: MapPin,
      action: 'Ver Mapa',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-500">
            <card.icon size={32} className="text-primary-800" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">{card.title}</h3>
          <p className="text-sm text-slate-400 mb-8 px-2 h-10 leading-relaxed font-medium">{card.description}</p>
          <button 
            onClick={() => onNavigate(card.id)}
            className="w-full bg-slate-900 group-hover:bg-primary-800 text-white font-black py-4 px-4 rounded-2xl transition-all duration-300 text-xs uppercase tracking-[0.15em] shadow-lg shadow-slate-200"
          >
            {card.action}
          </button>
        </div>
      ))}
    </div>
  );
};
