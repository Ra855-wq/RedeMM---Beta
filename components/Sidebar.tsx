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
  Network
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, activePage, setActivePage }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Início' },
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
        <div className="bg-primary-700 p-2 rounded-lg">
          <Network className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-800 tracking-tight">RedeMM</h1>
          <p className="text-[10px] text-slate-500 font-medium">MAIS MÉDICOS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
