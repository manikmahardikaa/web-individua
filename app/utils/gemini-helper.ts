/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type JsonAny = Record<string, any>;

export async function callGeminiJSON(
  prompt: string,
  {
    timeoutMs = 60_000,
    maxRetries = 3,
  }: { timeoutMs?: number; maxRetries?: number } = {}
): Promise<JsonAny> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);

      const result = await model.generateContent(
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        },
        { signal: controller.signal as any }
      );

      clearTimeout(t);
      const text = result.response.text().trim();

      // parse JSON aman
      const json = JSON.parse(text);
      return json;
    } catch (err: any) {
      attempt++;
      // quota/429 → backoff
      const status = err?.status ?? err?.response?.status;
      if (status === 429 && attempt <= maxRetries) {
        await new Promise((r) => setTimeout(r, 30_000));
        continue;
      }
      // jika bukan 429 atau sudah melebihi retry → lempar
      throw err;
    }
  }
  throw new Error("Gemini retries exceeded");
}
