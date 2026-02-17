
import React, { useState } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, 
  Stethoscope, HeartPulse, Pill, Activity, Dna, Syringe, BrainCircuit, GraduationCap
} from 'lucide-react';

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
    if (username === 'dlx' && password === 'bmw32') {
      onLogin();
    } else {
      setError('Credenciais PMMB inválidas. Verifique seu RMS e senha.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const medicalSymbols = [
    { Icon: Stethoscope, top: '10%', left: '5%' },
    { Icon: HeartPulse, top: '25%', left: '15%' },
    { Icon: Activity, top: '45%', left: '8%' },
    { Icon: GraduationCap, top: '70%', left: '12%' },
    { Icon: Dna, top: '85%', left: '5%' },
    { Icon: Syringe, top: '15%', left: '85%' },
    { Icon: BrainCircuit, top: '35%', left: '92%' },
    { Icon: ShieldCheck, top: '60%', left: '88%' },
    { Icon: Activity, top: '80%', left: '95%' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {medicalSymbols.map((item, idx) => (
          <div key={idx} className="absolute text-accent-500 animate-float" style={{ top: item.top, left: item.left, animationDelay: `${idx * 0.5}s` }}>
            <item.Icon size={idx % 2 === 0 ? 40 : 64} strokeWidth={1} />
          </div>
        ))}
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[1000px] flex bg-white/5 backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-zoom-fade relative z-10">
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#020617] to-neutral-900 p-16 flex-col justify-between relative border-r border-white/5">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <BrainCircuit className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-6">
              REDE<span className="text-accent-500">MM</span>
            </h1>
            <p className="text-accent-500/60 font-black uppercase tracking-[0.4em] text-[10px] mb-8">
              Surgical Intelligence v3.1 · PMMB
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck size={18} className="text-accent-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Acesso Restrito a Bolsistas</span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <GraduationCap size={18} className="text-accent-500" />
                <span className="text-xs font-bold uppercase tracking-widest">RMS Ministerial Validado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-12 sm:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Portal do Bolsista</h2>
            <p className="text-sm font-bold text-slate-400">Entre com seu ID Ministerial/RMS para iniciar.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RMS ou ID Ministerial</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent-600 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-14 pr-4 py-6 border border-slate-100 rounded-3xl text-slate-800 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all font-bold text-lg"
                  placeholder="Seu RMS..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Ministerial</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-14 py-6 border border-slate-100 rounded-3xl text-slate-800 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all font-bold text-lg"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-accent-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 bg-neutral-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:bg-accent-600 transition-all transform active:scale-[0.98] mt-4"
            >
              Autenticar Fellowship
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
