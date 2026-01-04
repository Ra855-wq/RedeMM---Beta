import React from 'react';
import { CalendarClock, AlertCircle, CheckCircle2, FileText, UserPlus } from 'lucide-react';

export const DashboardLists: React.FC = () => {
  const consultations = [
    { id: 1, name: 'Carlos Oliveira', type: 'Consulta de rotina', time: '14:30', isToday: true },
    { id: 2, name: 'Ana Beatriz Silva', type: 'Primeira consulta', time: '10:15', isToday: false, date: 'Amanhã' },
    { id: 3, name: 'Roberto Mendes', type: 'Retorno', time: '16:00', isToday: false, date: 'Quinta' },
  ];

  const notifications = [
    { 
      id: 1, 
      title: 'Novo paciente cadastrado', 
      desc: 'Mariana Costa foi adicionada à sua lista', 
      time: 'Hoje, 11:23',
      icon: UserPlus,
      color: 'text-blue-500'
    },
    { 
      id: 2, 
      title: 'Consulta confirmada', 
      desc: 'Pedro Almeida confirmou a consulta', 
      time: '15:45',
      icon: CheckCircle2,
      color: 'text-green-500'
    },
    { 
      id: 3, 
      title: 'Exames disponíveis', 
      desc: 'Novos resultados de exames de Júlia', 
      time: 'Ontem, 16:30',
      icon: FileText,
      color: 'text-purple-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Consultations List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock size={20} className="text-primary-600" />
            Próximas Consultas
          </h3>
          <button className="text-xs font-semibold text-primary-700 hover:underline">Ver todas</button>
        </div>
        
        <div className="space-y-4 flex-1">
          {consultations.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500">{item.type}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded ${item.isToday ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                  {item.isToday ? 'Hoje' : item.date}
                </span>
                <p className="text-xs text-slate-500 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 rounded-lg transition-colors text-sm">
          Ver Agenda Completa
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle size={20} className="text-primary-600" />
            Notificações Recentes
          </h3>
          <button className="text-xs font-semibold text-primary-700 hover:underline">Limpar</button>
        </div>

        <div className="space-y-4 flex-1">
          {notifications.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg transition-colors">
              <div className={`mt-1 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{item.desc}</p>
                <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 rounded-lg transition-colors text-sm">
          Ver Todas Notificações
        </button>
      </div>
    </div>
  );
};
