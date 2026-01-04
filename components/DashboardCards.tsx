import React from 'react';
import { Stethoscope, MapPin, UserCog } from 'lucide-react';

export const DashboardCards: React.FC = () => {
  const cards = [
    {
      title: 'Consultas',
      description: 'Gerencie suas consultas médicas, histórico de pacientes e acompanhamentos',
      icon: Stethoscope,
      action: 'Acessar Consultas',
    },
    {
      title: 'Mapa de Atuação',
      description: 'Visualize a distribuição geográfica dos pacientes e unidades de atendimento',
      icon: MapPin,
      action: 'Ver Mapa',
    },
    {
      title: 'Meu Perfil',
      description: 'Atualize suas informações profissionais, especialidades e preferências',
      icon: UserCog,
      action: 'Editar Perfil',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <card.icon size={32} className="text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{card.title}</h3>
          <p className="text-sm text-slate-500 mb-6 px-2 h-10">{card.description}</p>
          <button className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
            {card.action}
          </button>
        </div>
      ))}
    </div>
  );
};
