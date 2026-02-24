
import React, { useState, useEffect } from 'react';
import { User, Shield, UserPlus, CheckCircle, XCircle, Trash2, Mail, Key, UserCheck } from 'lucide-react';
import { User as UserType } from '../types';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'doctor' as const,
    status: 'active' as const
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', username: '', password: '', role: 'doctor', status: 'active' });
        fetchUsers();
      }
    } catch (err) {
      console.error("Erro ao criar usuário", err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'pending') => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchUsers();
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error("Erro ao excluir usuário", err);
    }
  };

  return (
    <div className="animate-zoom-fade space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Painel do Moderador</h2>
          <p className="text-slate-500 font-medium">Gerencie o acesso dos bolsistas e libere novas contas.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-4 bg-accent-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-accent-700 transition-all shadow-lg shadow-accent-500/20"
        >
          <UserPlus size={18} />
          Novo Bolsista
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-surgical overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bolsista</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuário / RMS</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Função</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{user.username}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <Shield size={14} className="text-amber-500" />
                        ) : (
                          <User size={14} className="text-blue-500" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {user.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(user.id, 'active')}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Aprovar"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-surgical-xl animate-zoom-fade">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Novo Bolsista</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><XCircle size={24} className="text-slate-300" /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:bg-white transition-all font-bold"
                    placeholder="Ex: Dr. João Silva"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RMS / Usuário</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    required
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:bg-white transition-all font-bold"
                    placeholder="rms12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Provisória</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:bg-white transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-accent-600 transition-all shadow-lg shadow-black/10"
              >
                Cadastrar e Liberar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
