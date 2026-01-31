import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciais solicitadas: usuário 'dlx' e senha 'bmw32'
    if (username === 'dlx' && password === 'bmw32') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Verifique o usuário e senha.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden p-10 sm:p-14 border border-white relative z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-full flex justify-center mb-6">
             <img 
               src="./logo.png" 
               alt="RedeMM Logo" 
               className="h-32 w-auto object-contain drop-shadow-sm"
             />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Portal do Profissional</h2>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.25em]">Acesso Seguro & Criptografado</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID do Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-14 pr-4 py-5 border border-slate-100 rounded-2xl text-slate-700 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white focus:border-primary-200 transition-all font-semibold"
                placeholder="Ex: dlx"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                <Lock className="h-5 w-5 text-slate-300" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-14 pr-14 py-5 border border-slate-100 rounded-2xl text-slate-700 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:bg-white focus:border-primary-200 transition-all font-semibold"
                placeholder="••••••••"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-700 focus:ring-primary-500 border-slate-200 rounded transition-all cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                Lembrar ID
              </label>
            </div>
            <button type="button" className="text-[10px] font-black text-primary-700 hover:text-primary-900 transition-colors uppercase tracking-widest">
              Esqueci a Senha
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-2xl shadow-primary-900/10 text-xs font-black uppercase tracking-[0.2em] text-white bg-primary-800 hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all transform active:scale-[0.98]"
          >
            Acessar RedeMM
          </button>
        </form>

        <div className="mt-12 text-center space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Novo na rede?{' '}
            <button className="font-black text-primary-700 hover:text-primary-900 transition-colors underline decoration-2 underline-offset-4">
              Solicitar Matrícula
            </button>
          </p>
          <div className="flex justify-center items-center gap-4 text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] bg-slate-50 py-3 rounded-2xl">
            <div className="flex items-center gap-1"><ShieldCheck size={12} className="text-primary-500" /> SSL</div>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <div>ISO 27001</div>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <div>LGPD Compliant</div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-xs leading-loose">
        Uso restrito a profissionais de saúde autorizados pela Rede Médica Popular.
      </p>
    </div>
  );
};