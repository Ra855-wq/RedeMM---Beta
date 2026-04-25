import React from 'react';
import { User } from '../types';
import { QRCodeSVG } from 'qrcode.react'; 
import { X, ShieldCheck, MapPin, Mail, Phone, Calendar, HeartPulse } from 'lucide-react';

interface BadgeViewProps {
  user: User;
  onClose: () => void;
}

export const BadgeView: React.FC<BadgeViewProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-zoom-fade" onClick={onClose}>
      <div className="relative w-full max-w-sm cursor-pointer group" onClick={onClose}>
        {/* Floating Controls */}
        <div className="absolute -top-16 right-0 flex justify-end mb-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md ring-1 ring-white/20"
          >
            <X size={24} />
          </button>
        </div>

        {/* Badge Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 relative isolate flex flex-col h-[600px] w-full">
          
          {/* Lanyard Top Part */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 rounded-b-xl border border-t-0 border-slate-300 flex items-end justify-center pb-1 z-20">
             <div className="w-16 h-2 bg-slate-400 rounded-full"></div>
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-14 bg-slate-800 rounded-t-xl z-10"></div>

          {/* Header Area (Blue) */}
          <div className="bg-[#0b284e] pt-12 pb-6 px-6 text-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                  style={{ backgroundImage: 'radial-gradient(circle at 100% 0, white 2px, transparent 2px)', backgroundSize: '16px 16px' }} />
             
             <div className="flex justify-center items-center gap-3 mb-6 relative z-10">
                <HeartPulse size={40} className="text-emerald-500" strokeWidth={1.5} />
                <div className="text-left leading-tight">
                  <div className="text-emerald-400 text-[9px] font-bold tracking-widest uppercase">Programa</div>
                  <div className="text-white text-xl font-black tracking-wider leading-none">MAIS MÉDICOS</div>
                </div>
             </div>

             <div className="relative z-10 mt-6">
                <h2 className="text-2xl font-black text-white">{user.name}</h2>
                <h3 className="text-emerald-400 font-bold tracking-widest text-sm uppercase mt-1">MÉDICO</h3>
                <div className="mt-3 text-slate-300 font-mono text-sm inline-block px-3 py-1 border border-slate-600 rounded bg-slate-800/50">
                  {user.rmsId || 'PMMB-XXXXXX'}
                </div>
             </div>
          </div>

          {/* White Bottom Area */}
          <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <MapPin size={16} />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</div>
                        <div className="text-sm font-bold text-slate-800">UBS Industrial / Viana-ES</div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Mail size={16} />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</div>
                        <div className="text-sm font-bold text-slate-800 break-all">{user.username}@saude.gov.br</div>
                     </div>
                  </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center bg-slate-50 mt-4">
                 <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <QRCodeSVG value={`https://redemm.app/dr/${user.rmsId || user.id}`} size={70} />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Validação</span>
                    </div>
                    <p className="text-[10px] leading-snug text-slate-400">
                      Escaneie o QR Code para acessar o perfil e validar a credencial deste profissional.
                    </p>
                 </div>
              </div>

              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-2 items-center text-slate-800 font-black">
                     <div className="text-xl">SUS</div>
                     <div className="text-[8px] leading-tight font-bold text-slate-500 border-l border-slate-300 pl-2">MINISTÉRIO DA<br/>SAÚDE</div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs font-black text-slate-800">BRASIL</div>
                     <div className="text-[8px] text-slate-400 uppercase tracking-wider">União e Reconstrução</div>
                  </div>
              </div>
          </div>

          <div className="bg-[#0b284e] py-3 text-center">
             <p className="text-[9px] text-white/80 tracking-widest uppercase font-semibold">Cuidar é mais que tratar, é humanizar.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
