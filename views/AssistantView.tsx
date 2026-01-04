
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const AssistantView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          systemInstruction: "Você é o RedeMM-GPT, um assistente clínico sênior focado na Atenção Primária do SUS. Forneça raciocínios profundos sobre protocolos, diagnósticos e manejos clínicos, sempre citando evidências e respeitando a ética médica."
        }
      });

      const assistantMsg = response.text || "Desculpe, não consegui processar o raciocínio clínico agora.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (error) {
      console.error("Erro no assistente:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Houve um erro técnico na conexão com o cérebro clínico. Tente novamente." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-in fade-in duration-500">
      <div className="bg-white rounded-t-3xl border-x border-t border-slate-100 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-xl">
            <BrainCircuit className="text-primary-700 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Cérebro Clínico RedeMM</h2>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              PENSAMENTO ATIVO (GEMINI 3 PRO)
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-[10px] text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
          Uso Exclusivo em Atenção Primária
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white border-x border-slate-100 overflow-y-auto p-6 space-y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-primary-50 rounded-3xl flex items-center justify-center">
              <Sparkles className="text-primary-400 w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-700">Como posso ajudar hoje?</h3>
            <p className="text-sm text-slate-500">Inicie um raciocínio sobre manejo de hipertensão resistente, protocolos de IST ou conduta em saúde mental na UBS.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-800'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-slate-100 text-slate-800'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                <span className="text-xs font-medium text-slate-500 italic">Raciocinando sobre o caso clínico...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 border border-slate-100 rounded-b-3xl shadow-lg">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Descreva o caso clínico ou a dúvida..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-primary-200"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          IA pode cometer erros. Sempre verifique informações clínicas essenciais.
        </p>
      </div>
    </div>
  );
};
