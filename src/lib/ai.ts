/**
 * Unified AI provider.
 * Priority: GROQ_API_KEY (free, fast, Llama 3) → ANTHROPIC_API_KEY (premium, Claude)
 *
 * Groq is OpenAI-compatible. Claude uses its own SDK.
 * Callers import from this file instead of @/lib/anthropic.
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL_FAST = "llama-3.1-8b-instant";   // fastest, ~250ms
const GROQ_MODEL_BEST = "llama-3.1-70b-versatile"; // best quality

type Provider = "groq" | "claude" | "none";

function detectProvider(): Provider {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  return "none";
}

async function groqChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? GROQ_MODEL_FAST,
      max_tokens: opts.maxTokens ?? 2048,
      messages,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }
  const json = await res.json() as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content ?? "";
}

async function claudeChat(
  systemPrompt: string,
  userContent: string,
  opts: { maxTokens?: number } = {}
): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // cheapest Claude model for default
    max_tokens: opts.maxTokens ?? 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });
  return resp.content[0].type === "text" ? resp.content[0].text : "";
}

async function aiChat(
  systemPrompt: string,
  userContent: string,
  opts: { maxTokens?: number; preferBest?: boolean } = {}
): Promise<string> {
  const provider = detectProvider();
  if (provider === "groq") {
    const model = opts.preferBest ? GROQ_MODEL_BEST : GROQ_MODEL_FAST;
    return groqChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ], { maxTokens: opts.maxTokens, model });
  }
  if (provider === "claude") {
    return claudeChat(systemPrompt, userContent, { maxTokens: opts.maxTokens });
  }
  throw new Error("Tidak ada AI dikonfigurasi. Set GROQ_API_KEY (gratis) atau ANTHROPIC_API_KEY di Vercel.");
}

function parseJson<T>(text: string): T {
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
  try { return JSON.parse(json) as T; }
  catch { throw new Error(`AI returned invalid JSON: ${text.slice(0, 300)}`); }
}

// ── Public API ───────────────────────────────────────────────

export async function summarizeMeeting(
  transcript: string,
  title: string,
  duration: number
) {
  const text = await aiChat(
    `Kamu adalah asisten meeting kampus Indonesia. Analisis transkrip meeting dan balas HANYA dengan JSON valid:
{
  "summary": "rangkuman 2-3 paragraf dalam Bahasa Indonesia",
  "keyPoints": ["poin 1", "poin 2", "poin 3"],
  "actionItems": ["tugas 1 (penanggung jawab)", "tugas 2"],
  "topics": ["topik1", "topik2"],
  "sentiment": "productive|neutral|challenging"
}`,
    `Judul Meeting: ${title}\nDurasi: ${Math.round(duration / 60)} menit\n\nTranskrip:\n${transcript}`,
    { maxTokens: 2048, preferBest: true }
  );
  return parseJson(text);
}

export async function generateQuiz(
  transcript: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
) {
  const text = await aiChat(
    `Buat 5 soal pilihan ganda dalam Bahasa Indonesia berdasarkan konten meeting/kuliah.
Balas HANYA dengan JSON valid:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}`,
    `Topik: ${topic}\nKesulitan: ${difficulty}\n\nKonten:\n${transcript.slice(0, 4000)}`,
    { maxTokens: 2048 }
  );
  return parseJson(text);
}

export async function extractActionItems(transcript: string) {
  const text = await aiChat(
    `Ekstrak action items dari transkrip meeting. Balas HANYA dengan JSON valid:
{
  "actionItems": [
    {
      "task": "deskripsi tugas",
      "assignee": "nama orang atau 'Semua'",
      "deadline": "petunjuk deadline atau null",
      "priority": "high|medium|low"
    }
  ]
}`,
    transcript,
    { maxTokens: 1024 }
  );
  return parseJson(text);
}

export async function cleanupCaption(rawText: string, language: string): Promise<string> {
  try {
    const result = await aiChat(
      `Perbaiki teks speech recognition. Fix grammar, tanda baca, ejaan. Pertahankan bahasa ${language}. Kembalikan hanya teks yang sudah diperbaiki, tidak ada yang lain.`,
      rawText,
      { maxTokens: 256 }
    );
    return result;
  } catch {
    return rawText; // fallback: return raw if AI fails
  }
}

export { detectProvider };
