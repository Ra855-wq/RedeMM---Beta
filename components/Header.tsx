
import React from 'react';
import { Bell, Search, Menu, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  userName: string;
  onOpenMenu?: () => void;
  eyeRest: boolean;
  setEyeRest: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, onOpenMenu, eyeRest, setEyeRest }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 h-20">
      <div className="flex items-center gap-4">
        <button onClick={onOpenMenu} className="md:hidden p-2 text-neutral-500"><Menu size={24} /></button>
        <div className="hidden md:block">
          <h2 className="text-lg font-bold text-neutral-800">Olá, {userName}</h2>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Painel Integrado Mais Médicos</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setEyeRest(!eyeRest)}
          title="Descanso de Visão"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
            ${eyeRest ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:bg-neutral-100'}`}
        >
          {eyeRest ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="hidden sm:inline">{eyeRest ? 'Modo Descanso ON' : 'Descanso de Visão'}</span>
        </button>

        <button className="p-2 text-neutral-400 hover:text-neutral-900 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-neutral-800 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-100">
           <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-700">{userName}</p>
              <p className="text-[10px] text-neutral-400">ID: PMM-9872</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 font-bold">
              {userName[0]}
           </div>
        </div>
      </div>
    </header>
  );
};
