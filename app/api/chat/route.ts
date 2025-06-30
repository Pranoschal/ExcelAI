import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  const result = await streamText({
    model: groq("qwen-qwq-32b"),
    providerOptions: {
      groq: { reasoningFormat: "parsed" },
    },
    messages : coreMessages
  });

  return result.toDataStreamResponse();
}
