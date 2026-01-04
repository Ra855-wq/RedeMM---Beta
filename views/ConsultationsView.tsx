
import React from 'react';
import { User, Clock, FileText, ChevronRight, Filter } from 'lucide-react';

export const ConsultationsView: React.FC = () => {
  const list = [
    { id: '1', name: 'Maria do Socorro', age: 62, status: 'Esperando', time: '08:15', risk: 'Alto' },
    { id: '2', name: 'João Pereira', age: 45, status: 'Em triagem', time: '08:30', risk: 'Médio' },
    { id: '3', name: 'Ana Júlia Santos', age: 24, status: 'Agendado', time: '09:00', risk: 'Baixo' },
    { id: '4', name: 'Antônio Ferreira', age: 70, status: 'Agendado', time: '09:15', risk: 'Alto' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Fila de Atendimento</h2>
            <p className="text-sm text-slate-500">UBS Central - Equipe A</p>
          </div>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-colors">
            <Filter size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Risco</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold">
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.age} anos</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Clock size={16} />
                      {item.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase
                      ${item.status === 'Esperando' ? 'bg-orange-100 text-orange-600' : 
                        item.status === 'Em triagem' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full 
                        ${item.risk === 'Alto' ? 'bg-red-500' : 
                          item.risk === 'Médio' ? 'bg-yellow-500' : 'bg-green-500'}
                      `}></span>
                      <span className="text-sm text-slate-600">{item.risk}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-primary-600 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
