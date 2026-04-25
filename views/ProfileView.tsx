
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Phone, MapPin, ShieldCheck, Bell, Award, 
  Camera, Save, Lock, Key, Globe, Building2, Calendar, CheckCircle2, 
  Loader2, Sparkles, Zap, Fingerprint, Stethoscope, ChevronRight, 
  Hash, BrainCircuit, GraduationCap, BookOpen, Plus, FileText, 
  Upload, Trash2, ExternalLink, X, Image
} from 'lucide-react';
import { safeStorage } from '../utils/storage';
import { db, auth, handleFirestoreError, OperationType } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'redemm_profile_data';

const DEFAULT_PROFILE = {
  name: 'Dr. Rafael Dalazen Araujo',
  role: 'Médico Bolsista PMMB',
  crm: 'CRM/ES 987.654',
  rms: 'RMS/MS 123.456.789-00',
  email: 'rafael.araujo@saude.gov.br',
  phone: '(27) 99888-7766',
  ubs: 'Unidade de Saúde Joaquim Industrial Viana/ES',
  registration: 'PMMB #772154',
  photo: '/input_file_1.png',
  branding_logo: '/input_file_0.png',
  bio: 'Médico Bolsista do PMMB em ciclo de aperfeiçoamento profissional. Foco em Estratégia Saúde da Família e desenvolvimento de competências em Medicina de Comunidade.',
  academic: [
    { id: '1', title: 'Especialização em Saúde da Família', institution: 'UNASUS/UFES', year: '2023' }
  ],
  publications: [
    { id: '1', title: 'Manejo de Hipertensão em Áreas Rurais', journal: 'Revista Brasileira de Medicina de Família', link: '#' }
  ],
  certifications: []
};

