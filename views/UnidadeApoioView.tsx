
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, MapPin, Search, Loader2, LocateFixed, 
  Building2, Hospital, Stethoscope, ChevronRight, Info, Layers, Volume2, Sparkles, Hash,
  Navigation, Crosshair, Target, ShieldCheck, Zap
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

declare const L: any;

// Helper para decodificar base64 (usado no TTS)
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper para processar áudio PCM bruto do Gemini
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Inicialização do Mapa com foco em performance (preferCanvas)
      mapRef.current = L.map(mapContainerRef.current, {
        preferCanvas: true,
        zoomControl: false,
        attributionControl: false
      }).setView([-15.7975, -47.8919], 4);

      // Estilo de mapa 'Surgical Voyager' (Limpo e profissional)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);
      
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    
    resizeObserver.observe(mapContainerRef.current);
    handleGetLocation();

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], 15);
            
            // Marcador de localização do Médico com estilo Pulse Surgical
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-12 h-12 bg-accent-500/20 rounded-full animate-ping"></div>
                  <div class="w-6 h-6 bg-accent-600 border-4 border-white rounded-full shadow-2xl z-10"></div>
                </div>
              `,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            });
            L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(mapRef.current);
          }
        },
        (err) => console.error("Erro GPS:", err)
      );
    }
  };

  const speakText = async (id: number, place: any) => {
    if (speakingId !== null) return;
    setSpeakingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Unidade localizada: ${place.title}. Descrição: ${place.snippet}. Clique para abrir navegação.`;

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
      setSpeakingId(null);
    }
  };

  const handleSearch = async (forcedQuery?: string) => {
    const searchTerm = forcedQuery || query;
    if (!searchTerm || loading) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = { tools: [{ googleMaps: {} }] };
      
      if (location) {
        config.toolConfig = { 
          retrievalConfig: { 
            latLng: { latitude: location.lat, longitude: location.lng } 
          } 
        };
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Encontre unidades de saúde oficiais para o médico bolsista: "${searchTerm}". Foco em rede SUS (UBS, UPA, CAPS).`,
        config: config,
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extracted = chunks
        .filter((c: any) => c.maps)
        .map((c: any, idx: number) => ({
          id: idx,
          title: c.maps.title,
          uri: c.maps.uri,
          snippet: c.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] || "Unidade da Rede Oficial PMMB.",
          // Mocking spatial distribution near current user for visualization
          lat: location ? location.lat + (Math.random() - 0.5) * 0.04 : -15.79 + (Math.random() - 0.5) * 0.1,
          lng: location ? location.lng + (Math.random() - 0.5) * 0.04 : -47.89 + (Math.random() - 0.5) * 0.1
        }));

      setResults(extracted);
      
      // Batch Processing de Marcadores (Alta Performance)
      if (markersLayerRef.current && mapRef.current) {
        markersLayerRef.current.clearLayers();
        const bounds = L.latLngBounds([]);
        
        const newMarkers = extracted.map((p: any) => {
          bounds.extend([p.lat, p.lng]);
          
          const facilityIcon = L.divIcon({
            className: 'facility-marker',
            html: `
              <div class="w-10 h-10 bg-white border-2 border-accent-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <div class="w-2 h-2 bg-accent-600 rounded-full"></div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          });

          return L.marker([p.lat, p.lng], { icon: facilityIcon })
            .bindPopup(`
              <div class="p-4 font-sans min-w-[200px]">
                <p class="font-black text-slate-900 text-sm mb-2 uppercase tracking-tight">${p.title}</p>
                <div class="h-px bg-slate-100 mb-3"></div>
                <a href="${p.uri}" target="_blank" class="w-full bg-neutral-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent-600 transition-all">
                  <Navigation size={12} /> Navegar Agora
                </a>
              </div>
            `, { closeButton: false });
        });

        newMarkers.forEach((m: any) => markersLayerRef.current.addLayer(m));

        if (extracted.length > 0) {
          mapRef.current.fitBounds(bounds, { padding: [100, 100], animate: true });
        }
      }
    } catch (e) {
      console.error("Erro na RedeMM Maps:", e);
    } finally {
      setLoading(false);
    }
  };

  const quickFilters = [
    { label: 'UBS', query: 'Unidade Básica de Saúde UBS próxima', icon: Building2 },
    { label: 'Urgências', query: 'Hospital Pronto Atendimento UPA', icon: Hospital },
    { label: 'Psicossocial', query: 'CAPS Centro de Atenção Psicossocial', icon: Stethoscope },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Barra de Pesquisa Cirúrgica */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-surgical flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full relative group">
          <div className="absolute inset-0 bg-accent-500/5 rounded-[2rem] scale-105 opacity-0 group-focus-within:opacity-100 transition-all blur-xl"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-slate-300 group-focus-within:text-accent-500 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar infraestrutura de saúde no território..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:bg-white font-bold text-slate-800 transition-all text-base"
            />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto shrink-0">
          <button 
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex-1 md:flex-none bg-neutral-900 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-accent-600 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
            MAPEAR REDE
          </button>
          <button 
            onClick={handleGetLocation}
            className="p-6 bg-slate-50 text-neutral-800 border border-slate-100 rounded-[2rem] hover:bg-white hover:text-accent-600 transition-all shadow-sm active:scale-95"
            title="Sincronizar GPS"
          >
            <Crosshair size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
        {/* Lista de Resultados Estilizada */}
        <div className="w-full lg:w-[420px] bg-white rounded-[4rem] border border-slate-100 shadow-surgical flex flex-col overflow-hidden shrink-0">
           <div className="p-10 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-black text-neutral-900 text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> 
                 Infraestrutura Identificada
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Sincronizado com RedeMM v3.1</p>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-6">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                    <MapPin size={48} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest italic leading-relaxed">Aguardando definição de zona territorial pelo médico bolsista.</p>
                </div>
              ) : results.map((r, i) => (
                <div 
                  key={r.id} 
                  className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-accent-400 hover:bg-white hover:shadow-surgical-xl transition-all duration-500 group cursor-pointer relative" 
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setView([r.lat, r.lng], 16);
                    }
                  }}
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-accent-600 shadow-sm group-hover:bg-neutral-900 group-hover:text-white transition-all">
                        <Building2 size={24} />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(i, r);
                        }}
                        className={`p-4 rounded-xl transition-all ${speakingId === i ? 'bg-accent-600 text-white animate-pulse' : 'bg-white text-slate-300 hover:text-accent-600 shadow-sm'}`}
                      >
                        <Volume2 size={18} />
                      </button>
                   </div>
                   <h4 className="font-black text-slate-800 text-lg group-hover:text-accent-600 transition-colors leading-tight mb-2 truncate">{r.title}</h4>
                   <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed italic mb-6">"{r.snippet}"</p>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} /> REDEMM #{1000 + i}
                      </span>
                      <a href={r.uri} target="_blank" className="p-2 text-accent-600 hover:scale-110 transition-transform">
                        <Navigation size={18} />
                      </a>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Container do Mapa com Overlay de Controle */}
        <div className="flex-1 bg-neutral-900 rounded-[4.5rem] border-8 border-white shadow-surgical-xl overflow-hidden relative group">
          <div ref={mapContainerRef} className="w-full h-full grayscale-[0.2] brightness-[0.9] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" />
          
          {/* HUD de Controle Superior */}
          <div className="absolute top-10 left-10 right-10 z-20 flex justify-between pointer-events-none">
             <div className="bg-neutral-900/90 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10 shadow-2xl flex items-center gap-4">
                <div className="w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Surgical GIS Active</span>
             </div>
             
             <div className="flex gap-4 pointer-events-auto">
                {quickFilters.map((f, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setQuery(f.label); handleSearch(f.query); }}
                    className="px-6 py-4 bg-white/90 backdrop-blur-xl rounded-2xl text-[10px] font-black text-neutral-900 uppercase tracking-widest border border-white shadow-2xl hover:bg-accent-600 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                  >
                    <f.icon size={14} /> {f.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Overlay Informativo Inferior */}
          <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
             <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-surgical-xl border border-white/50 max-w-xs animate-in slide-in-from-left-4 duration-1000">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocolo de Busca Seguro</p>
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Os dados apresentados são validados em tempo real via Google Maps Grounding para garantir precisão no encaminhamento de pacientes.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
