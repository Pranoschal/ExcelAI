import Groq from "groq-sdk";

const ORPHEUS_MODEL = "canopylabs/orpheus-v1-english";
const ORPHEUS_TERMS_URL =
  "https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english";
const SPEAKABLE_TEXT_PATTERN = /[\p{L}\p{N}]/u;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function groqErrorPayload(error: unknown): {
  message: string;
  code?: string;
} {
  if (error instanceof Groq.APIError) {
    const groqError = error.error as { message?: string; code?: string } | undefined;
    if (groqError?.message) {
      return { message: groqError.message, code: groqError.code };
    }
  }

  if (error instanceof Error) {
    const jsonMatch = error.message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          error?: { message?: string; code?: string };
        };
        if (parsed.error?.message) {
          return {
            message: parsed.error.message,
            code: parsed.error.code,
          };
        }
      } catch {
        // Fall through to generic message.
      }
    }
  }

  return { message: "Failed to generate speech" };
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (
      typeof text !== "string" ||
      !text.trim() ||
      !SPEAKABLE_TEXT_PATTERN.test(text)
    ) {
      return Response.json(
        { error: "Text must contain at least one letter or digit" },
        { status: 400 }
      );
    }

    const wav = await groq.audio.speech.create({
      model: ORPHEUS_MODEL,
      voice: "diana",
      response_format: "wav",
      input: text.trim(),
    });

    const buffer = Buffer.from(await wav.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);

    const { message, code } = groqErrorPayload(error);

    if (code === "model_terms_required") {
      return Response.json(
        {
          error:
            "Groq requires one-time terms acceptance for Orpheus TTS before it can be used.",
          code,
          actionUrl: ORPHEUS_TERMS_URL,
        },
        { status: 403 }
      );
    }

    return Response.json({ error: message, code }, { status: 500 });
  }
}