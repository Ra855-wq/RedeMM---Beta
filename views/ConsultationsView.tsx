
import React, { useState } from 'react';
import { 
  Plus, Trash2, Calendar, ClipboardList, CheckCircle2, 
  X, Activity, HeartPulse, Stethoscope, AlertTriangle, 
  FileText, Loader2, Zap, Printer, ArrowRight, Users, Bot,
  ShieldCheck, Hash, Pill, Clock, User, GraduationCap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Patient {
  id: string;
  name: string;
  age: string;
  condition: string;
  date: string;
}

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  instructions: string;
}

export const ConsultationsView: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'Maria do Socorro', age: '62', condition: 'Hipertensa e Diabética Tipo 2', date: '12/10/2024' },
    { id: '2', name: 'João Pereira', age: '45', condition: 'Asma Grave e Obesidade Grau I', date: '14/10/2024' },
    { id: '3', name: 'Antônio Carlos', age: '70', condition: 'Insuficiência Cardíaca (NYHA II)', date: '15/10/2024' },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', condition: '' });

  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { id: '1', medication: 'Metformina 850mg', dosage: '1 comprimido 2x ao dia', instructions: 'Tomar após o café e após o jantar.' }
  ]);
  const [currentPrescriptionHash, setCurrentPrescriptionHash] = useState('');

  const generateHash = () => {
    return 'PMM-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 4).toUpperCase();
  };

  const addPatient = () => {
    if (!newPatient.name) return;
    const patient: Patient = {
      ...newPatient,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR')
    };
    setPatients([patient, ...patients]);
    setNewPatient({ name: '', age: '', condition: '' });
    setIsAdding(false);
  };

  const removePatient = (id: string) => setPatients(patients.filter(p => p.id !== id));

  const openQuickRecord = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsRecordOpen(true);
    setIsLoadingAnalysis(true);
    setAiAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como um médico preceptor do PMMB, forneça um "Prontuário Rápido" ultra-objetivo para o caso abaixo:
        Paciente: ${patient.name}, ${patient.age} anos. 
        Condição Principal: ${patient.condition}. 
        
        Siga rigorosamente esta estrutura:
        - PERFIL CLÍNICO: (2 linhas sobre o manejo padrão)
        - RISCOS IMEDIATOS: (Alertas baseados na idade e patologia)
        - CONDUTA SUGERIDA: (3 passos técnicos citando protocolos brasileiros do PMMB)
        
        Seja conciso, use linguagem médica de alto nível.`,
      });
      setAiAnalysis(response.text || 'Análise indisponível.');
    } catch (error) {
      setAiAnalysis('Erro de conexão clínica.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const openPrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentPrescriptionHash(generateHash());
    setIsPrescriptionOpen(true);
    setIsRecordOpen(false);
  };

  const addPrescriptionItem = () => {
    const newItem: PrescriptionItem = { id: Math.random().toString(36).substr(2, 9), medication: '', dosage: '', instructions: '' };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const updatePrescriptionItem = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionItems(prescriptionItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-10 animate-zoom-fade">
      {/* Header Gestão Bolsista */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-surgical flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-neutral-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gestão PMMB</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Painel do Bolsista · RMS/MS Ativo</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-accent-600 hover:bg-accent-700 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-surgical-xl transition-all flex items-center gap-3 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> CADASTRAR PACIENTE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {patients.map((p) => (
          <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-surgical hover:shadow-surgical-xl transition-all duration-700 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-accent-600 shadow-inner group-hover:bg-accent-600 group-hover:text-white transition-all duration-700">
                <ClipboardList size={28} />
              </div>
              <button onClick={() => removePatient(p.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2 truncate group-hover:text-accent-600 transition-colors leading-tight">{p.name}</h3>
            
            <div className="space-y-3 mb-10">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar size={16} className="text-accent-500" /> CADASTRADO EM {p.date}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-emerald-500" /> {p.age} ANOS · {p.condition}
              </div>
            </div>

            <button 
              onClick={() => openQuickRecord(p)}
              className="w-full py-5 bg-slate-50 group-hover:bg-neutral-900 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <FileText size={16} /> PRONTUÁRIO BOLSISTA
            </button>
          </div>
        ))}
      </div>

      {/* Modal Prontuário */}
      {isRecordOpen && selectedPatient && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-surgical-xl border border-white relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-neutral-900 text-white shrink-0 relative">
               <div className="absolute top-0 right-0 w-80 h-80 bg-accent-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
               <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-accent-600 rounded-xl flex items-center justify-center shadow-2xl">
                       <Stethoscope size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tighter uppercase">Análise Preceptoria</h3>
                       <p className="text-[9px] font-black text-accent-400 uppercase tracking-[0.4em]">Surgical Intelligence v3.1</p>
                    </div>
                  </div>
                  <button onClick={() => setIsRecordOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <X size={20} />
                  </button>
               </div>
               <div className="mt-8 flex gap-8 items-center border-t border-white/10 pt-6">
                  <div><p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Paciente</p><p className="text-lg font-bold">{selectedPatient.name}</p></div>
                  <div><p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Idade</p><p className="text-lg font-bold">{selectedPatient.age} Anos</p></div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scroll space-y-8 bg-slate-50/50">
               {isLoadingAnalysis ? (
                 <div className="py-16 flex flex-col items-center justify-center gap-6"><Loader2 className="animate-spin text-accent-600" size={48} /><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultando IA Preceptoria...</p></div>
               ) : (
                 <div className="space-y-6 animate-zoom-fade">
                    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-surgical whitespace-pre-wrap text-sm font-bold text-slate-800 leading-relaxed italic border-l-4 border-accent-600 pl-8">{aiAnalysis}</div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => openPrescription(selectedPatient)} className="flex items-center justify-center gap-3 p-5 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-600 transition-all shadow-surgical-xl active:scale-95">
                          <ArrowRight size={18} /> Prescrição PMMB
                       </button>
                       <button className="flex items-center justify-center gap-3 p-5 bg-white text-accent-600 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-surgical active:scale-95">
                          <Printer size={18} /> Imprimir Relatório
                       </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Receituário */}
      {isPrescriptionOpen && selectedPatient && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-slate-900/70 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-surgical-xl border border-white relative overflow-hidden flex flex-col max-h-[96vh] printable-area animate-zoom-fade">
            <div className="p-10 md:p-12 bg-neutral-900 text-white shrink-0 no-print">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-accent-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                      <Pill size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">RECEITUÁRIO BOLSISTA</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-accent-400 uppercase tracking-[0.5em] mt-2">PMMB Digital Prescription · RMS Validated</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPrescriptionOpen(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-[1.5rem] transition-all">
                    <X size={24} />
                  </button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 border-t border-white/10 pt-8">
                  <div className="space-y-1"><p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Paciente</p><p className="text-xl md:text-2xl font-bold truncate">{selectedPatient.name}</p></div>
                  <div className="space-y-1"><p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">CRM / RMS</p><p className="text-xl md:text-2xl font-bold truncate">RMS/MS Ativo</p></div>
                  <div className="space-y-1"><p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">ID PMMB</p><p className="text-xl md:text-2xl font-bold">#772154</p></div>
                  <div className="bg-accent-600/10 p-4 md:p-6 rounded-[1.8rem] border border-accent-600/20">
                    <p className="text-[9px] font-black text-accent-400 uppercase tracking-[0.2em] mb-1">Hash Segura</p>
                    <p className="text-xs md:text-sm font-black font-mono">{currentPrescriptionHash}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 md:p-12 custom-scroll bg-white">
               <div className="space-y-10 max-w-4xl mx-auto">
                  <div className="space-y-8">
                    {prescriptionItems.map((item, index) => (
                      <div key={item.id} className="bg-slate-50/50 p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:border-accent-200 transition-all">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-24 bg-accent-600 rounded-full"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                          <div className="space-y-6">
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Medicamento</label>
                              <input type="text" value={item.medication} onChange={(e) => updatePrescriptionItem(item.id, 'medication', e.target.value)} className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-8 py-4 text-lg font-black text-slate-900 focus:ring-4 focus:ring-accent-50 transition-all outline-none" />
                            </div>
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Posologia</label>
                              <input type="text" value={item.dosage} onChange={(e) => updatePrescriptionItem(item.id, 'dosage', e.target.value)} className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-8 py-4 text-base font-bold text-slate-700 focus:ring-4 focus:ring-accent-50 transition-all outline-none" />
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observações</label>
                            <textarea value={item.instructions} onChange={(e) => updatePrescriptionItem(item.id, 'instructions', e.target.value)} rows={5} className="w-full bg-white border border-slate-200 rounded-[2rem] p-8 text-sm font-medium text-slate-600 focus:ring-4 focus:ring-accent-50 transition-all outline-none resize-none leading-relaxed" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={addPrescriptionItem} className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 hover:border-accent-400 hover:text-accent-600 hover:bg-accent-50/10 transition-all flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] no-print">
                    <Plus size={28} /> Adicionar Item
                  </button>
                  
                  <div className="pt-16 border-t border-slate-100 flex justify-between items-end pb-8">
                     <div className="space-y-2 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Protocolo PMMB 3.1 · RMS Validado</p>
                        <p className="text-xs font-mono">{currentPrescriptionHash}</p>
                     </div>
                     <div className="text-right space-y-2">
                        <div className="h-1 w-64 bg-neutral-900 ml-auto mb-2"></div>
                        <p className="text-xl font-black text-slate-900 leading-none">Dr. Rafael Araujo</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">RMS/MS 123.456.789-00 · Médico Bolsista</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 md:p-14 bg-slate-50 border-t border-slate-100 flex gap-6 md:gap-8 no-print shrink-0">
               <button onClick={() => window.print()} className="flex-1 bg-neutral-900 text-white py-6 md:py-8 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.3em] shadow-surgical-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 transform active:scale-95">
                 <Printer size={24} /> IMPRIMIR RECEITUÁRIO
               </button>
               <button className="flex-1 bg-white text-accent-600 border border-accent-100 py-6 md:py-8 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-accent-50 transition-all flex items-center justify-center gap-4 transform active:scale-95">
                 <ShieldCheck size={24} /> ASSINATURA DIGITAL
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
