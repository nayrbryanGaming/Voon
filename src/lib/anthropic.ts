import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const AI_MODEL = "claude-sonnet-4-6";

export async function summarizeMeeting(
  transcript: string,
  title: string,
  duration: number
) {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    system: `You are an academic meeting assistant for Indonesian university.
Analyze the meeting transcript and respond ONLY with valid JSON:
{
  "summary": "2-3 paragraph summary in Indonesian",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "actionItems": ["action 1 (person)", "action 2 (person)"],
  "topics": ["topic1", "topic2"],
  "sentiment": "productive|neutral|challenging"
}`,
    messages: [
      {
        role: "user",
        content: `Meeting Title: ${title}\nDuration: ${Math.round(duration / 60)} minutes\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
  return JSON.parse(json);
}

export async function generateQuiz(
  transcript: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
) {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    system: `Generate a 5-question multiple choice quiz in Indonesian based on the meeting/lecture content.
Respond ONLY with valid JSON:
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
    messages: [
      {
        role: "user",
        content: `Topic: ${topic}\nDifficulty: ${difficulty}\n\nContent:\n${transcript.slice(0, 4000)}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
  return JSON.parse(json);
}

export async function extractActionItems(transcript: string) {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: `Extract action items from the meeting transcript. Respond ONLY with valid JSON:
{
  "actionItems": [
    {
      "task": "description of task",
      "assignee": "person name or 'Semua' for everyone",
      "deadline": "deadline hint or null",
      "priority": "high|medium|low"
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: transcript,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
  return JSON.parse(json);
}

export async function cleanupCaption(rawText: string, language: string) {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 256,
    system: `Clean up speech recognition text. Fix grammar, punctuation, and spelling. Keep the language as ${language}. Return only the cleaned text, nothing else.`,
    messages: [{ role: "user", content: rawText }],
  });

  return response.content[0].type === "text" ? response.content[0].text : rawText;
}
