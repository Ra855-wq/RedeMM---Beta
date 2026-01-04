import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 md:hidden">
        <button className="text-slate-500 hover:text-primary-700">
          <Menu size={24} />
        </button>
        <span className="font-bold text-primary-800">RedeMM</span>
      </div>

      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-slate-800">Bem-vindo, {userName}</h2>
        <p className="text-xs text-slate-500">Acesse rapidamente os recursos principais da RedeMM</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar pacientes..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:text-primary-600 transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{userName}</p>
            <p className="text-xs text-primary-600 font-medium">Médica PMMB</p>
          </div>
          <img 
            src="https://picsum.photos/100/100" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-primary-100 object-cover"
          />
        </div>
      </div>
    </header>
  );
};
