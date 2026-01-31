
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { 
  Mic, MicOff, Loader2, Activity, 
  HelpCircle, Sparkles, BookOpen, Zap, AlertTriangle, RefreshCw
} from 'lucide-react';

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const LiveAssistantView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    inputAudioCtxRef.current?.close();
    inputAudioCtxRef.current = null;
    outputAudioCtxRef.current?.close();
    outputAudioCtxRef.current = null;
    setIsActive(false);
    for (const source of sourcesRef.current) { try { source.stop(); } catch(e){} }
    sourcesRef.current.clear();
  };

  const startLiveSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputAudioCtxRef.current.state === 'suspended') await inputAudioCtxRef.current.resume();
      if (outputAudioCtxRef.current.state === 'suspended') await outputAudioCtxRef.current.resume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          systemInstruction: "Você é o Assistente v3.1 da RedeMM. Foco Mais Médicos. Respostas curtas, orais e precisas.",
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob })).catch(err => console.error("Send error", err));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.inputTranscription) setTranscription(m.serverContent.inputTranscription.text);
            const base64 = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64 && outputAudioCtxRef.current) {
              const ctx = outputAudioCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buf = await decodeAudioData(decode(base64), ctx, 24000, 1);
              const src = ctx.createBufferSource();
              src.buffer = buf;
              src.connect(ctx.destination);
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(src);
              src.onended = () => sourcesRef.current.delete(src);
            }
          },
          onerror: (e) => {
            console.error("Session Error", e);
            setError("Erro na conexão com a IA. Tente novamente.");
            stopSession();
          },
          onclose: () => stopSession()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Boot failure", e);
      setError("Falha ao iniciar microfone ou conexão.");
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-1000">
      <div className="bg-white p-12 rounded-[3.5rem] border border-neutral-100 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden floating-card min-h-[500px]">
        <div className={`absolute top-0 inset-x-0 h-2 transition-all duration-700 ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-neutral-100'}`}></div>
        
        {error ? (
          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 text-red-600 space-y-4 max-w-sm">
            <AlertTriangle className="mx-auto w-12 h-12" />
            <h3 className="font-black uppercase text-xs tracking-widest">Erro de Inicialização</h3>
            <p className="text-xs font-bold leading-relaxed">{error}</p>
            <button onClick={startLiveSession} className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95"><RefreshCw size={14} /> Tentar Reconectar</button>
          </div>
        ) : (
          <>
            <div className="mb-10 relative">
              <div className={`w-40 h-40 rounded-[3rem] flex items-center justify-center transition-all duration-700 border-2 ${isActive ? 'bg-neutral-900 border-blue-400 scale-110 shadow-3xl' : 'bg-neutral-50 border-white shadow-inner scale-100'}`}>
                {isActive ? (
                  <div className="flex gap-2 items-end h-16">
                    {[1,2,3,4,5].map((h, i) => (
                      <div key={i} className="w-2 bg-blue-400 rounded-full animate-bounce" style={{ height: `${h * 15}%`, animationDelay: `${i*0.1}s` }}></div>
                    ))}
                  </div>
                ) : <HelpCircle size={64} className="text-neutral-200" />}
              </div>
              {isActive && <Zap className="absolute -top-4 -right-4 text-blue-500 w-8 h-8 animate-pulse" />}
            </div>

            <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Assistente Vocal 3.1</h2>
            <p className="text-neutral-400 font-bold text-sm mb-12 italic">Fale naturalmente sobre CID-10 e fluxos do SUS.</p>

            <div className="w-full max-w-xl bg-neutral-900 rounded-[2.5rem] p-8 mb-12 min-h-[140px] flex flex-col justify-center shadow-2xl border border-white/5">
               {isActive ? (
                  <p className="text-blue-400 font-black text-xl leading-relaxed italic">"{transcription || "Aguardando sua voz..."}"</p>
               ) : <Activity size={32} className="text-white opacity-20 mx-auto" />}
            </div>

            <button onClick={isActive ? stopSession : startLiveSession} disabled={isConnecting} className={`flex items-center gap-4 px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-red-500 text-white' : 'bg-neutral-900 text-white'}`}>
              {isConnecting ? <Loader2 className="animate-spin" /> : isActive ? <MicOff size={24} /> : <Mic size={24} />}
              {isConnecting ? 'CONECTANDO...' : isActive ? 'PARAR' : 'ATIVAR MICROFONE'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
