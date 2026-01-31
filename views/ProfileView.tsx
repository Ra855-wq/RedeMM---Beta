
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
  Loader2
} from 'lucide-react';

const STORAGE_KEY = 'redemm_profile_data';

const DEFAULT_PROFILE = {
  name: 'Dr. Rafael Araujo',
  role: 'Médico de Família e Comunidade',
  crm: 'CRM/ES 987.654',
  email: 'rafael.araujo@saude.gov.br',
  phone: '(27) 99888-7766',
  ubs: 'Unidade de Saúde Joaquim Industrial Viana/ES',
  registration: 'PMMB #772154',
  bio: 'Especialista em Saúde da Família com foco em gestão de doenças crônicas e medicina preventiva na rede municipal de Viana.'
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
    // Simular delay de rede para feedback visual
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Notificar outros componentes (Header) sobre a mudança de nome
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
      
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'info', label: 'Dados Profissionais', icon: User },
    { id: 'security', label: 'Segurança & Acesso', icon: ShieldCheck },
    { id: 'preferences', label: 'Configurações', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações de Contato</h4>
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">Nome Completo</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-4 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">E-mail Institucional</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-4 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">Telefone</label>
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-4 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Credenciais Médicas</h4>
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">CRM / UF</label>
                    <input 
                      type="text" 
                      value={profile.crm}
                      onChange={(e) => setProfile({...profile, crm: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-4 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">Unidade de Atuação (UBS)</label>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={profile.ubs}
                        onChange={(e) => setProfile({...profile, ubs: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-12 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                      />
                      <MapPin size={14} className="text-primary-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-500 absolute left-4 top-2 z-10">Matrícula PMMB</label>
                    <input 
                      type="text" 
                      value={profile.registration}
                      onChange={(e) => setProfile({...profile, registration: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-4 pt-7 pb-3 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50/50 border border-primary-100 p-6 rounded-[2rem]">
              <h4 className="text-xs font-black text-primary-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Award size={16} /> Biografia Curta
              </h4>
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
                className="w-full bg-white border border-primary-100 rounded-2xl p-4 text-sm text-slate-700 focus:ring-4 focus:ring-primary-100 transition-all outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                    <Key className="text-orange-600" />
                  </div>
                  <h5 className="font-bold text-slate-800 mb-2">Alterar Senha</h5>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">Sua última alteração foi há 12 dias.</p>
                  <button className="text-xs font-black text-orange-600 uppercase tracking-widest hover:underline">Atualizar</button>
                </div>
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Lock className="text-blue-600" />
                  </div>
                  <h5 className="font-bold text-slate-800 mb-2">Duplo Fator (2FA)</h5>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">Aumente a proteção da sua conta via aplicativo.</p>
                  <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Configurar</button>
                </div>
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                    <Globe className="text-primary-800" />
                  </div>
                  <h5 className="font-bold text-slate-800 mb-2">Sessões Ativas</h5>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">Você está conectado em 1 dispositivo.</p>
                  <button className="text-xs font-black text-primary-800 uppercase tracking-widest hover:underline">Gerenciar</button>
                </div>
             </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Preferências da Plataforma</h4>
            <div className="space-y-4">
              {[
                { title: 'Notificações Push', desc: 'Receber alertas de novos pacientes e mensagens em tempo real.', active: true },
                { title: 'Relatórios Semanais', desc: 'Estatísticas de produtividade e comparecimento via e-mail.', active: true },
                { title: 'Modo Foco', desc: 'Silenciar rede médica durante horários de consulta intensa.', active: false },
                { title: 'IA Preditiva', desc: 'Permitir que o assistente sugira CID baseado na anamnese inicial.', active: true }
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-100 transition-colors">
                  <div>
                    <h6 className="font-bold text-slate-800 text-sm">{pref.title}</h6>
                    <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${pref.active ? 'bg-primary-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.active ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 space-y-8">
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
        <div className="h-48 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -bottom-16 left-10 flex items-end gap-6">
            <div className="relative group">
              <img 
                src="https://picsum.photos/200/200?u=rafael" 
                alt="Profile" 
                className="w-36 h-36 rounded-[2.5rem] border-8 border-white object-cover shadow-2xl"
              />
              <button className="absolute bottom-2 right-2 bg-primary-800 text-white p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                <Camera size={20} />
              </button>
            </div>
            <div className="pb-4">
              <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-primary-100 font-bold text-sm flex items-center gap-1.5">
                  <Building2 size={14} /> {profile.role}
                </span>
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                <span className="text-primary-100 font-bold text-sm flex items-center gap-1.5">
                  <Calendar size={14} /> {profile.registration}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-24 pb-10 px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-xs transition-all
                    ${isActive 
                      ? 'bg-primary-800 text-white shadow-xl shadow-primary-900/10 scale-105' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl transition-all transform active:scale-95 
              ${saveSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-primary-800 hover:bg-primary-900 text-white shadow-primary-900/10'
              }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {isSaving ? 'SALVANDO...' : saveSuccess ? 'DADOS SALVOS!' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>

        <div className="p-10 bg-slate-50/50 border-t border-slate-100">
           {renderTabContent()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Atendimentos Totais', val: '856', color: 'text-primary-800' },
          { label: 'Discussões na Rede', val: '42', color: 'text-blue-600' },
          { label: 'Dúvidas IA Sanadas', val: '198', color: 'text-purple-600' },
          { label: 'Taxa de Fidelidade', val: '95%', color: 'text-emerald-600' }
        ].map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <p className={`text-2xl font-black ${m.color}`}>{m.val}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
