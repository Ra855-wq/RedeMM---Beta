
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Award, 
  Camera, 
  Save, 
  Lock, 
  Key,
  Globe,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
  Fingerprint,
  Stethoscope,
  ChevronRight,
  Hash,
  BrainCircuit,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const STORAGE_KEY = 'redemm_profile_data';

const DEFAULT_PROFILE = {
  name: 'Dr. Rafael Araujo',
  role: 'Médico Bolsista PMMB',
  crm: 'CRM/ES 987.654',
  rms: 'RMS/MS 123.456.789-00',
  email: 'rafael.araujo@saude.gov.br',
  phone: '(27) 99888-7766',
  ubs: 'Unidade de Saúde Joaquim Industrial Viana/ES',
  registration: 'PMMB #772154',
  bio: 'Médico Bolsista do PMMB em ciclo de aperfeiçoamento profissional. Foco em Estratégia Saúde da Família e desenvolvimento de competências em Medicina de Comunidade.'
};

export const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'preferences'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsSaving(false);
      setSaveSuccess(true);
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'info', label: 'Dados do Bolsista', icon: User },
    { id: 'security', label: 'Segurança & Acesso', icon: ShieldCheck },
    { id: 'preferences', label: 'Preferências', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> IDENTIFICAÇÃO PROFISSIONAL
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-accent-50 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional (@saude.gov.br)</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-accent-50 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registro RMS / Ministério da Saúde</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={profile.rms}
                      onChange={(e) => setProfile({...profile, rms: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-black text-accent-600 focus:outline-none focus:ring-4 focus:ring-accent-50 transition-all shadow-sm" 
                    />
                    <ShieldCheck size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-accent-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CRM / UF (Ativo)</label>
                  <input 
                    type="text" 
                    value={profile.crm}
                    onChange={(e) => setProfile({...profile, crm: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 transition-all shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> ATUAÇÃO TERRITORIAL PMMB
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade de Saúde Designada</label>
                  <input 
                    type="text" 
                    value={profile.ubs}
                    onChange={(e) => setProfile({...profile, ubs: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Município de Atuação</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value="Viana - Espírito Santo"
                      disabled
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-400 cursor-not-allowed" 
                    />
                    <MapPin size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-neutral-900 rounded-[3rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 blur-[80px] rounded-full group-hover:bg-accent-500/20 transition-all duration-700"></div>
               <h4 className="text-[10px] font-black text-accent-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                 <GraduationCap size={16} /> PLANO DE ATIVIDADES ACADÊMICAS
               </h4>
               <textarea 
                 value={profile.bio}
                 onChange={(e) => setProfile({...profile, bio: e.target.value})}
                 rows={3}
                 className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm text-white/80 focus:ring-4 focus:ring-accent-500/20 transition-all outline-none resize-none leading-relaxed italic"
               />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-surgical-xl transition-all group cursor-pointer">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    <Key size={24} />
                  </div>
                  <h5 className="font-black text-slate-900 text-lg mb-2">Segurança da Senha</h5>
                  <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">Acesso exclusivo via ID Ministerial Sincronizado.</p>
                  <button className="flex items-center gap-2 text-[10px] font-black text-accent-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                    REDEFINIR CREDENCIAIS <ChevronRight size={14} />
                  </button>
                </div>
                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-surgical-xl transition-all group cursor-pointer">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-accent-600 group-hover:text-white transition-all">
                    <Fingerprint size={24} />
                  </div>
                  <h5 className="font-black text-slate-900 text-lg mb-2">Autenticação Biométrica</h5>
                  <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">Validação facial para assinatura de receituários digitais.</p>
                  <button className="flex items-center gap-2 text-[10px] font-black text-accent-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                    CONFIGURAR FACE ID <ChevronRight size={14} />
                  </button>
                </div>
             </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: 'Notificações de Preceptoria', desc: 'Alertas de supervisão e feedbacks pedagógicos.', active: true },
                { title: 'Relatórios de Atividades', desc: 'Envio automático de logs para o Ministério da Saúde.', active: true },
                { title: 'Fórum de Discussão PMM', desc: 'Habilitar notificações de casos clínicos da rede bolsista.', active: true }
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${pref.active ? 'bg-accent-500 animate-pulse' : 'bg-slate-200'}`}></div>
                    <div>
                      <h6 className="font-bold text-slate-800 text-base">{pref.title}</h6>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{pref.desc}</p>
                    </div>
                  </div>
                  <button className={`w-14 h-7 rounded-full transition-all relative ${pref.active ? 'bg-neutral-900' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${pref.active ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-zoom-fade space-y-12 pb-20">
      <div className="bg-white rounded-[4.5rem] shadow-surgical-xl border border-slate-100 overflow-hidden relative">
        <div className="h-64 bg-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_#f1f5f9_0%,_#f8fafc_100%)]"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-20 p-10 rotate-12">
             {Array.from({length: 20}).map((_, i) => (
                <Stethoscope key={i} size={80} />
             ))}
          </div>

          <div className="absolute -bottom-20 left-16 flex items-end gap-10">
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/50 backdrop-blur-xl rounded-[4rem] border border-white/80 shadow-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=256" 
                alt="Profile" 
                className="w-44 h-44 rounded-[3.5rem] object-cover relative z-10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
              <button className="absolute bottom-2 right-2 z-20 bg-neutral-900 text-white p-4 rounded-2xl shadow-2xl hover:bg-accent-600 transition-all">
                <Camera size={20} />
              </button>
            </div>
            
            <div className="pb-28">
               <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{profile.name}</h2>
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center text-white shadow-lg">
                     <CheckCircle2 size={18} />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                     <GraduationCap size={12} className="text-accent-400" /> {profile.role}
                  </span>
                  <span className="text-[10px] text-accent-600 font-black uppercase tracking-widest flex items-center gap-2 bg-accent-50 px-4 py-2 rounded-full">
                     <Hash size={12} /> {profile.rms}
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="pt-32 pb-12 px-16 flex flex-col md:flex-row justify-between items-center gap-12 border-b border-slate-50">
          <div className="flex bg-slate-50 p-2 rounded-[2.2rem] border border-slate-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest transition-all
                    ${isActive 
                      ? 'bg-white text-slate-900 shadow-xl' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-accent-500' : ''} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-surgical-xl transition-all transform active:scale-95 group
              ${saveSuccess 
                ? 'bg-emerald-500 text-white' 
                : 'bg-neutral-900 text-white hover:bg-accent-600'
              }`}
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={20} /> : <Zap size={20} />}
            {isSaving ? 'SALVANDO...' : saveSuccess ? 'DADOS ATUALIZADOS!' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>

        <div className="p-16 bg-white">
           {renderTabContent()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Atendimentos', val: '1.2k', icon: Stethoscope },
          { label: 'Horas Acadêmicas', val: '280h', icon: BookOpen },
          { label: 'Consultas IA', val: '198', icon: BrainCircuit },
          { label: 'Escore PMMB', val: '9.8', icon: Sparkles }
        ].map((m, i) => (
          <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-surgical flex flex-col items-center text-center group hover:border-accent-400 transition-all duration-500">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-500 group-hover:text-white transition-all shadow-inner">
               <m.icon size={20} />
            </div>
            <p className="text-4xl font-black tracking-tighter text-slate-900">{m.val}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
