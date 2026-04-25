
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Search, Loader2, Building2, Hospital, Stethoscope, 
  Navigation, Crosshair, Target, Volume2, Hash
} from 'lucide-react';
import { safeStorage } from '../utils/storage';

import { searchHealthFacilities, generateTTS } from '../utils/aiService';

declare const L: any;

// Helper para decodificar base64 (usado no TTS)
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
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
  const clusterGroupRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Coordenadas padrão (Vitória, ES - Região de atuação do bolsista padrão)
  const DEFAULT_LAT = -20.3155;
  const DEFAULT_LNG = -40.3128;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const container = mapContainerRef.current;
      mapRef.current = L.map(container, {
        preferCanvas: true,
        zoomControl: false,
        attributionControl: false
      }).setView([DEFAULT_LAT, DEFAULT_LNG], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);
      
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        animate: true,
        disableClusteringAtZoom: 18,
        iconCreateFunction: (cluster: any) => {
          const childCount = cluster.getChildCount();
          let c = ' bg-accent-600';
          if (childCount < 10) c = ' bg-accent-500';
          else if (childCount < 100) c = ' bg-accent-600';
          
          return L.divIcon({
            html: `<div class="w-10 h-10 flex items-center justify-center rounded-full text-white font-black text-xs shadow-xl ${c}"><span>${childCount}</span></div>`,
            className: 'marker-cluster-custom',
            iconSize: [40, 40]
          });
        }
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    const currentMap = mapRef.current;
    const currentContainer = mapContainerRef.current;

    const resizeObserver = new ResizeObserver(() => {
      if (currentMap) currentMap.invalidateSize();
    });
    
    if (currentContainer) resizeObserver.observe(currentContainer);
    handleGetLocation();

    return () => {
      resizeObserver.disconnect();
      if (currentMap) {
        // Clear all layers before removing map
        currentMap.eachLayer((layer: any) => {
          try { currentMap.removeLayer(layer); } catch(e) {}
        });
        currentMap.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleGetLocation = () => {
    if (!mapRef.current) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mapRef.current) return;
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          const m = mapRef.current;
          m.setView([coords.lat, coords.lng], 15);
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div class="relative flex items-center justify-center"><div class="absolute w-12 h-12 bg-accent-500/20 rounded-full animate-ping"></div><div class="w-5 h-5 bg-accent-600 border-4 border-white rounded-full shadow-2xl z-10"></div></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(m);
        },
        (err) => {
          console.error("Erro GPS:", err);
          if (!mapRef.current) return;
          const profileData = safeStorage.getItem('redemm_profile_data');
          if (profileData) {
            const profile = JSON.parse(profileData);
            if (profile.ubs && profile.ubs.includes('ES')) {
              mapRef.current?.setView([DEFAULT_LAT, DEFAULT_LNG], 12);
            }
          }
        }
      );
    }
  };

  const speakText = async (id: number, place: any) => {
    if (speakingId !== null) return;
    setSpeakingId(id);
    try {
      const prompt = `Unidade de saúde localizada: ${place.title}. Recomendação PMMB: Validar fluxo de encaminhamento via SISREG. `;
      const base64Audio = await generateTTS(prompt);
      
      if (base64Audio) {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') await ctx.resume();
        const audioData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioDataPCM(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
           if (mapContainerRef.current) setSpeakingId(null);
        };
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
      const data = await searchHealthFacilities(searchTerm, location || undefined);
      const chunks = data.groundingMetadata?.groundingChunks || [];
      const extracted = chunks
        .filter((c: any) => c.maps)
        .map((c: any, idx: number) => ({
          id: idx,
          title: c.maps.title,
          uri: c.maps.uri,
          lat: location ? location.lat + (Math.random() - 0.5) * 0.05 : DEFAULT_LAT + (Math.random() - 0.5) * 0.2,
          lng: location ? location.lng + (Math.random() - 0.5) * 0.05 : DEFAULT_LNG + (Math.random() - 0.5) * 0.2
        }));
      setResults(extracted);
      if (clusterGroupRef.current && mapRef.current) {
        clusterGroupRef.current.clearLayers();
        const markers = extracted.map((p: any) => {
          const facilityIcon = L.divIcon({
            className: 'facility-marker',
            html: `<div class="w-10 h-10 bg-white border-2 border-accent-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><div class="w-2 h-2 bg-accent-600 rounded-full"></div></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          });
          return L.marker([p.lat, p.lng], { icon: facilityIcon })
            .bindPopup(`<div class="p-4 min-w-[200px]"><p class="font-black text-slate-900 text-sm mb-2 uppercase tracking-tight">${p.title}</p><div class="h-px bg-slate-100 mb-3"></div><a href="${p.uri}" target="_blank" class="w-full bg-neutral-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">Ir para Localização</a></div>`, { closeButton: false });
        });
        clusterGroupRef.current.addLayers(markers);
        if (extracted.length > 0) mapRef.current.fitBounds(clusterGroupRef.current.getBounds(), { padding: [100, 100], animate: true });
      }
    } catch (e) { console.error("Erro na busca de rede:", e); } finally { setLoading(false); }
  };

  const quickFilters = [
    { label: 'UBS', query: 'Unidade Básica de Saúde UBS próxima', icon: Building2 },
    { label: 'URGÊNCIAS', query: 'Hospital Pronto Atendimento UPA', icon: Hospital },
    { label: 'PSICOSSOCIAL', query: 'CAPS Centro de Atenção Psicossocial', icon: Stethoscope },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Search Bar */}
      <div className="bg-white/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-100 shadow-surgical flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder="Pesquisar infraestrutura no território..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-6 pr-6 py-4 bg-white border border-slate-50 rounded-full focus:outline-none focus:ring-4 focus:ring-accent-500/5 font-bold text-slate-800 transition-all text-sm shadow-inner"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex-1 md:flex-none bg-neutral-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
            MAPEAR REDE
          </button>
          <button onClick={handleGetLocation} className="p-4 bg-white text-neutral-800 border border-slate-50 rounded-full hover:bg-slate-50 hover:text-accent-600 transition-all shadow-surgical active:scale-95">
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Results List */}
        <div className="w-full lg:w-[360px] bg-white rounded-3xl border border-slate-100 shadow-surgical flex flex-col overflow-hidden shrink-0">
           <div className="p-6 border-b border-slate-50">
              <h3 className="font-black text-neutral-900 text-[9px] uppercase tracking-[0.3em] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_8px_#3b82f6]"></div> 
                 TERRITÓRIO SINCRONIZADO
              </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <MapPin size={28} className="text-slate-200" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 italic leading-relaxed">
                    INICIE O MAPEAMENTO PARA VISUALIZAR A REDE.
                  </p>
                </div>
              ) : results.map((r, i) => (
                <div key={r.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-accent-400 hover:bg-white hover:shadow-surgical transition-all duration-300 group cursor-pointer" onClick={() => mapRef.current?.setView([r.lat, r.lng], 17)}>
                   <div className="flex justify-between items-start mb-3">
                      <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-accent-600 shadow-sm group-hover:bg-neutral-900 group-hover:text-white transition-all">
                        <Building2 size={18} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); speakText(i, r); }} className={`p-2.5 rounded-xl transition-all ${speakingId === i ? 'bg-accent-600 text-white animate-pulse' : 'bg-white text-slate-300 hover:text-accent-600 shadow-sm'}`}>
                        <Volume2 size={14} />
                      </button>
                   </div>
                   <h4 className="font-black text-slate-800 text-sm group-hover:text-accent-600 transition-colors mb-3 truncate">{r.title}</h4>
                   <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><Hash size={9} /> REDEMM #{1000 + i}</span>
                      <a href={r.uri} target="_blank" className="p-1.5 text-accent-600 hover:scale-110 transition-transform"><Navigation size={14} /></a>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Map Container with Integrated HUD */}
        <div className="flex-1 bg-slate-100 rounded-3xl border-4 border-white shadow-surgical-xl overflow-hidden relative group">
          <div ref={mapContainerRef} className="w-full h-full grayscale-[0.1] hover:grayscale-0" />
          
          {/* Integrated HUD Row */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-3 pointer-events-none items-center">
             <div className="bg-neutral-900/95 backdrop-blur-xl px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-white/10 pointer-events-auto">
                <div className="w-1 h-3 bg-accent-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">OPTIMIZED CLUSTER ENGINE</span>
             </div>
             
             <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto flex-1">
                {quickFilters.map((f, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setQuery(f.label); handleSearch(f.query); }}
                    className="px-5 py-3 bg-white/95 backdrop-blur-xl rounded-xl text-[8px] font-black text-neutral-900 uppercase tracking-widest border border-slate-100 shadow-2xl hover:bg-accent-600 hover:text-white transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap group/btn"
                  >
                    <f.icon size={10} className="group-hover/btn:text-white" /> {f.label}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
