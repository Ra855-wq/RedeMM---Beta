import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI lazily
let ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!ai) {
    // In Vite, we use process.env.GEMINI_API_KEY as per the platform configuration
    // which injects it into the bundle for these specific apps.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please check your environment variables.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateProntuario(patientData: any) {
  const client = getAI();
  const prompt = `Como um médico preceptor do PMMB, forneça um "Prontuário Rápido" ultra-objetivo para o caso abaixo:
  Paciente: ${patientData.name}, ${patientData.age} anos. 
  Condição Principal: ${patientData.condition}. 
  
  Siga rigorosamente esta estrutura:
  - PERFIL CLÍNICO: (2 linhas sobre o manejo padrão)
  - RISCOS IMEDIATOS: (Alertas baseados na idade e patologia)
  - CONDUTA SUGERIDA: (3 passos técnicos citando protocolos brasileiros do PMMB)
  
  Seja conciso, use linguagem médica de alto nível.`;

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });

  return response.text;
}

export async function searchHealthFacilities(query: string) {
  const client = getAI();
  const response = await client.models.generateContent({ 
    model: "gemini-2.0-flash-exp",
    contents: `Encontre unidades de saúde oficiais para: "${query}". Foco em rede SUS para médicos bolsistas PMMB.`,
    config: {
      // @ts-ignore
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    // @ts-ignore
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
}

export async function generateTTS(text: string) {
  const client = getAI();
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: text,
    config: {
      // @ts-ignore
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  // @ts-ignore
  return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
}

export async function aiChat(messages: any[]) {
  const client = getAI();
  
  // Convert messages to SDK format
  const chatHistory = messages.slice(0, -1).map(m => ({
    role: m.role || (m.sender === 'me' ? 'user' : 'model'),
    parts: [{ text: m.text || (m.parts && m.parts[0].text) }]
  }));

  const lastMessage = messages[messages.length - 1];
  const lastText = lastMessage.text || (lastMessage.parts && lastMessage.parts[0].text);

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [
      ...chatHistory,
      { role: 'user', parts: [{ text: lastText }] }
    ]
  });

  return response.text;
}
