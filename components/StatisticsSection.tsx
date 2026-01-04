import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', current: 12, previous: 8 },
  { name: 'Ter', current: 18, previous: 12 },
  { name: 'Qua', current: 15, previous: 16 },
  { name: 'Qui', current: 25, previous: 14 },
  { name: 'Sex', current: 20, previous: 18 },
  { name: 'Sáb', current: 8, previous: 5 },
  { name: 'Dom', current: 2, previous: 1 },
];

export const StatisticsSection: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-slate-800 mb-6">Estatísticas de Atendimento</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary-700">28</p>
          <p className="text-xs text-slate-600 font-medium">Consultas este mês</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary-700">94%</p>
          <p className="text-xs text-slate-600 font-medium">Taxa de comparecimento</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary-700">12</p>
          <p className="text-xs text-slate-600 font-medium">Novos pacientes</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary-700">4.8</p>
          <p className="text-xs text-slate-600 font-medium">Avaliação média</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              labelStyle={{ color: '#64748b' }}
            />
            <Area 
              type="monotone" 
              dataKey="previous" 
              stroke="#cbd5e1" 
              strokeWidth={3}
              fill="transparent" 
            />
            <Area 
              type="monotone" 
              dataKey="current" 
              stroke="#7c3aed" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCurrent)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
