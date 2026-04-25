import React from 'react';
import { AlertCircle, CheckCircle2, FileText, UserPlus, BookOpen, Award, GraduationCap, ArrowUpRight } from 'lucide-react';

export const DashboardLists: React.FC = () => {
  const notifications = [
    { 
      id: 1, 
      title: 'Nota Técnica SISREG', 
      desc: 'Atualização nos fluxos de cardiologia em Vila Velha', 
      time: 'Hoje, 11:23',
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { 
      id: 2, 
      title: 'Atestado de Presença', 
      desc: 'O formulário de frequência do Ciclo 12 está liberado', 
      time: '15:45',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    { 
      id: 3, 
      title: 'Módulo de Especialização', 
      desc: 'Prazo final para entrega do portfólio MFC amanhã', 
      time: 'Há 2 dias',
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
  ];

  const academicProgress = [
    { label: 'Especialização MFC', progress: 75, status: 'Em andamento' },
    { label: 'Cursos Transversais', progress: 100, status: 'Concluído' },
    { label: 'Atividades Práticas', progress: 40, status: 'Ciclo 2' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Central de Notificações Profissionais */}
      <div className="bg-white rounded-[3rem] shadow-surgical-sm border border-slate-100 p-10 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Informativos PMMB</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronizado com Tutor Virtual</p>
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
            <AlertCircle size={20} />
          </button>
        </div>
        
        <div className="space-y-6 flex-1">
          {notifications.map((item) => (
            <div key={item.id} className="group flex items-start gap-5 p-5 rounded-[2rem] hover:bg-slate-50 transition-all cursor-pointer">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <item.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight truncate">{item.title}</h4>
                  <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-8 py-5 bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
          EXPLORAR ARQUIVOS DA PRECEPTORIA
        </button>
      </div>

      {/* Evolução Acadêmica & Fellowship */}
      <div className="bg-white rounded-[3rem] shadow-surgical-sm border border-slate-100 p-10 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
           <GraduationCap size={160} />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Progresso Tutorial</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fellowship em MFC</p>
            </div>
            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center">
              <BookOpen size={22} />
            </div>
          </div>

          <div className="space-y-8 flex-1">
            {academicProgress.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</h4>
                    <span className="text-[9px] font-black text-accent-600 uppercase tracking-widest">{item.status}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-5 bg-neutral-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-xl active:scale-95">
            CARREGAR ATIVIDADE DO CICLO <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

