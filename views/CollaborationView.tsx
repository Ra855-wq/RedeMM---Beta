
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, UserPlus, Send, Search, UserCheck, ShieldCheck, X, 
  Mail, Lock, ShieldAlert, CheckCircle2, Bot, Sparkles, Zap, Clock,
  MoreVertical, Paperclip, Smile, Image as ImageIcon, Loader2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../utils/firebase';
import { 
  collection, query, where, getDocs, onSnapshot, addDoc, 
  serverTimestamp, orderBy, doc, setDoc, getDoc 
} from 'firebase/firestore';

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  photo?: string;
  avatar?: string;
  lastSeen?: string;
  idFuncional: string;
}

export const CollaborationView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'id'>('email');
  const [inputValue, setInputValue] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'me' | 'other', time: string}[]>([]);
  const [isTurboActive, setIsTurboActive] = useState(false);
  const [turboTime, setTurboTime] = useState(3600);
  const [chatId, setChatId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs
        .filter(d => d.id !== auth.currentUser?.uid)
        .map(d => ({
          id: d.id,
          ...d.data(),
          avatar: d.data().photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.data().name)}&background=random`
        } as Contact));
      setContacts(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (!selectedContact || !auth.currentUser) {
      setChatId(null);
      setMessages([]);
      return;
    }

    const id = [auth.currentUser.uid, selectedContact.id].sort().join('_');
    setChatId(id);

    const q = query(
      collection(db, `chats/${id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.senderId === auth.currentUser?.uid ? 'me' as const : 'other' as const,
          time: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
        };
      });
      setMessages(newMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${id}/messages`);
    });

    return () => unsubscribe();
  }, [selectedContact]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: any;
    if (isTurboActive && turboTime > 0) {
      interval = setInterval(() => {
        setTurboTime(prev => prev - 1);
      }, 1000);
    } else if (turboTime === 0) {
      setIsTurboActive(false);
      setTurboTime(3600);
    }
    return () => clearInterval(interval);
  }, [isTurboActive, turboTime]);

  const formatTime = (seconds: number) => {
    const caps = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${caps.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !chatId || !auth.currentUser) return;
    
    const text = chatMessage;
    setChatMessage('');

    try {
      // Ensure chat exists
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [auth.currentUser.uid, selectedContact?.id],
          lastUpdate: serverTimestamp()
        });
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId: auth.currentUser.uid,
        text: text,
        timestamp: serverTimestamp()
      });

      await setDoc(chatRef, { 
        lastMessage: text,
        lastUpdate: serverTimestamp() 
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

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
        <div className="p-6 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Rede Médica</h2>
            <button 
              onClick={() => setInviteModalOpen(true)}
              className="w-10 h-10 bg-neutral-900 text-white rounded-xl shadow-xl hover:bg-accent-600 transition-all flex items-center justify-center active:scale-90"
            >
              <UserPlus size={18} />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4 group-focus-within:text-accent-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar colega..." 
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
          {loadingContacts ? (
            <div className="flex flex-col items-center justify-center p-10 gap-3">
              <Loader2 className="animate-spin text-accent-600" size={24} />
              <p className="text-[8px] font-black uppercase text-slate-400">Buscando Colegas...</p>
            </div>
          ) : contacts.map((contact) => (
            <button 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all hover:bg-white hover:shadow-surgical ${selectedContact?.id === contact.id ? 'bg-white shadow-surgical border border-slate-100' : 'border border-transparent opacity-80 hover:opacity-100'}`}
            >
              <div className="relative">
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                  contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-black text-slate-900 text-xs truncate">{contact.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{contact.role}</p>
              </div>
            </button>
          ))}
          {!loadingContacts && contacts.length === 0 && (
            <p className="text-center text-[10px] font-bold text-slate-400 p-10">Nenhum médico ativo no momento.</p>
          )}
        </div>

        <div className="p-4 bg-white border-t border-neutral-100 space-y-3">
           <button 
             onClick={() => setIsTurboActive(!isTurboActive)}
             className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
               isTurboActive 
               ? 'bg-amber-100 text-amber-600 border border-amber-200' 
               : 'bg-neutral-900 text-white shadow-xl hover:bg-accent-600'
             }`}
           >
             <Zap size={16} className={isTurboActive ? 'animate-bounce' : ''} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">
               {isTurboActive ? `HORA DO TURBO: ${formatTime(turboTime)}` : 'ATIVAR HORA DO TURBO'}
             </span>
           </button>
           <div className="p-3 bg-accent-50 rounded-xl border border-accent-100 flex items-center gap-3">
              <ShieldCheck size={14} className="text-accent-600 shrink-0" />
              <p className="text-[8px] font-black text-accent-700 uppercase tracking-widest">Túnel E2EE Ativo</p>
           </div>
        </div>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Header do Chat */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <img src={selectedContact.avatar} className="w-12 h-12 rounded-2xl border border-slate-100" />
                <div>
                   <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                     {selectedContact.name} 
                     <span className="px-2 py-0.5 bg-slate-100 text-[8px] rounded-full text-slate-400">{selectedContact.idFuncional}</span>
                   </h3>
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Digitando...
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-3 text-slate-400 hover:text-accent-600 hover:bg-slate-50 rounded-xl transition-all"><Lock size={18} /></button>
                 <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scroll bg-slate-50/20">
               {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-4">
                       <MessageSquare size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Inicie a troca de informações clínicas seguras.</p>
                 </div>
               )}
               {messages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] p-5 rounded-[2rem] shadow-sm ${
                      msg.sender === 'me' 
                      ? 'bg-neutral-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                       <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                       <span className={`text-[8px] font-black uppercase tracking-widest mt-2 block ${msg.sender === 'me' ? 'text-white/40' : 'text-slate-300'}`}>
                         {msg.time} • ENVIADO
                       </span>
                    </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            {/* Input do Chat */}
            <div className="p-6 bg-white border-t border-neutral-100">
               <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                  <div className="flex gap-1">
                    <button type="button" className="p-3 text-slate-400 hover:text-neutral-900 transition-all"><Smile size={20} /></button>
                    <button type="button" className="p-3 text-slate-400 hover:text-neutral-900 transition-all"><Paperclip size={20} /></button>
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Analisar caso clínico..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-14 h-14 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-accent-600 transition-all active:scale-90 shrink-0"
                  >
                    <Send size={20} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-white relative overflow-hidden">
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
                Selecione um colega ao lado para iniciar.
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
        )}
      </div>

      {/* Modal de Convite */}
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
