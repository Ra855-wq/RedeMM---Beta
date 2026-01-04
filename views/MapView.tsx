
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Search, 
  Loader2, 
  LocateFixed, 
  Building2, 
  Stethoscope, 
  Hospital,
  ChevronRight,
  Info,
  Layers
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const MapView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Erro ao obter localização", err)
      );
    }
  };

  const getFacilityStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('ubs') || t.includes('unidade básica') || t.includes('posto')) {
      return { icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'UBS / Atenção Primária' };
    }
    if (t.includes('caps') || t.includes('psicossocial') || t.includes('mental')) {
      return { icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'CAPS / Saúde Mental' };
    }
    if (t.includes('hospital') || t.includes('upa') || t.includes('urgência') || t.includes('pronto')) {
      return { icon: Hospital, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Hospital / Urgência' };
    }
    return { icon: Navigation, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Especialidades / Outros' };
  };

  const handleSearch = async (forcedQuery?: string) => {
    const searchTerm = forcedQuery || query;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = searchTerm 
        ? `Encontre serviços de saúde (UBS, Hospitais, CAPS) para a seguinte busca: "${searchTerm}". Se for em outro estado, liste as melhores opções naquela região.`
        : `Liste as Unidades Básicas de Saúde (UBS) e serviços de urgência mais próximos da minha localização atual.`;
      
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (location && (!searchTerm || !searchTerm.toLowerCase().includes(" em "))) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config,
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedResults = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title,
          uri: c.maps.uri,
          snippet: c.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] || "Informações detalhadas disponíveis no link oficial."
        }));

      setResults(extractedResults);
    } catch (error) {
      console.error("Erro na busca do mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickFilters = [
    { id: 'ubs', label: 'UBS Próximas', icon: Building2, query: 'Unidade Básica de Saúde próxima' },
    { id: 'caps', label: 'CAPS', icon: Stethoscope, query: 'Centro de Atenção Psicossocial (CAPS)' },
    { id: 'hospital', label: 'Hospitais', icon: Hospital, query: 'Hospital de Referência e Urgência' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex p-4 bg-primary-100/50 rounded-3xl mb-6 ring-8 ring-primary-50">
            <MapPin className="text-primary-600 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mapa de Atuação RedeMM</h2>
          <p className="text-slate-500 mt-3 text-lg leading-relaxed">
            Navegue pela rede SUS em tempo real. Localize serviços próximos ou planeje referenciamentos em outros estados.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-500 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
            <div className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ex: UBS em Salvador, CAPS em MG..."
                  className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all text-slate-700 font-semibold text-lg shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-10 py-5 rounded-[1.5rem] font-bold transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2 transform active:scale-95"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Buscar'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 px-4">
            <button 
              onClick={handleGetLocation}
              className="flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800 transition-all bg-primary-50 px-4 py-2 rounded-full"
            >
              <LocateFixed size={16} />
              {location ? 'Localização Ativada' : 'Ativar GPS'}
            </button>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <Info size={12} />
              Resultados Grounded via Google
            </div>
          </div>
        </div>

        {/* Legend and Filters Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12 border-t border-slate-50 pt-8">
          {/* Quick Filters */}
          <div className="flex-1 w-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} /> Filtros Rápidos
            </p>
            <div className="flex flex-wrap gap-3">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setQuery(filter.query);
                    handleSearch(filter.query);
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-sm font-bold transition-all
                    ${activeFilter === filter.id 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-100 scale-105' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50 hover:text-primary-700 shadow-sm'
                    }`}
                >
                  <filter.icon size={18} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 min-w-[280px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legenda de Serviços</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Building2 size={14} className="text-emerald-600" /></div>
                <span>Atenção Básica (UBS)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Stethoscope size={14} className="text-purple-600" /></div>
                <span>Saúde Mental (CAPS)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><Hospital size={14} className="text-rose-600" /></div>
                <span>Urgência (UPA/Hospital)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
              <div key={i} className="h-56 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100 shadow-inner"></div>
            ))
          ) : results.length > 0 ? (
            results.map((place, idx) => {
              const style = getFacilityStyle(place.title);
              const StyleIcon = style.icon;
              return (
                <div key={idx} className={`group flex flex-col bg-white border border-slate-100 rounded-[2rem] p-7 hover:shadow-2xl hover:shadow-primary-100/50 hover:border-primary-100 transition-all duration-500 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <div className={`${style.bg} p-2.5 rounded-2xl shadow-sm`}>
                      <ExternalLink size={18} className={style.color} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${style.bg} rounded-2xl mb-6 transition-all ring-4 ring-transparent group-hover:ring-white`}>
                      <StyleIcon className={`${style.color} w-7 h-7`} />
                    </div>
                    <div className="mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${style.bg} ${style.color}`}>
                            {style.label}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight mb-3 group-hover:text-primary-900 transition-colors">
                      {place.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-8 pr-4">
                      {place.snippet}
                    </p>
                  </div>

                  <a 
                    href={place.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between w-full py-4 px-5 bg-slate-50 group-hover:bg-primary-600 rounded-2xl transition-all duration-300 group/btn shadow-inner"
                  >
                    <span className="text-xs font-extrabold text-slate-600 group-hover:text-white uppercase tracking-wider">Ver Direções</span>
                    <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                        <Navigation size={16} className="text-slate-400 group-hover:text-white" />
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                    </div>
                  </a>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200">
                <Search size={40} className="text-slate-300" />
              </div>
              <h4 className="text-2xl font-bold text-slate-700">Explore a rede de saúde</h4>
              <p className="text-slate-500 max-w-sm mt-3 text-lg leading-relaxed">
                Utilize a barra de busca ou os filtros rápidos para localizar unidades em qualquer lugar do país.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="bg-gradient-to-br from-primary-900 to-slate-900 text-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary-900/30 ring-1 ring-white/10">
        <div className="flex gap-6 items-center">
          <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-md ring-1 ring-white/20">
            <Hospital className="w-10 h-10 text-primary-200" />
          </div>
          <div className="max-w-md">
            <h3 className="font-bold text-2xl mb-1 italic">Logística de Referenciamento</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Consulte tempos de deslocamento e disponibilidade de serviços especializados integrados ao Google Maps.
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setQuery("Hospitais de Referência e Urgência");
            handleSearch("Hospitais de Referência e Urgência");
          }}
          className="bg-white text-primary-900 px-8 py-4 rounded-[1.2rem] font-black text-sm hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          CONSULTAR REFERÊNCIAS
        </button>
      </div>
    </div>
  );
};
