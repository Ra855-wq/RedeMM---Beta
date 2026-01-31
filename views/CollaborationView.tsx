
import React, { useState } from 'react';
import { 
  MessageSquare, UserPlus, Send, Search, UserCheck, ShieldCheck, X, 
  Mail, Lock, ShieldAlert, CheckCircle2, Bot, Sparkles
} from 'lucide-react';

export const CollaborationView: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'id'>('email');
  const [inputValue, setInputValue] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    if (inviteMethod === 'id' && !inputValue.startsWith('PMM-')) {
      setInviteError('O ID deve começar com PMM- (Exclusivo para Mais Médicos)');
      setIsSending(false);
      return;
    }

    if (inviteMethod === 'email' && !inputValue.includes('@')) {
      setInviteError('Insira um e-mail institucional válido.');
      setIsSending(false);
      return;
    }

    // Simulação de validação de segurança ministerial
    setTimeout(() => {
      setInviteModalOpen(false);
      setInputValue('');
      setInviteError('');
      setIsSending(false);
      alert('Solicitação de conexão enviada via túnel criptografado RedeMM.');
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[3rem] border border-neutral-100 shadow-surgical-xl overflow-hidden animate-in fade-in duration-700">
      {/* Sidebar de Conversas */}
      <div className="w-80 flex flex-col border-r border-neutral-100 bg-slate-50/30">
        <div className="p-8 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Rede Médica</h2>
            <button 
              onClick={() => setInviteModalOpen(true)}
              className="w-12 h-12 bg-neutral-900 text-white rounded-2xl shadow-xl hover:bg-accent-600 transition-all flex items-center justify-center active:scale-90"
              title="Adicionar Novo Profissional"
            >
              <UserPlus size={20} />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4 group-focus-within:text-accent-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar ID ou Nome..." 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all" 
            />
          </div>
        </div>

        {/* Lista Vazia Estilizada */}
        <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
            <MessageSquare size={32} className="text-slate-300" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-[140px] leading-relaxed italic">
            Nenhuma conversa ativa no momento.
          </p>
        </div>

        <div className="p-6 bg-white border-t border-neutral-100">
           <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100 flex items-center gap-3">
              <ShieldCheck size={16} className="text-accent-600 shrink-0" />
              <p className="text-[9px] font-black text-accent-700 uppercase tracking-widest">Canal Criptografado</p>
           </div>
        </div>
      </div>

      {/* Área Principal de Colaboração */}
      <div className="flex-1 flex flex-col items-center justify-center p-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-white relative overflow-hidden">
        {/* Background elements para profundidade */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-400/5 blur-[120px] rounded-full"></div>

        <div className="max-w-lg text-center relative z-10 animate-zoom-fade">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-surgical-xl border border-slate-50 flex items-center justify-center mx-auto mb-10 relative">
             <ShieldCheck size={48} className="text-neutral-200" />
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <Lock size={14} />
             </div>
          </div>
          
          <h3 className="text-4xl font-black text-neutral-900 mb-6 tracking-tighter leading-tight">Colaboração Exclusiva PMMB</h3>
          <p className="text-base text-slate-500 font-medium leading-relaxed mb-12">
            Este espaço é restrito e monitorado para interação segura entre médicos do Programa Mais Médicos. 
            Conecte-se com colegas usando <span className="text-accent-600 font-bold">E-mail Institucional</span> ou <span className="text-neutral-900 font-bold">ID Funcional</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
               onClick={() => setInviteModalOpen(true)} 
               className="px-12 py-6 bg-neutral-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-surgical-xl hover:bg-accent-600 transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               <UserPlus size={18} /> NOVO CONTATO PMMB
             </button>
             <div className="hidden sm:flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Segurança Ativa</span>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite Atualizado */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-md p-12 shadow-3xl relative border border-white/50 animate-zoom-fade">
            <button 
              onClick={() => setInviteModalOpen(false)} 
              className="absolute top-8 right-8 p-3 text-slate-300 hover:text-neutral-900 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <X size={28} />
            </button>

            <div className="mb-10">
              <div className="w-16 h-16 bg-neutral-900 rounded-[1.8rem] flex items-center justify-center mb-6 shadow-2xl">
                <UserPlus className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-black text-neutral-900 tracking-tight">Conectar Profissional</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed italic">
                Acesso validado e criptografado para evitar erros de privacidade.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] mb-8 border border-slate-200">
              <button 
                onClick={() => {setInviteMethod('email'); setInviteError('');}}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inviteMethod === 'email' ? 'bg-white shadow-lg text-accent-600' : 'text-slate-400'}`}
              >
                <Mail size={14} /> E-mail (Padrão)
              </button>
              <button 
                onClick={() => {setInviteMethod('id'); setInviteError('');}}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inviteMethod === 'id' ? 'bg-white shadow-lg text-neutral-900' : 'text-slate-400'}`}
              >
                <Sparkles size={14} /> ID PMMB
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                  {inviteMethod === 'email' ? 'E-mail Institucional Profissional' : 'ID Funcional PMM (Ex: PMM-1234)'}
                </label>
                <div className="relative group">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${inputValue ? 'text-accent-500' : 'text-slate-300'}`}>
                    {inviteMethod === 'email' ? <Mail size={18} /> : <UserCheck size={18} />}
                  </div>
                  <input 
                    type={inviteMethod === 'email' ? 'email' : 'text'} 
                    required 
                    placeholder={inviteMethod === 'email' ? 'medico@saude.gov.br' : 'PMM-0000'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.8rem] pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white focus:border-accent-300 transition-all"
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                  />
                </div>
                {inviteError && (
                  <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1 ml-2">
                    <ShieldAlert size={14} /> {inviteError}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSending || !inputValue}
                className="w-full bg-neutral-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-surgical-xl hover:bg-accent-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={18} />}
                SOLICITAR CONEXÃO SEGURA
              </button>

              <div className="p-6 bg-slate-50 rounded-[2.2rem] border border-slate-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                    <Lock size={16} className="text-slate-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Criptografia E2EE</p>
                    <p className="text-[9px] text-slate-400 font-bold leading-tight">Privacidade garantida via túnel SSL-3000. Nenhum dado de conversa é armazenado em servidores externos.</p>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
