import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI lazily
let ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!ai) {
    // Falls back to API_KEY if GEMINI_API_KEY is not defined in certain environments
    const apiKey = process.env.GEMINI_API_KEY || (process as any).env?.API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY requested but not found in process.env");
      throw new Error('Assistente indisponível: Chave de API não configurada. Verifique as configurações do projeto.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

const DEFAULT_MODEL = "gemini-3-flash-preview";

export async function generateProntuario(patientData: any) {
  const client = getAI();
  const prompt = `Como um médico preceptor do PMMB (Programa Mais Médicos para o Brasil), forneça um "Prontuário Rápido" ultra-objetivo para o caso abaixo:
  Paciente: ${patientData.name}, ${patientData.age} anos. 
  Condição Principal: ${patientData.condition}. 
  
  Siga rigorosamente esta estrutura:
  - PERFIL CLÍNICO: (Resumo técnico do manejo padrão)
  - RISCOS IMEDIATOS: (Alertas baseados na fisiopatologia e diretrizes brasileiras)
  - CONDUTA SUGERIDA: (Passos técnicos objetivos citando protocolos do MS/SUS)
  
  Linguagem técnica formal, objetiva e voltada para médicos bolsistas.`;

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
  });

  return response.text;
}

export async function searchHealthFacilities(query: string, location?: {lat: number, lng: number}) {
  const client = getAI();
  
  let mapPrompt = `Encontre unidades de saúde oficiais para: "${query}". Foco em rede SUS e rede de apoio para médicos.`;
  if (location) {
    mapPrompt += ` Considere a localização próxima a: Latitude:${location.lat}, Longitude:${location.lng}.`;
  }

  const response = await client.models.generateContent({ 
    model: DEFAULT_MODEL,
    contents: mapPrompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    groundingMetadata: (response as any).candidates?.[0]?.groundingMetadata
  };
}

export async function generateTTS(text: string) {
  const client = getAI();
  const response = await client.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: text,
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  // Extract audio from parts
  const candidates = (response as any).candidates;
  if (!candidates?.[0]?.content?.parts) return null;
  
  const audioPart = candidates[0].content.parts.find((part: any) => part.inlineData);
  return audioPart?.inlineData?.data;
}

export async function aiChat(messages: any[]) {
  const client = getAI();
  
  // The SDK expects roles: 'user' or 'model'.
  // We ensure the mapping is correct even if called with 'assistant' or already mapped roles.
  const contents = messages.map(msg => {
    const rawRole = msg.role || (msg.sender === 'me' ? 'user' : 'model');
    const role = (rawRole === 'assistant' || rawRole === 'model') ? 'model' : 'user';
    const text = msg.content || msg.text || (msg.parts && msg.parts[0]?.text) || "";
    
    return {
      role,
      parts: [{ text }]
    };
  });

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents: contents,
    config: {
      systemInstruction: "Você é o 'Cérebro Clínico' da RedeMM, uma plataforma de suporte para médicos do PMMB (Mais Médicos). Seu tom é profissional, técnico, empático e focado nos protocolos do SUS/MS. Suas respostas devem ser precisas e baseadas em evidências. Seja direto e evite introduções longas."
    }
  });

  return response.text;
}
