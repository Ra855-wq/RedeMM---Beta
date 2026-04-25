
import React, { useState } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, 
  Stethoscope, HeartPulse, Pill, Activity, Dna, Syringe, BrainCircuit, GraduationCap,
  LogIn
} from 'lucide-react';
import { safeStorage } from '../utils/storage';
import { auth, db } from '../utils/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rmsId, setRmsId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let userData;
      if (!userSnap.exists()) {
        userData = {
          name: user.displayName || 'Médico Bolsista',
          username: user.email?.split('@')[0] || 'user',
          rmsId: 'PMMB-PENDING',
          role: 'doctor',
          status: 'pending',
          photo: user.photoURL || '',
          email: user.email || '',
        };
        await setDoc(userRef, userData);
        setError('Conta criada. Aguarde liberação do moderador.');
        return;
      } else {
        userData = { id: user.uid, ...userSnap.data() };
        if (userData.status !== 'active' && userData.role !== 'admin') {
          setError('Conta aguardando liberação do moderador.');
          return;
        }
      }
      
      safeStorage.setItem('redemm_user', JSON.stringify(userData));
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao autenticar com Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (isRegistering) {
        const rmsPattern = /^[A-Z0-9]+-[A-Z0-9]+$/i;
        if (!rmsId) {
          setError('RMS/ID é obrigatório.');
          return;
        }
        if (!rmsPattern.test(rmsId)) {
          setError('Formato de RMS/ID inválido. Use algo como PMMB-12345');
          return;
        }
      }

      const mockEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@redemm.app`;
      
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, mockEmail, password);
        const userRef = doc(db, 'users', result.user.uid);
        const userData = {
          name,
          username,
          rmsId,
          role: 'doctor',
          status: 'pending',
          photo: '',
          email: mockEmail
        };
        await setDoc(userRef, userData);
        setSuccess('Conta criada. Aguarde liberação do moderador.');
        setIsRegistering(false);
      } else {
        const result = await signInWithEmailAndPassword(auth, mockEmail, password);
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = { id: result.user.uid, ...userSnap.data() };
          if (userData.status !== 'active' && userData.role !== 'admin') {
            setError('Sua conta está aguardando liberação.');
            auth.signOut();
            return;
          }
          safeStorage.setItem('redemm_user', JSON.stringify(userData));
          onLogin();
        } else {
          setError('Perfil de usuário não encontrado.');
          auth.signOut();
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por senha não está ativado no projeto. Ative a autenticação E-mail/Senha no console Firebase ou use Login com Google.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('RMS ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este usuário/RMS já está cadastrado.');
      } else {
        setError(err.message || 'Ocorreu um erro durante a autenticação.');
      }
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
              Surgical Intelligence v0.1.0-beta · PMMB
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isRegistering ? 'Solicitar Acesso' : 'Portal do Bolsista'}
            </h2>
            <p className="text-sm font-bold text-slate-400">
              {isRegistering ? 'Preencha os dados para análise do moderador.' : 'Entre com seu ID Ministerial/RMS para iniciar.'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-6 bg-white border border-slate-100 text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-sm hover:bg-slate-50 hover:border-slate-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 mb-4 group"
            >
              <LogIn size={18} className="text-accent-600 group-hover:scale-110 transition-transform" />
              Entrar com Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Ou credenciais RMS</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            {isRegistering && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent-600 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-14 pr-4 py-6 border border-slate-100 rounded-3xl text-slate-800 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all font-bold text-lg"
                      placeholder="Seu nome..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RMS / ID (Formato PMMB-XXXX)</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-accent-600 transition-colors" />
                    <input
                      type="text"
                      value={rmsId}
                      onChange={(e) => setRmsId(e.target.value)}
                      className="block w-full pl-14 pr-4 py-6 border border-slate-100 rounded-3xl text-slate-800 bg-slate-50/50 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all font-bold text-lg"
                      placeholder="PMMB-..."
                      required
                    />
                  </div>
                </div>
              </>
            )}

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
              id="login-submit-btn"
              type="submit"
              className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-accent-600 hover:shadow-accent-500/20 transition-all transform active:scale-[0.98] mt-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-600/0 via-accent-600/10 to-accent-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">{isRegistering ? 'Enviar Solicitação' : 'Autenticar Fellowship'}</span>
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] font-black text-accent-600 uppercase tracking-widest hover:underline"
              >
                {isRegistering ? 'Já tenho acesso? Entrar' : 'Não tem acesso? Solicitar Credenciais'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
