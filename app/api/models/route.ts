import { getGroqModels } from "@/ai/groq-models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getGroqModels();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Models API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load models";

    return NextResponse.json({ errorMessage }, { status: 500 });
  }
}
