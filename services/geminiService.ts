import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FinancialData, AIResponse, AIPersona } from '../types';
import { GeminiApiError } from '../types';


if (!process.env.GEMINI_API_KEY) {
  throw new Error("Variabel lingkungan GEMINI_API_KEY tidak diatur");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getPersonaInstruction = (persona: AIPersona): string => {
    switch (persona) {
        case 'strategic':
            return "Anda adalah seorang Analis Strategis. Fokus utama Anda adalah posisi pasar jangka panjang, keunggulan kompetitif, dan peluang investasi strategis. Analisis Anda harus visioner, berwawasan ke depan, dan berorientasi pada pertumbuhan berkelanjutan.";
        case 'operational':
            return "Anda adalah seorang Ahli Efisiensi Operasional. Fokus utama Anda adalah pada prinsip Lean Healthcare, optimalisasi alur kerja, utilisasi aset secara maksimal, eliminasi pemborosan, dan perbaikan proses yang dapat segera diimplementasikan. Analisis Anda harus taktis, detail, dan berbasis data.";
        case 'financial':
            return "Anda adalah seorang Peramal Keuangan. Fokus utama Anda adalah pada profitabilitas, arus kas, kesehatan neraca, mitigasi risiko finansial, dan dampak kuantitatif dari setiap rekomendasi terhadap bottom-line. Analisis Anda harus cermat, kuantitatif, dan menekankan kelayakan finansial.";
        default:
            return "Anda adalah seorang konsultan manajemen rumah sakit senior internasional.";
    }
}

export const getOptimizationSuggestions = async (data: FinancialData & { atr: number }): Promise<AIResponse> => {
  
  const analysisTarget = data.unitName;
  const isGlobal = analysisTarget === 'Seluruh Rumah Sakit';
  
  const scopeContext = isGlobal
    ? "keseluruhan rumah sakit (skala strategis dan makro)"
    : `unit/departemen spesifik: "${analysisTarget}" (skala operasional dan taktis)`;

  let hospitalTypeContext = data.hospitalType === 'umum' ? 'Rumah Sakit Umum' : 'Rumah Sakit Khusus';
  if (data.hospitalType === 'khusus' && data.hospitalSpecialty) {
      hospitalTypeContext = `Rumah Sakit Khusus dengan fokus pada ${data.hospitalSpecialty}`;
  }

  const bpjsContext = data.bpjsStatus === 'bpjs' ? 'yang mayoritas melayani pasien BPJS Kesehatan' : 'beroperasi sebagai rumah sakit non-BPJS';
  
  const personaInstruction = getPersonaInstruction(data.aiPersona);

  const prompt = `
    ${personaInstruction} Anda memiliki keahlian mendalam dalam efisiensi operasional, optimalisasi aset, dan keuangan layanan kesehatan, khususnya dalam konteks Indonesia.
    Analisis Anda harus sangat tajam, presisi, dan didasarkan pada prinsip-prinsip manajemen modern. Rekomendasi Anda harus strategis, dapat ditindaklanjuti, dan memiliki dampak yang terukur sesuai dengan persona Anda.

    Konteks Rumah Sakit:
    - Tipe: ${hospitalTypeContext}
    - Model Bisnis: ${bpjsContext}

    Lakukan analisis mendalam terhadap data keuangan berikut untuk ${scopeContext}:
    - Pendapatan Bersih: Rp ${data.netRevenue.toLocaleString('id-ID')}
    - Total Aset (Awal Periode): Rp ${data.startAssets.toLocaleString('id-ID')}
    - Total Aset (Akhir Periode): Rp ${data.endAssets.toLocaleString('id-ID')}
    - Rasio Perputaran Aset (ATR) Terhitung: ${data.atr}

    Tugas Anda:
    1. **Analisis Mendalam:** Berikan analisis multidimensional. Jangan hanya menyatakan apakah ATR baik atau buruk. Jelaskan APA ARTINYA bagi rumah sakit dari perspektif:
        a. **Kesehatan Finansial:** Likuiditas, kemampuan menghasilkan pendapatan dari aset.
        b. **Efisiensi Operasional:** Potensi aset yang kurang dimanfaatkan, hambatan alur kerja, atau penjadwalan yang tidak efisien.
        c. **Posisi Strategis:** Bagaimana hal ini dapat memengaruhi kemampuan rumah sakit untuk berinvestasi dalam teknologi baru atau bersaing di pasar.
    
    2. **Rekomendasi Strategis & Terstruktur:** Berikan rekomendasi yang sangat spesifik dan terstruktur, selaras dengan persona Anda. 
        - Kaitkan setiap rekomendasi secara langsung dengan data dan konteks yang diberikan.
        - Untuk konteks ${bpjsContext}, pertimbangkan dampak tarif INA-CBG dan pentingnya manajemen piutang yang efisien.
        - Untuk konteks ${hospitalTypeContext}, fokus pada utilisasi aset khusus berbiaya tinggi.
        - Untuk ${scopeContext}, berikan ${isGlobal ? 'rekomendasi strategis dengan dampak luas di seluruh organisasi.' : 'rekomendasi taktis yang dapat diimplementasikan langsung di tingkat unit.'}

    Berikan respons dalam format JSON dengan struktur berikut:
    {
      "analysis": {
        "financialHealth": "analisis kesehatan finansial...",
        "operationalEfficiency": "analisis efisiensi operasional...",
        "strategicPosition": "analisis posisi strategis..."
      },
      "recommendations": [
        {
          "category": "kategori rekomendasi",
          "suggestions": [
            {
              "action": "tindakan spesifik...",
              "rationale": "alasan dan dampak...",
              "kpi": "indikator kinerja terukur...",
              "implementation_steps": "langkah implementasi...",
              "potential_risk": "risiko dan mitigasi..."
            }
          ]
        }
      ]
    }

    Pastikan semua teks dalam respons menggunakan Bahasa Indonesia yang profesional dan jelas.
  `;

  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      
      const response = await result.response;
      const jsonText = response.text().trim();
      
      // Try to parse JSON, if it fails, extract JSON from markdown
      let parsedResponse: AIResponse;
      try {
        parsedResponse = JSON.parse(jsonText);
      } catch (parseError) {
        // Try to extract JSON from markdown code block
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          throw parseError;
        }
      }
      
      return parsedResponse; // Success

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`);
      
      if (attempt < MAX_RETRIES) {
        const backoffTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
        await delay(backoffTime);
      }
    }
  }

  console.error("All retries failed.", lastError);
  throw new GeminiApiError(
    `Layanan AI tidak merespons setelah ${MAX_RETRIES} percobaan. Ini bisa jadi karena masalah jaringan atau gangguan pada layanan. Silakan coba beberapa saat lagi.`,
    lastError || undefined
  );
};
