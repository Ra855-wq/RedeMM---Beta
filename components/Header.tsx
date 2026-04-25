
import React from 'react';
import { Bell, Menu, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userPhoto?: string;
  onOpenMenu?: () => void;
  eyeRest: boolean;
  setEyeRest: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, userPhoto, onOpenMenu, eyeRest, setEyeRest }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40 h-16">
      <div className="flex items-center gap-4">
        <button onClick={onOpenMenu} className="md:hidden p-2 text-neutral-500" aria-label="Abrir Menu"><Menu size={24} /></button>
        <div className="hidden md:block">
          <h2 className="text-lg font-bold text-neutral-800">Olá, {userName}</h2>
          <p className="text-[10px] text-accent-500 font-black uppercase tracking-widest italic">Sua excelência clínica transforma vidas hoje.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setEyeRest(!eyeRest)}
          title="Descanso de Visão"
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm
            ${eyeRest 
              ? 'bg-orange-500 border-orange-600 text-white shadow-orange-200' 
              : 'bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-200'}`}
        >
          {eyeRest ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">{eyeRest ? 'Descanso ON' : 'Descanso de Visão'}</span>
        </button>

        <button className="p-2.5 bg-neutral-50 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all relative border border-neutral-100" aria-label="Notificações">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-100">
           <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-neutral-800 uppercase tracking-tight">{userName}</p>
              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">ID: PMM-9872</p>
           </div>
           <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 shadow-lg group cursor-pointer hover:border-accent-400 transition-all">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white font-black text-xs">
                  {userName[0]}
                </div>
              )}
           </div>
        </div>
      </div>
    </header>
  );
};
