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
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 sm:p-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-700 p-3 rounded-xl mb-3 shadow-lg shadow-primary-200">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-800 tracking-tight">RedeMM</h1>
          <h2 className="text-xl font-semibold text-slate-800 mt-6">Bem-vindo de volta</h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Nome de usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Digite seu nome de usuário"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Digite sua senha"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-primary-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-600">
                Lembrar-me
              </label>
            </div>
            <button type="button" className="font-semibold text-primary-700 hover:text-primary-800">
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-600">
            Não tem uma conta?{' '}
            <button className="font-bold text-primary-700 hover:text-primary-800">
              Registre-se
            </button>
          </p>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400">
            © 2024 RedeMM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
