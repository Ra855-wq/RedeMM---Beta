import React, { useState } from 'react';
import { Network, Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(username && password) {
        onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-primary-900/5 overflow-hidden p-10 sm:p-12 border border-white/50">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary-800 p-4 rounded-3xl mb-4 shadow-xl shadow-primary-900/20">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-900 tracking-tighter">RedeMM</h1>
          <h2 className="text-lg font-medium text-slate-500 mt-4">Plataforma Clínica Integrada</h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-slate-100 rounded-2xl text-slate-700 bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white focus:border-primary-200 transition-all"
                placeholder="nome.sobrenome"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                <Lock className="h-5 w-5 text-slate-300" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 border border-slate-100 rounded-2xl text-slate-700 bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white focus:border-primary-200 transition-all"
                placeholder="••••••••"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-300 hover:text-primary-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-700 focus:ring-primary-500 border-slate-200 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-500">
                Manter conectado
              </label>
            </div>
            <button type="button" className="text-primary-700 hover:text-primary-900 transition-colors uppercase tracking-widest">
              Recuperar senha
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary-900/10 text-sm font-bold text-white bg-primary-800 hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all transform active:scale-[0.98]"
          >
            Acessar Plataforma
          </button>
        </form>

        <div className="mt-10 text-center space-y-6">
          <p className="text-xs font-medium text-slate-400">
            Dificuldades de acesso?{' '}
            <button className="font-bold text-primary-700 hover:text-primary-900 transition-colors">
              Suporte Técnico
            </button>
          </p>
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            <span>Privacidade</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span>Segurança</span>
          </div>
        </div>
      </div>
    </div>
  );
};