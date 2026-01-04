
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  UserPlus, 
  Send, 
  Phone, 
  Mail, 
  Search, 
  MoreVertical, 
  CheckCheck,
  PlusCircle,
  X
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  online: boolean;
  role: string;
  avatar: string;
}

export const CollaborationView: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ contact: '', type: 'email' });
  const [messageText, setMessageText] = useState('');
  
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', name: 'Dr. Roberto Mendes', lastMessage: 'Como está o paciente do leito 4?', unreadCount: 2, online: true, role: 'Clínico Geral', avatar: 'https://i.pravatar.cc/150?u=roberto' },
    { id: '2', name: 'Dra. Aline Souza', lastMessage: 'Encaminhamento enviado.', unreadCount: 0, online: false, role: 'Pediatra', avatar: 'https://i.pravatar.cc/150?u=aline' },
    { id: '3', name: 'Rede UBS Norte', lastMessage: 'Reunião de equipe às 14h.', unreadCount: 0, online: true, role: 'Grupo Colaborativo', avatar: 'https://i.pravatar.cc/150?u=group' },
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      { id: 'm1', senderId: '1', text: 'Boa tarde, Dra. Marina. Conseguiu revisar o prontuário da Dona Maria?', timestamp: '14:20' },
      { id: 'm2', senderId: 'me', text: 'Oi Roberto, estou vendo agora. Os exames de creatinina estão um pouco alterados.', timestamp: '14:22' },
      { id: 'm3', senderId: '1', text: 'Pois é, notei isso. Será que ajustamos a dose da Losartana?', timestamp: '14:25' },
    ]
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChatId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));
    setMessageText('');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de convite
    const newChat: Chat = {
      id: Date.now().toString(),
      name: inviteData.contact.split('@')[0] || inviteData.contact,
      lastMessage: 'Convite enviado via ' + inviteData.type,
      unreadCount: 0,
      online: false,
      role: 'Novo Contato',
      avatar: `https://i.pravatar.cc/150?u=${inviteData.contact}`
    };
    setChats([newChat, ...chats]);
    setInviteModalOpen(false);
    setInviteData({ contact: '', type: 'email' });
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 animate-in fade-in duration-700">
      
      {/* Chats Sidebar */}
      <div className="w-full md:w-80 flex flex-col border-r border-slate-100 bg-slate-50/30">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-primary-900 tracking-tight">Mensagens</h2>
            <button 
              onClick={() => setInviteModalOpen(true)}
              className="p-2 bg-primary-800 text-white rounded-xl hover:bg-primary-900 transition-all shadow-lg shadow-primary-900/10"
            >
              <UserPlus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar contatos..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full flex gap-3 p-3 rounded-2xl transition-all ${
                activeChatId === chat.id 
                ? 'bg-white shadow-md border border-slate-100 scale-[1.02]' 
                : 'hover:bg-white/50 border border-transparent'
              }`}
            >
              <div className="relative">
                <img src={chat.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                {chat.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{chat.name}</h4>
                  {chat.unreadCount > 0 && (
                    <span className="bg-primary-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider mb-1">{chat.role}</p>
                <p className="text-xs text-slate-400 truncate leading-relaxed">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 bg-white">
        {activeChat ? (
          <>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={activeChat.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{activeChat.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className={`w-2 h-2 rounded-full ${activeChat.online ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    {activeChat.online ? 'Ativo agora' : 'Visto por último hoje'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-primary-800 hover:bg-slate-50 rounded-xl transition-all"><Phone size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-primary-800 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5"
            >
              {(messages[activeChatId!] || []).map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.senderId === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.senderId === 'me' 
                        ? 'bg-primary-800 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] text-slate-400 font-bold">{msg.timestamp}</span>
                      {msg.senderId === 'me' && <CheckCheck size={12} className="text-primary-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-50">
              <div className="flex gap-3 max-w-4xl mx-auto items-center">
                <button className="p-2.5 text-slate-400 hover:text-primary-800 hover:bg-primary-50 rounded-xl transition-all">
                  <PlusCircle size={24} />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem para o Dr..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 text-white p-3.5 rounded-2xl shadow-xl shadow-primary-900/10 transition-all transform active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare size={36} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Selecione uma conversa</h3>
            <p className="text-sm text-slate-400 max-w-xs mt-2">Escolha um profissional ao lado para iniciar uma discussão clínica colaborativa.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden border border-white/50">
            <button 
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mb-8">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="text-primary-800 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-primary-900 tracking-tight">Expandir Rede</h3>
              <p className="text-slate-500 text-sm mt-1">Convide outros médicos para colaborar no atendimento.</p>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tipo de Convite</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setInviteData({...inviteData, type: 'email'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs border transition-all ${inviteData.type === 'email' ? 'bg-primary-800 border-primary-800 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-primary-200'}`}
                  >
                    <Mail size={16} /> E-mail
                  </button>
                  <button 
                    type="button"
                    onClick={() => setInviteData({...inviteData, type: 'phone'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs border transition-all ${inviteData.type === 'phone' ? 'bg-primary-800 border-primary-800 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-primary-200'}`}
                  >
                    <Phone size={16} /> Telefone
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {inviteData.type === 'email' ? 'E-mail Institucional' : 'Número com DDD'}
                </label>
                <input 
                  type={inviteData.type === 'email' ? 'email' : 'tel'}
                  required
                  placeholder={inviteData.type === 'email' ? 'medico@exemplo.com' : '(00) 00000-0000'}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white transition-all shadow-inner"
                  value={inviteData.contact}
                  onChange={(e) => setInviteData({...inviteData, contact: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary-800 hover:bg-primary-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-900/10 transition-all active:scale-[0.98]"
              >
                ENVIAR CONVITE AGORA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
