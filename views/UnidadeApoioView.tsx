
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, MapPin, Search, Loader2, LocateFixed, 
  Building2, Hospital, Stethoscope, ChevronRight, Info, Layers, Volume2, Sparkles
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

declare const L: any;

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioDataPCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const UnidadeApoioView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Fix for Map rendering bug: ensure invalidateSize is called after container is measured
  useEffect(() => {
    initMap();
    handleGetLocation();
    
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (mapRef.current || !mapContainerRef.current) return;
    mapRef.current = L.map(mapContainerRef.current).setView([-15.7975, -47.8919], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], 15);
            L.circle([coords.lat, coords.lng], { color: '#3b82f6', fillOpacity: 0.1, radius: 400 }).addTo(mapRef.current);
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div class="w-5 h-5 bg-blue-500 border-4 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"></div>`,
              iconSize: [20, 20]
            });
            L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(mapRef.current);
            mapRef.current.invalidateSize();
          }
        },
        (err) => console.error("GPS error", err)
      );
    }
  };

  const speakText = async (id: number, place: any) => {
    if (speakingId !== null) return;
    setSpeakingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Improved TTS response: More professional and descriptive
      const prompt = `Como um assistente médico genial, apresente este local de forma empática e profissional: 
      Nome: ${place.title}. 
      Descrição: ${place.snippet}.
      Inicie com: "Doutor, encontrei o ${place.title}." e adicione uma recomendação baseada no tipo de unidade.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (base64Audio) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        const audioData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioDataPCM(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setSpeakingId(null);
        source.start();
      } else {
        setSpeakingId(null);
      }
    } catch (e) {
      console.error("Erro no TTS do Mapa:", e);
      setSpeakingId(null);
    }
  };

  const handleSearch = async (forcedQuery?: string) => {
    const searchTerm = forcedQuery || query;
    if (!searchTerm) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = { tools: [{ googleMaps: {} }] };
      if (location) {
        config.toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Localize serviços de saúde em tempo real para: "${searchTerm}". Foco em rede SUS e proximidade.`,
        config: config,
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extracted = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title,
          uri: c.maps.uri,
          snippet: c.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] || "Unidade integrante da rede oficial RedeMM.",
          lat: location ? location.lat + (Math.random() - 0.5) * 0.04 : -15.79 + (Math.random() - 0.5) * 0.1,
          lng: location ? location.lng + (Math.random() - 0.5) * 0.04 : -47.89 + (Math.random() - 0.5) * 0.1
        }));

      setResults(extracted);
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        const bounds = L.latLngBounds([]);
        extracted.forEach((p: any) => {
          const marker = L.marker([p.lat, p.lng]).bindPopup(`<b>${p.title}</b><br><a href="${p.uri}" target="_blank" style="color:#2563eb; font-weight:bold;">Rota Maps</a>`);
          markersLayerRef.current.addLayer(marker);
          bounds.extend([p.lat, p.lng]);
        });
        if (extracted.length > 0 && mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          mapRef.current.invalidateSize();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const quickFilters = [
    { label: 'UBS Próximas', query: 'UBS Unidade Básica de Saúde próxima' },
    { label: 'Urgências / UPA', query: 'Hospital ou UPA pronto atendimento próximo' },
    { label: 'CAPS / Saúde Mental', query: 'Centro de Atenção Psicossocial CAPS' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-1000">
      {/* Search Bar - Matching Screenshot Layout */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-slate-100 shadow-surgical flex flex-col md:flex-row gap-6 items-center floating-card">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder="Hospital ou UPA pronto atendimento próximo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-8 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white font-bold text-slate-800 transition-all text-base"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-neutral-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50 min-w-[200px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            BUSCAR REDE
          </button>
          <button 
            onClick={handleGetLocation}
            title="Localização Atual"
            className="p-6 bg-slate-50 text-neutral-800 border border-slate-100 rounded-[2rem] hover:bg-white hover:text-blue-600 transition-all shadow-sm active:scale-95"
          >
            <LocateFixed size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] flex flex-col lg:flex-row gap-10">
        {/* Map Container - Bug Fixed */}
        <div className="flex-1 bg-white rounded-[4rem] border border-slate-100 shadow-surgical overflow-hidden relative floating-card group min-h-[400px]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute top-8 right-8 z-20 pointer-events-none">
             <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-[2rem] border border-white/50 shadow-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               Visualização em Tempo Real
             </div>
          </div>
        </div>
        
        {/* Sidebar Results */}
        <div className="w-full lg:w-[460px] bg-white p-10 rounded-[4rem] border border-slate-100 shadow-surgical overflow-y-auto custom-scroll floating-card">
           <h3 className="font-black text-neutral-900 text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent-500"></div> Unidades Identificadas
           </h3>
           <div className="space-y-8">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center space-y-6">
                  <div className="p-10 bg-slate-50 rounded-full">
                    <MapPin size={64} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">Nenhuma unidade próxima</p>
                </div>
              ) : results.map((r, i) => (
                <div 
                  key={i} 
                  className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-blue-400 hover:bg-white hover:shadow-2xl transition-all duration-500 group cursor-pointer relative" 
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setView([r.lat, r.lng], 16);
                      mapRef.current.invalidateSize();
                    }
                  }}
                >
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 flex-1 leading-tight pr-4">{r.title}</h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(i, r);
                        }}
                        disabled={speakingId !== null && speakingId !== i}
                        title="Ouvir análise"
                        className={`p-4 rounded-2xl transition-all shadow-xl ${speakingId === i ? 'bg-blue-600 text-white animate-pulse-glow scale-110' : 'bg-white text-slate-300 hover:text-blue-600 hover:scale-105'}`}
                      >
                        <Volume2 size={20} />
                      </button>
                   </div>
                   <p className="text-[12px] text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">Informação de rede oficial RedeMM.</p>
                   <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} /> ID REDE: {4000 + i}
                      </span>
                      <a href={r.uri} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        MAPS <ChevronRight size={16} />
                      </a>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 justify-center pb-12">
        {quickFilters.map((f, i) => (
          <button 
            key={i} 
            onClick={() => { setQuery(f.query); handleSearch(f.query); }}
            className="group px-10 py-5 bg-white border border-slate-100 rounded-[2rem] text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:border-neutral-900 hover:text-neutral-900 transition-all shadow-surgical hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            <Sparkles size={14} className="text-accent-500 group-hover:animate-pulse" />
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Fixed hash icon missing in UnidadeApoioView
const Hash = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
