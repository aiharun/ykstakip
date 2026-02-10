import { GoogleGenAI } from "@google/genai";
import { StudyEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudyAdvice = async (entries: StudyEntry[]): Promise<string> => {
  if (entries.length === 0) return "Henüz veri girişi yapılmamış. Analiz için lütfen önce çalıştığın dersleri ekle.";

  // Prepare a summary including Net stats
  const summary = entries.slice(0, 50).map(e => {
    const correct = e.correctCount ?? e.questionCount;
    const incorrect = e.incorrectCount ?? 0;
    const net = correct - (incorrect / 4);
    
    return `- ${new Date(e.date).toLocaleDateString('tr-TR')}: ${e.subject} (${e.topic}) - ${correct} Doğru, ${incorrect} Yanlış (${net.toFixed(2)} Net), ${e.durationMinutes} dk.`;
  }).join('\n');

  const prompt = `
    Sen tecrübeli ve motive edici bir YKS (Yükseköğretim Kurumları Sınavı) öğrenci koçusun.
    Aşağıda bir öğrencinin son çalışma kayıtları bulunmaktadır. "Net" hesabı (4 yanlış 1 doğruyu götürür) yapılmıştır.
    
    Bu verileri analiz et ve öğrenciye şunları içeren kısa, markdown formatında bir geri bildirim ver:
    1. Genel bir motivasyon cümlesi.
    2. Hangi derslerde başarılı (yüksek net) ve hangilerinde dikkatsiz veya eksik (çok yanlış) olduğu hakkında bir gözlem.
    3. Yanlış sayısı yüksek olan konular için spesifik bir öneri.
    
    Çok uzun yazma, öz ve vurucu ol. Samimi bir dil kullan ("sen" dili).
    
    Öğrenci Verileri:
    ${summary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analiz oluşturulamadı.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Şu anda yapay zeka koçuna ulaşılamıyor. Lütfen daha sonra tekrar dene.";
  }
};