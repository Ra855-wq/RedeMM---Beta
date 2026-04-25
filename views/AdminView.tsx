
import React, { useState, useEffect } from 'react';
import { User, Shield, UserPlus, CheckCircle, XCircle, Trash2, Mail, Key, UserCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { db } from '../utils/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data: UserType[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as UserType);
      });
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

  const handleUpdateStatus = async (id: string, status: 'active' | 'pending') => {
    try {
      await updateDoc(doc(db, 'users', id), { status });
      fetchUsers();
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-surgical overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bolsista</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">RMS / ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuário</th>
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
                          {user.name ? user.name.charAt(0) : '?'}
                        </div>
                        <span className="font-bold text-slate-700">{user.name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs text-accent-600 bg-accent-50 px-2 py-1 rounded font-bold underline decoration-accent-200 decoration-2 underline-offset-2">{user.rmsId || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{user.username || user.email?.split('@')[0]}</span>
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
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        user.status === 'admin' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {user.status === 'active' || user.status === 'admin' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {user.status === 'active' ? 'Ativo' : user.status === 'admin' ? 'Admin' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.status !== 'active' && user.role !== 'admin' && (
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
    </div>
  );
};