export const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'fellowship' | 'security' | 'preferences' | 'notifications'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<any>(DEFAULT_PROFILE);

  const [notifications, setNotifications] = useState({
    preceptoria: true,
    relatorios: true,
    forum: false,
    ia_updates: true,
    email_digest: false,
    sms_alerts: false
  });

  const [appearance, setAppearance] = useState({
    darkMode: false,
    accentColor: 'blue',
    compactMode: false
  });
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchProfile();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          name: data.name || auth.currentUser.displayName || DEFAULT_PROFILE.name,
          email: data.email || auth.currentUser.email || DEFAULT_PROFILE.email,
          photo: data.photo || auth.currentUser.photoURL || DEFAULT_PROFILE.photo
        });
        if (data.notifications) setNotifications(data.notifications);
        if (data.appearance) setAppearance(data.appearance);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isMounted.current || !auth.currentUser) return;

    // Minimal validation
    const rmsPattern = /^RMS\/MS\s\d{3}\.\d{3}\.\d{3}-\d{2}$/i;
    const crmPattern = /^CRM\/[A-Z]{2}\s\d+(\.\d+)?$/i;
    const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

    if (profile.rms && !rmsPattern.test(profile.rms) && !profile.rms.includes('#')) {
      alert('Formato de RMS inválido. Use: RMS/MS 000.000.000-00');
      return;
    }
    if (profile.crm && !crmPattern.test(profile.crm)) {
      alert('Formato de CRM inválido. Use: CRM/UF 000.000');
      return;
    }
    if (profile.phone && !phonePattern.test(profile.phone)) {
      alert('Formato de telefone inválido. Use: (00) 00000-0000');
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(docRef, {
        ...profile,
        notifications,
        appearance,
        updatedAt: new Date()
      }, { merge: true });
      
      if (profile.personal_api_key) {
        localStorage.setItem('pmmb_personal_api_key', profile.personal_api_key);
      } else {
        localStorage.removeItem('pmmb_personal_api_key');
      }

      if (isMounted.current) {
        setIsSaving(false);
        setSaveSuccess(true);
      }
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
      setTimeout(() => {
        if (isMounted.current) setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser?.uid}`);
      if (isMounted.current) setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. O limite é 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev: any) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev: any) => ({ ...prev, branding_logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, certId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isMounted.current) {
          setProfile((prev: any) => ({
            ...prev,
            certifications: prev.certifications.map((c: any) => 
              c.id === certId ? { ...c, fileBase64: base64String, fileName: file.name } : c
            )
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (category: 'academic' | 'publications' | 'certifications') => {
    const id = Math.random().toString(36).substr(2, 9);
    let newItem: any;
    if (category === 'academic') newItem = { id, title: '', institution: '', year: '' };
    if (category === 'publications') newItem = { id, title: '', journal: '', link: '' };
    if (category === 'certifications') newItem = { id, name: '', issuer: '', date: '' };
    
    setProfile((prev: any) => ({
      ...prev,
      [category]: [...(prev[category] || []), newItem]
    }));
  };

  const updateItem = (category: string, id: string, field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [category]: prev[category].map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (category: string, id: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [category]: prev[category].filter((item: any) => item.id !== id)
    }));
  };

  const tabs = [
    { id: 'info', label: 'Dados do Bolsista', icon: UserIcon },
    { id: 'fellowship', label: 'Produção & Fellowship', icon: GraduationCap },
    { id: 'security', label: 'Segurança & Acesso', icon: ShieldCheck },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'preferences', label: 'Aparência', icon: Zap },
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
                    placeholder="Ex: CRM/ES 123.456"
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-accent-50 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone de Contato</label>
                  <input 
                    type="text" 
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Ex: (27) 99999-8888"
                    className="w-full bg-white border border-slate-100 rounded-[1.8rem] px-8 py-5 text-base font-bold text-slate-800 transition-all shadow-sm" 
                  />
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

      case 'fellowship':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Academic Achievements */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> CONQUISTAS ACADÊMICAS
                </h4>
                <button onClick={() => addItem('academic')} className="p-2 bg-slate-50 text-accent-600 rounded-xl hover:bg-accent-600 hover:text-white transition-all">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {profile.academic?.map((item: AcademicItem) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 items-end">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título/Prêmio</label>
                      <input type="text" value={item.title} onChange={(e) => updateItem('academic', item.id, 'title', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" placeholder="Ex: Primeiro Lugar no Congresso..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Instituição</label>
                      <input type="text" value={item.institution} onChange={(e) => updateItem('academic', item.id, 'institution', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" placeholder="UNASUS..." />
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano</label>
                        <input type="text" value={item.year} onChange={(e) => updateItem('academic', item.id, 'year', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" placeholder="2024" />
                      </div>
                      <button onClick={() => removeItem('academic', item.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Publications */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> PUBLICAÇÕES & ARTIGOS
                </h4>
                <button onClick={() => addItem('publications')} className="p-2 bg-slate-50 text-accent-600 rounded-xl hover:bg-accent-600 hover:text-white transition-all">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {profile.publications?.map((item: PublicationItem) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 items-end">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Artigo</label>
                      <input type="text" value={item.title} onChange={(e) => updateItem('publications', item.id, 'title', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Veículo/Revista</label>
                      <input type="text" value={item.journal} onChange={(e) => updateItem('publications', item.id, 'journal', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" />
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link/DOI</label>
                        <input type="text" value={item.link} onChange={(e) => updateItem('publications', item.id, 'link', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" placeholder="https://..." />
                      </div>
                      <button onClick={() => removeItem('publications', item.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications & Uploads */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> CERTIFICAÇÕES PMMB
                </h4>
                <button onClick={() => addItem('certifications')} className="p-2 bg-slate-50 text-accent-600 rounded-xl hover:bg-accent-600 hover:text-white transition-all">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {profile.certifications?.map((item: CertificationItem) => (
                  <div key={item.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Certificação</label>
                        <input type="text" value={item.name} onChange={(e) => updateItem('certifications', item.id, 'name', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Emissor</label>
                        <input type="text" value={item.issuer} onChange={(e) => updateItem('certifications', item.id, 'issuer', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Emissão</label>
                        <input type="text" value={item.date} onChange={(e) => updateItem('certifications', item.id, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800" />
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4">
                      {item.fileBase64 ? (
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest truncate max-w-[100px]">{item.fileName}</p>
                            <button onClick={() => window.open(item.fileBase64, '_blank')} className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                              VER DOC <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer group">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group-hover:bg-accent-600 group-hover:text-white transition-all flex items-center gap-3">
                            <Upload size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">UPLOAD DOC</span>
                          </div>
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, item.id)} />
                        </label>
                      )}
                      <button onClick={() => removeItem('certifications', item.id)} className="p-4 text-slate-200 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Branding Section */}
                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-surgical-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-accent-100 group-hover:text-accent-500/20 transition-colors">
                    <Award size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                      <Image size={24} />
                    </div>
                    <h5 className="font-black text-slate-900 text-lg mb-2">Identidade Visual (Portfólio)</h5>
                    <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Sua marca MedSentinel e assinaturas personalizadas.</p>
                    
                    <div className="flex items-center gap-6">
                      {profile.branding_logo && (
                        <div className="relative w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2">
                          <img src={profile.branding_logo} alt="Sua Marca" className="w-full h-full object-contain" />
                          <button 
                            onClick={() => setProfile({...profile, branding_logo: null})}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                            aria-label="Remover logo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      
                      <label 
                        className="flex-1 cursor-pointer"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleBrandingUpload({ target: { files: [file] } } as any);
                        }}
                      >
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-accent-400 transition-all text-center group/upload">
                          <Upload size={24} className="mx-auto mb-2 text-slate-300 group-hover/upload:text-accent-500 transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Arraste Logo ou Icone</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleBrandingUpload} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-surgical-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-accent-100 group-hover:text-accent-500/20 transition-colors">
                    <Key size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                      <Key size={24} />
                    </div>
                    <h5 className="font-black text-slate-900 text-lg mb-2">Chave de Inteligência (API)</h5>
                    <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Personalize seu acesso aos modelos Gemini. Sua chave é armazenada de forma segura.</p>
                    
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal API Key (Oculto)</label>
                       <input 
                         type="password" 
                         value={profile.personal_api_key || ''}
                         onChange={(e) => setProfile({...profile, personal_api_key: e.target.value})}
                         placeholder="Ex: AIzaSyB..."
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-accent-50 outline-none transition-all" 
                       />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-surgical-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-red-50 group-hover:text-red-500/10 transition-colors">
                    <Trash2 size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-all">
                      <Trash2 size={24} />
                    </div>
                    <h5 className="font-black text-slate-900 text-lg mb-2">Limpeza de Ambiente</h5>
                    <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Apague o cache e dados temporários do navegador para liberar espaço e resolver conflitos.</p>
                    
                    <button 
                      onClick={() => {
                        if (window.confirm('Deseja ativar a limpeza profunda? Isso removerá suas preferências locais e redefinirá o ambiente. Dados no servidor PMMB permanecerão intactos.')) {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      ATIVAR LIMPEZA PROFUNDA
                    </button>
                  </div>
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
      case 'notifications':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> CANAIS DE COMUNICAÇÃO
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'preceptoria', title: 'Notificações de Preceptoria', desc: 'Alertas de supervisão e feedbacks pedagógicos.' },
                { id: 'relatorios', title: 'Relatórios de Atividades', desc: 'Envio automático de logs para o Ministério da Saúde.' },
                { id: 'forum', title: 'Fórum de Discussão PMM', desc: 'Habilitar notificações de casos clínicos da rede bolsista.' },
                { id: 'ia_updates', title: 'Atualizações da IA', desc: 'Novos protocolos e descobertas do Cérebro Clínico.' },
                { id: 'email_digest', title: 'Resumo Semanal por E-mail', desc: 'Compilado de atividades e pendências.' },
                { id: 'sms_alerts', title: 'Alertas Críticos via SMS', desc: 'Notificações urgentes de saúde pública.' }
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${(notifications as any)[pref.id] ? 'bg-accent-500 animate-pulse' : 'bg-slate-200'}`}></div>
                    <div>
                      <h6 className="font-bold text-slate-800 text-base">{pref.title}</h6>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{pref.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [pref.id]: !(prev as any)[pref.id] }))}
                    className={`w-14 h-7 rounded-full transition-all relative ${(notifications as any)[pref.id] ? 'bg-neutral-900' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${(notifications as any)[pref.id] ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> CUSTOMIZAÇÃO VISUAL
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <h6 className="font-bold text-slate-800 text-base mb-4">Modo Escuro (Beta)</h6>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Otimizado para plantões noturnos.</p>
                    <button 
                      onClick={() => setAppearance(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      className={`w-14 h-7 rounded-full transition-all relative ${appearance.darkMode ? 'bg-neutral-900' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${appearance.darkMode ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <h6 className="font-bold text-slate-800 text-base mb-4">Interface Compacta</h6>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Maximiza a densidade de informação.</p>
                    <button 
                      onClick={() => setAppearance(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                      className={`w-14 h-7 rounded-full transition-all relative ${appearance.compactMode ? 'bg-neutral-900' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${appearance.compactMode ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div> COR DE ACENTO
              </h4>
              <div className="flex flex-wrap gap-4">
                {['blue', 'emerald', 'violet', 'amber', 'rose', 'slate'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAppearance(prev => ({ ...prev, accentColor: color }))}
                    className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center border-4 ${
                      appearance.accentColor === color ? 'border-neutral-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'violet' ? '#8b5cf6' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : '#64748b' }}
                  >
                    {appearance.accentColor === color && <CheckCircle2 size={20} className="text-white" />}
                  </button>
                ))}
              </div>
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
              <div className="absolute -inset-4 bg-white/50 backdrop-blur-xl rounded-full border border-white/80 shadow-2xl"></div>
              <img 
                id="profile-img-main"
                src={profile.photo || "/input_file_1.png"} 
                alt={`Foto de perfil de ${profile.name}`} 
                className="w-44 h-44 rounded-full object-cover relative z-10 shadow-2xl transition-all duration-700 profile-image-refined border-4 border-white"
              />
              <label 
                htmlFor="profile-photo-input"
                className="absolute bottom-2 right-2 z-20 bg-neutral-900 text-white p-4 rounded-full shadow-2xl hover:bg-accent-600 transition-all cursor-pointer focus-within:ring-4 focus-within:ring-accent-400 outline-none"
                aria-label="Alterar foto de perfil"
                title="Alterar foto de perfil"
              >
                <Camera size={20} aria-hidden="true" />
                <input 
                  id="profile-photo-input"
                  type="file" 
                  className="sr-only" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </label>
            </div>
            
            <div className="pb-28">
               <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{profile.name}</h2>
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center text-white shadow-lg">
                     <CheckCircle2 size={18} />
                  </div>
                  {profile.branding_logo && (
                    <img 
                      src={profile.branding_logo} 
                      alt="Logo MedSentinel" 
                      className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity ml-2" 
                    />
                  )}
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
          <div className="flex bg-slate-50 p-2 rounded-[2.2rem] border border-slate-100 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap
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
            className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-surgical-xl transition-all transform active:scale-95 group shrink-0
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
