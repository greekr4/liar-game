import OpenAI from "openai";
import type { TopicPair } from "@/lib/game/topics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTopicPair(category: string): Promise<TopicPair> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 라이어 게임 출제자입니다. 주어진 카테고리에서 비슷하지만 다른 한국어 단어 2개를 생성하세요. " +
          "두 단어는 같은 카테고리에 속하지만 서로 헷갈릴 수 있는 쌍이어야 합니다. " +
          "예를 들어, 카테고리가 '과일'이면 '사과'와 '배'처럼 서로 헷갈릴 수 있는 단어를 생성해야 합니다. " +
          "한국어 '등반' 영어 '클라이밍' 이런 번역어는 안됩니다. " +
          "반드시 아래 JSON 형식으로만 응답하세요:\n" +
          '{"wordA": "단어1", "wordB": "단어2"}',
      },
      {
        role: "user",
        content: `카테고리: ${category}`,
      },
    ],
    temperature: 1.0,
    max_tokens: 100,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI 응답이 비어있습니다");

  const parsed = JSON.parse(content) as { wordA?: string; wordB?: string };

  if (
    !parsed.wordA ||
    !parsed.wordB ||
    typeof parsed.wordA !== "string" ||
    typeof parsed.wordB !== "string"
  ) {
    throw new Error("OpenAI 응답 형식이 올바르지 않습니다");
  }

  return {
    category,
    wordA: parsed.wordA,
    wordB: parsed.wordB,
  };
}
