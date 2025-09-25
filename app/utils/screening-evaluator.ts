// services/screening-evaluator.ts
import { PrismaClient } from "@prisma/client";
import { callGeminiJSON } from "./gemini-helper";

const prisma = new PrismaClient();

type SessionInput = {
  sessionId: string;
};

type GeminiResult = {
  percentage: number; // 0..100
  riskLevel: "Rendah" | "Sedang" | "Tinggi";
  summary: string; // ringkasan keseluruhan (1–3 paragraf pendek)
  sections: Array<{
    // ringkasan per tema (opsional)
    title: string;
    note: string;
  }>;
  tips: string[]; // poin-poin saran singkat
};

function buildPrompt(
  patientName: string | undefined,
  qaPairs: Array<{ q: string; a: string }>
) {
  const bullets = qaPairs
    .map((x, i) => `Q${i + 1}: ${x.q}\nA${i + 1}: ${x.a}`)
    .join("\n\n");

  return `
Anda adalah asisten kesehatan yang menyusun ringkasan skrining pranikah dalam bahasa Indonesia yang jelas, ramah, dan akurat.
Gunakan pasangan tanya-jawab berikut (jangan menebak bila tidak cukup bukti).

${patientName ? `Nama pasien: ${patientName}\n` : ""}

DATA:
${bullets}

TUGAS:
1) Tentukan tingkat risiko keseluruhan: "Rendah" | "Sedang" | "Tinggi".
2) Berikan skor komposit **percentage** 0..100 (integer). Skor lebih tinggi = risiko lebih rendah.
   - Pertimbangkan pola jawaban secara keseluruhan (riwayat penyakit, gaya hidup, mental, reproduksi, dsb).
3) Tulis "summary" ringkas (maks 120 kata).
4) Tambahkan 3–6 butir "tips" praktis dan spesifik.
5) (Opsional) Sertakan 3–5 "sections" berisi {title, note} untuk highlight area (mis. "Kesehatan Fisik", "Gaya Hidup").

FORMAT: Kembalikan **JSON murni** dengan schema persis:
{
  "percentage": number,                // 0..100 integer
  "riskLevel": "Rendah" | "Sedang" | "Tinggi",
  "summary": string,
  "sections": [{"title": string, "note": string}],
  "tips": [string]
}

Catatan: Jangan sertakan teks di luar JSON.
`;
}

/**
 * Hitung ringkasan & persentase untuk satu AnswerSession, lalu simpan ke DB.
 */
export async function evaluateAndSaveSession({ sessionId }: SessionInput) {
  // 1) Ambil sesi + pasien + jawaban + pertanyaan
  const session = await prisma.answerSession.findUnique({
    where: { id: sessionId },
    include: {
      pasien: { select: { id: true, name: true } },
      answers: {
        include: {
          question: { select: { id: true, question: true } },
          selectedOption: { select: { id: true, value: true } },
        },
      },
    },
  });

  if (!session) throw new Error("Session not found");

  const qaPairs = session.answers.map((a) => ({
    q: a.question.question,
    a: a.selectedOption.value,
  }));

  // 2) Susun prompt & panggil Gemini
  const prompt = buildPrompt(session.pasien?.name ?? undefined, qaPairs);
  let ai: GeminiResult;
  try {
    const json = await callGeminiJSON(prompt);
    // Validasi minimal
    ai = {
      percentage: Math.min(100, Math.max(0, Math.round(json.percentage ?? 0))),
      riskLevel:
        json.riskLevel === "Tinggi"
          ? "Tinggi"
          : json.riskLevel === "Sedang"
          ? "Sedang"
          : "Rendah",
      summary: String(json.summary ?? ""),
      sections: Array.isArray(json.sections) ? json.sections : [],
      tips: Array.isArray(json.tips) ? json.tips : [],
    };
  } catch (e) {
    // fallback jika AI gagal
    ai = {
      percentage: 50,
      riskLevel: "Sedang",
      summary:
        "Ringkasan otomatis gagal dibuat. Silakan coba lagi atau konsultasikan dengan tenaga kesehatan.",
      sections: [],
      tips: [],
    };
  }

  // 3) Bentuk summary yang akan disimpan (gabungkan detail supaya kaya)
  const richSummary = [
    `Tingkat Risiko: ${ai.riskLevel} (${ai.percentage}/100)`,
    "",
    ai.summary,
    ...(ai.sections.length
      ? [
          "",
          "Ringkasan Per Bagian:",
          ...ai.sections.map((s) => `• ${s.title}: ${s.note}`),
        ]
      : []),
    ...(ai.tips.length
      ? ["", "Tips Sehat:", ...ai.tips.map((t) => `• ${t}`)]
      : []),
  ].join("\n");

  // 4) Simpan ke DB
  const updated = await prisma.answerSession.update({
    where: { id: sessionId },
    data: {
      percentage: ai.percentage,
      summary: richSummary,
      submittedAt: new Date(),
    },
  });

  return updated;
}
