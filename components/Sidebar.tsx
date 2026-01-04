
import React from 'react';
import { 
  Home, 
  Calendar, 
  Stethoscope, 
  MapPin, 
  User, 
  BarChart2, 
  Settings, 
  LogOut,
  Network,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, activePage, setActivePage }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'assistant', icon: BrainCircuit, label: 'Assistente Clínico' },
    { id: 'collaboration', icon: MessageSquare, label: 'Rede Médica (Chat)' },
    { id: 'schedule', icon: Calendar, label: 'Agenda' },
    { id: 'consultations', icon: Stethoscope, label: 'Consultas' },
    { id: 'map', icon: MapPin, label: 'Mapa de Atuação' },
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'stats', icon: BarChart2, label: 'Estatísticas' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-primary-800 p-2 rounded-lg shadow-lg shadow-primary-900/10">
          <Network className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-900 tracking-tight">RedeMM</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Mais Médicos</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scroll">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? 'bg-primary-800 text-white shadow-xl shadow-primary-900/10' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold uppercase tracking-wider"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
