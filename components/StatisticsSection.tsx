import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Users, Activity, Star, Calendar } from 'lucide-react';

const data = [
  { name: 'Seg', current: 12, previous: 8, efficiency: 85 },
  { name: 'Ter', current: 18, previous: 12, efficiency: 92 },
  { name: 'Qua', current: 15, previous: 16, efficiency: 88 },
  { name: 'Qui', current: 25, previous: 14, efficiency: 96 },
  { name: 'Sex', current: 20, previous: 18, efficiency: 90 },
  { name: 'Sáb', current: 8, previous: 5, efficiency: 95 },
  { name: 'Dom', current: 2, previous: 1, efficiency: 100 },
];

export const StatisticsSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-surgical-sm border border-slate-100 p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
            <TrendingUp size={180} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight mb-1 uppercase">Fluxo de Atendimento</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sincronizado com SISREG e e-SUS</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-600 shadow-sm shadow-accent-200"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ciclo Atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Média Anterior</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900, textAnchor: 'middle'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
                      padding: '20px',
                      backgroundColor: '#fff' 
                    }} 
                    labelStyle={{ color: '#0f172a', fontWeight: 900, marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 700, padding: '2px 0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="previous" 
                    stroke="#e2e8f0" 
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    fill="transparent" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#0f172a" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorCurrent)" 
                    animationDuration={1500}
                    dot={{ r: 4, fill: '#fff', stroke: '#0f172a', strokeWidth: 3 }}
                    activeDot={{ r: 8, fill: '#0f172a', stroke: '#fff', strokeWidth: 4, shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Kpis Column */}
        <div className="space-y-6">
          <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white shadow-xl group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-accent-400 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Pacientes</span>
            </div>
            <p className="text-4xl font-black tracking-tighter mb-2">342</p>
            <div className="flex items-center gap-2">
              <div className="flex h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="w-[78%] bg-accent-400 rounded-full"></div>
              </div>
              <span className="text-[9px] font-black">+12%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm group hover:shadow-surgical-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Eficiência</span>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">94.8%</p>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Selo de Qualidade PMMB</p>
          </div>

          <div className="bg-accent-50 border border-accent-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-accent-200">
               <Star size={32} fill="currentColor" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-accent-600 shadow-sm">
                <Calendar size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-700">Satisfação</span>
            </div>
            <p className="text-4xl font-black text-accent-900 tracking-tighter mb-1">4.92</p>
            <p className="text-[9px] font-black text-accent-600/60 uppercase tracking-widest">Feedback Médio do Cidadão</p>
          </div>
        </div>
      </div>
    </div>
  );
};
