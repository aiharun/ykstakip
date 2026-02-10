import { GoogleGenAI } from "@google/genai";
import { StudyEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prepareSummary = (entries: StudyEntry[]): string => {
  if (entries.length === 0) return "Henüz veri yok.";
  return entries.slice(0, 50).map(e => {
    const correct = e.correctCount ?? e.questionCount;
    const incorrect = e.incorrectCount ?? 0;
    const net = correct - (incorrect / 4);
    return `- ${new Date(e.date).toLocaleDateString('tr-TR')}: ${e.subject} (${e.topic}) - ${correct} Doğru, ${incorrect} Yanlış (${net.toFixed(2)} Net), ${e.durationMinutes} dk.`;
  }).join('\n');
};

const callGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || "Analiz oluşturulamadı.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Şu anda yapay zeka koçuna ulaşılamıyor. Lütfen daha sonra tekrar dene.";
  }
};

export const getStudyAdvice = async (entries: StudyEntry[]): Promise<string> => {
  if (entries.length === 0) return "Henüz veri girişi yapılmamış. Analiz için lütfen önce çalıştığın dersleri ekle.";

  const summary = prepareSummary(entries);
  const prompt = `
    Sen tecrübeli ve motive edici bir YKS (Yükseköğretim Kurumları Sınavı) öğrenci koçusun.
    Aşağıda bir öğrencinin son çalışma kayıtları bulunmaktadır. "Net" hesabı (4 yanlış 1 doğruyu götürür) yapılmıştır.
    
    Bu verileri analiz et ve öğrenciye şunları içeren kısa, markdown formatında bir geri bildirim ver:
    1. Genel bir motivasyon cümlesi.
    2. Hangi derslerde başarılı (yüksek net) ve hangilerinde dikkatsiz veya eksik (çok yanlış) olduğu hakkında bir gözlem.
    3. Yanlış sayısı yüksek olan konular için spesifik bir öneri.
    4. Uzun süredir çalışılmayan dersler varsa, "tekrar zamanı geldi" uyarısı ver.
    
    Çok uzun yazma, öz ve vurucu ol. Samimi bir dil kullan ("sen" dili).
    
    Öğrenci Verileri:
    ${summary}
  `;

  return callGemini(prompt);
};

export const getWeeklyPlan = async (entries: StudyEntry[]): Promise<string> => {
  if (entries.length === 0) return "Haftalık plan oluşturmak için önce birkaç çalışma kaydı eklemelisin.";

  const summary = prepareSummary(entries);

  // Analyze subject distribution
  const subjectStats: Record<string, { total: number; netSum: number; count: number }> = {};
  entries.forEach(e => {
    if (!subjectStats[e.subject]) subjectStats[e.subject] = { total: 0, netSum: 0, count: 0 };
    const correct = e.correctCount ?? e.questionCount;
    const incorrect = e.incorrectCount ?? 0;
    subjectStats[e.subject].total += e.questionCount;
    subjectStats[e.subject].netSum += correct - (incorrect / 4);
    subjectStats[e.subject].count += 1;
  });

  const statsText = Object.entries(subjectStats)
    .map(([subject, stats]) => `${subject}: Toplam ${stats.total} soru, Ortalama Net: ${(stats.netSum / stats.count).toFixed(2)}, ${stats.count} kayıt`)
    .join('\n');

  const prompt = `
    Sen deneyimli bir YKS (Yükseköğretim Kurumları Sınavı) çalışma planı uzmanısın.
    
    Aşağıda bir öğrencinin ders bazlı performans istatistikleri ve son çalışma kayıtları var:
    
    Ders İstatistikleri:
    ${statsText}
    
    Son Kayıtlar:
    ${summary}
    
    Bu öğrenci için kişiselleştirilmiş bir 7 günlük (Pazartesi-Pazar) çalışma programı oluştur.
    
    Kurallar:
    - Zayıf dersler (düşük net) için DAHA FAZLA süre ayır
    - Güçlü derslerin pratiğini tamamen bırakma ama daha az süre ver
    - Günlük toplam çalışma 5-8 saat olsun
    - Her gün 2-3 farklı ders olsun
    - Haftada en az 1 deneme sınavı çözümü planla
    - Aralıklı tekrar kuralını uygula (3 gün önce çalışılan konuları tekrar programla)
    
    Formatı:
    Her gün için:
    ## 📅 [Gün adı]
    - **[Saat aralığı]** — [Ders]: [Konu/Aktivite]
    
    Sonunda kısa bir motivasyon mesajı ekle. Samimi dil kullan.
  `;

  return callGemini(prompt);
};

