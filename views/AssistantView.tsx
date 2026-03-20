
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Loader2, Sparkles, User, Bot, Mic, Volume2, Lightbulb, Zap, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioDataPCM(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const AssistantView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Advanced Gemini Parameters
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(0.95);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const speechText = text.length > 500 ? text.substring(0, 500) + "..." : text;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga de forma rápida e clara: ${speechText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (base64Audio) {
        const audioData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioDataPCM(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error("Erro no TTS:", e);
      setIsSpeaking(false);
    }
  };

  const startTranscription = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => setInput(prev => prev + " " + event.results[0][0].transcript);
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        systemInstruction: "Você é o Cérebro Clínico 3.0. Seja ultra-rápido, técnico e preciso. Foco em protocolos PMMB e CID-10.",
        temperature,
        topK,
        topP
      };
      if (useDeepThinking) config.thinkingConfig = { thinkingBudget: 16000 };

      const response = await ai.models.generateContent({
        model: useDeepThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: userMsg,
        config: config
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Sem resposta." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Erro de conexão." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200 p-6 flex flex-col shadow-2xl mb-6 floating-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-[1.5rem] shadow-2xl transition-all ${isProcessing ? 'bg-blue-600 animate-pulse' : 'bg-neutral-900'}`}>
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Cérebro Clínico 3.0</h2>
              <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest mt-0.5 flex items-center gap-1">
                <Zap size={10} /> {useDeepThinking ? 'Pensamento Profundo' : 'Modo Instantâneo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${showSettings ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600'}`}
            >
              <Settings2 size={16} /> Parâmetros {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
               <button onClick={() => setUseDeepThinking(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!useDeepThinking ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Flash</button>
               <button onClick={() => setUseDeepThinking(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${useDeepThinking ? 'bg-neutral-900 text-white shadow-xl' : 'text-slate-400'}`}>Pro</button>
            </div>
          </div>
        </div>

        {/* Advanced Parameters Panel */}
        {showSettings && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temperatura</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{temperature.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Controla a criatividade. Valores menores = mais focado/determinístico. Maiores = mais criativo.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top-K</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{topK}</span>
              </div>
              <input 
                type="range" min="1" max="40" step="1" 
                value={topK} onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Limita o vocabulário às K palavras mais prováveis. Reduz respostas absurdas.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top-P</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{topP.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Amostragem de núcleo. Considera apenas tokens cuja probabilidade cumulativa seja P.</p>
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-white/40 rounded-[3rem] border border-white/80 shadow-inner custom-scroll mb-6 backdrop-blur-sm">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
            <Sparkles className="text-blue-500 w-12 h-12" />
            <h3 className="text-2xl font-black text-slate-900">IA Clínica Instantânea</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">Pronto para análise de casos, diagnósticos diferenciais e protocolos SUS em tempo real.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-xl border ${msg.role === 'user' ? 'bg-neutral-900 text-white border-neutral-800 rounded-tr-none' : 'bg-white border-slate-100 text-slate-900 rounded-tl-none font-medium'}`}>
                  {msg.content}
                </div>
              </div>
              {msg.role === 'assistant' && (
                <button onClick={() => speakText(msg.content)} disabled={isSpeaking} className={`ml-14 p-3 rounded-2xl border transition-all shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-blue-600'}`}>
                  <Volume2 size={14} /> {isSpeaking ? 'Falando...' : 'Ouvir Agora'}
                </button>
              )}
            </div>
          </div>
        ))}
        {isProcessing && <div className="flex gap-4 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl animate-pulse"><Loader2 className="animate-spin text-blue-600" /> <span className="text-[10px] font-black uppercase text-slate-400">Processando...</span></div>}
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl border border-slate-200">
        <div className="flex gap-3 items-center">
          <button onClick={startTranscription} className={`p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-blue-600'}`}><Mic size={24} /></button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Digite ou fale o caso clínico..." className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
          <button onClick={handleSend} disabled={isProcessing || !input.trim()} className="bg-neutral-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-90"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
};
