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
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
      <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3">
        <div className="w-2 h-6 bg-primary-600 rounded-full"></div>
        Indicadores de Performance Clínica
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-primary-50 p-6 rounded-3xl text-center border border-primary-100/50">
          <p className="text-3xl font-black text-primary-800">28</p>
          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1">Consultas / Mês</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
          <p className="text-3xl font-black text-slate-800">94%</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Comparecimento</p>
        </div>
        <div className="bg-primary-50 p-6 rounded-3xl text-center border border-primary-100/50">
          <p className="text-3xl font-black text-primary-800">12</p>
          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1">Novos Pacientes</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
          <p className="text-3xl font-black text-slate-800">4.8</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">NPS Paciente</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#438679" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#438679" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} 
              labelStyle={{ color: '#64748b', fontWeight: 700, marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="previous" 
              stroke="#e2e8f0" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent" 
            />
            <Area 
              type="monotone" 
              dataKey="current" 
              stroke="#438679" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCurrent)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};