export const getPerformanceAnalysis = async (entries: StudyEntry[]): Promise<string> => {
  if (entries.length === 0) return "Performans analizi yapabilmem için birkaç çalışma kaydın olmalı.";

  const summary = prepareSummary(entries);

  // Compute detailed stats
  const subjectStats: Record<string, { totalQ: number; totalCorrect: number; totalIncorrect: number; totalMinutes: number; count: number; lastDate: string }> = {};
  entries.forEach(e => {
    const correct = e.correctCount ?? e.questionCount;
    const incorrect = e.incorrectCount ?? 0;
    if (!subjectStats[e.subject]) {
      subjectStats[e.subject] = { totalQ: 0, totalCorrect: 0, totalIncorrect: 0, totalMinutes: 0, count: 0, lastDate: e.date };
    }
    subjectStats[e.subject].totalQ += e.questionCount;
    subjectStats[e.subject].totalCorrect += correct;
    subjectStats[e.subject].totalIncorrect += incorrect;
    subjectStats[e.subject].totalMinutes += e.durationMinutes;
    subjectStats[e.subject].count += 1;
    if (e.date > subjectStats[e.subject].lastDate) {
      subjectStats[e.subject].lastDate = e.date;
    }
  });

  const statsText = Object.entries(subjectStats)
    .map(([subject, s]) => {
      const net = s.totalCorrect - (s.totalIncorrect / 4);
      const accuracy = s.totalQ > 0 ? ((s.totalCorrect / s.totalQ) * 100).toFixed(1) : '0';
      const avgSpeed = s.totalMinutes > 0 ? (s.totalQ / s.totalMinutes * 60).toFixed(1) : '0';
      const daysSince = Math.floor((Date.now() - new Date(s.lastDate).getTime()) / (1000 * 60 * 60 * 24));
      return `${subject}: ${s.totalQ} soru, ${net.toFixed(2)} net, %${accuracy} doğruluk, ${avgSpeed} soru/saat, ${s.totalMinutes} dk süre, son çalışma ${daysSince} gün önce`;
    })
    .join('\n');

  const prompt = `
    Sen bir eğitim veri analisti ve YKS uzmanısın.
    
    Aşağıda bir öğrencinin tüm ders bazlı performans verileri var:
    
    ${statsText}
    
    Detaylı bir performans raporu oluştur. Şu başlıkları kullan:
    
    ## 💪 Güçlü Yönler
    Yüksek net ve doğruluk oranına sahip dersler. Neden iyi olduğuna dair kısa analiz.
    
    ## ⚠️ Geliştirilmesi Gereken Alanlar
    Düşük net veya yüksek yanlış oranına sahip dersler. Spesifik öneriler.
    
    ## ⏰ Tekrar Gereken Konular
    Uzun süredir çalışılmayan dersler (3+ gün). Aralıklı tekrar hatırlatması.
    
    ## 📊 Verimlilik Analizi
    Soru çözme hızı (soru/saat) değerlendirmesi. Hangi derslerde yavaş, hangisinde hızlı.
    
    ## 🎯 Öncelik Sıralaması
    Bu hafta hangi derslere öncelik vermeli? Sıralı liste.
    
    Kısa ve öz yaz. Samimi dil kullan.
  `;

  return callGemini(prompt);
};